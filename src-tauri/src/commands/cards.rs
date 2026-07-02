use crate::commands::tags::load_tags_for_card;
use crate::db::DbState;
use crate::models::{
    ArchiveCardInput, Card, CardDetail, CardSummary, CreateCardInput, MoveCardInput,
    ReorderCardsInput, UpdateCardInput,
};
use crate::util::{map_db_err, new_id, now_iso, validate_title};
use rusqlite::{params, Connection};
use tauri::State;

fn row_to_card(row: &rusqlite::Row<'_>) -> rusqlite::Result<Card> {
    Ok(Card {
        id: row.get(0)?,
        column_id: row.get(1)?,
        title: row.get(2)?,
        description: row.get(3)?,
        priority: row.get(4)?,
        due_date: row.get(5)?,
        notes: row.get(6)?,
        archived: row.get::<_, i64>(7)? != 0,
        order_index: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}

fn row_to_card_summary_base(row: &rusqlite::Row<'_>) -> rusqlite::Result<(String, String, String, Option<String>, Option<String>, bool, i64, i64, i64)> {
    Ok((
        row.get(0)?,
        row.get(1)?,
        row.get(2)?,
        row.get(3)?,
        row.get(4)?,
        row.get::<_, i64>(5)? != 0,
        row.get(6)?,
        row.get(7)?,
        row.get(8)?,
    ))
}

fn enrich_summary(
    conn: &Connection,
    base: (String, String, String, Option<String>, Option<String>, bool, i64, i64, i64),
) -> rusqlite::Result<CardSummary> {
    let (id, column_id, title, priority, due_date, archived, order_index, checklist_total, checklist_done) = base;
    let tags = load_tags_for_card(conn, &id)?;
    Ok(CardSummary {
        id,
        column_id,
        title,
        priority,
        due_date,
        archived,
        order_index,
        checklist_done,
        checklist_total,
        tags,
    })
}

#[tauri::command]
pub fn list_cards(
    state: State<'_, DbState>,
    column_id: String,
    include_archived: Option<bool>,
) -> Result<Vec<CardSummary>, String> {
    let include = include_archived.unwrap_or(false);
    crate::db::with_connection(&state, |conn| {
        let sql = if include {
            "SELECT c.id, c.column_id, c.title, c.priority, c.due_date, c.archived, c.order_index,
             (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id) AS checklist_total,
             (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id AND ci.completed = 1) AS checklist_done
             FROM cards c WHERE c.column_id = ?1 ORDER BY c.order_index ASC"
        } else {
            "SELECT c.id, c.column_id, c.title, c.priority, c.due_date, c.archived, c.order_index,
             (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id) AS checklist_total,
             (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id AND ci.completed = 1) AS checklist_done
             FROM cards c WHERE c.column_id = ?1 AND c.archived = 0 ORDER BY c.order_index ASC"
        };
        let mut stmt = conn.prepare(sql)?;
        let bases: Vec<_> = stmt
            .query_map(params![column_id], row_to_card_summary_base)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        bases.into_iter().map(|b| enrich_summary(conn, b)).collect()
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn get_card(state: State<'_, DbState>, id: String) -> Result<CardDetail, String> {
    crate::db::with_connection(&state, |conn| {
        let card = conn.query_row(
            "SELECT id, column_id, title, description, priority, due_date, notes, archived, order_index, created_at, updated_at FROM cards WHERE id = ?1",
            params![id],
            row_to_card,
        )?;
        let tags = load_tags_for_card(conn, &id)?;
        let mut stmt = conn.prepare(
            "SELECT id, card_id, text, completed, order_index FROM checklist_items WHERE card_id = ?1 ORDER BY order_index ASC",
        )?;
        let checklist = stmt
            .query_map(params![id], |row| {
                Ok(crate::models::ChecklistItem {
                    id: row.get(0)?,
                    card_id: row.get(1)?,
                    text: row.get(2)?,
                    completed: row.get::<_, i64>(3)? != 0,
                    order_index: row.get(4)?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(CardDetail {
            card,
            tags,
            checklist,
        })
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn create_card(state: State<'_, DbState>, input: CreateCardInput) -> Result<Card, String> {
    validate_title(&input.title)?;
    crate::db::with_connection(&state, |conn| {
        let max_order: i64 = conn
            .query_row(
                "SELECT COALESCE(MAX(order_index), -1) FROM cards WHERE column_id = ?1",
                params![input.column_id],
                |row| row.get(0),
            )
            .unwrap_or(-1);
        let id = new_id();
        let now = now_iso();
        let title = input.title.trim().to_string();
        let order_index = max_order + 1;
        conn.execute(
            "INSERT INTO cards (id, column_id, title, description, priority, due_date, notes, archived, order_index, created_at, updated_at) VALUES (?1, ?2, ?3, NULL, NULL, NULL, NULL, 0, ?4, ?5, ?6)",
            params![id, input.column_id, title, order_index, now, now],
        )?;
        Ok(Card {
            id,
            column_id: input.column_id,
            title,
            description: None,
            priority: None,
            due_date: None,
            notes: None,
            archived: false,
            order_index,
            created_at: now.clone(),
            updated_at: now,
        })
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn update_card(state: State<'_, DbState>, input: UpdateCardInput) -> Result<Card, String> {
    if let Some(ref title) = input.title {
        validate_title(title)?;
    }
    crate::db::with_connection(&state, |conn| {
        let mut current = conn.query_row(
            "SELECT id, column_id, title, description, priority, due_date, notes, archived, order_index, created_at, updated_at FROM cards WHERE id = ?1",
            params![input.id],
            row_to_card,
        )?;
        if let Some(title) = input.title {
            current.title = title.trim().to_string();
        }
        if let Some(description) = input.description {
            current.description = if description.is_empty() {
                None
            } else {
                Some(description)
            };
        }
        if let Some(priority) = input.priority {
            current.priority = if priority.is_empty() {
                None
            } else {
                Some(priority)
            };
        }
        if let Some(due_date) = input.due_date {
            current.due_date = if due_date.is_empty() {
                None
            } else {
                Some(due_date)
            };
        }
        if let Some(notes) = input.notes {
            current.notes = if notes.is_empty() {
                None
            } else {
                Some(notes)
            };
        }
        let now = now_iso();
        conn.execute(
            "UPDATE cards SET title = ?1, description = ?2, priority = ?3, due_date = ?4, notes = ?5, updated_at = ?6 WHERE id = ?7",
            params![
                current.title,
                current.description,
                current.priority,
                current.due_date,
                current.notes,
                now,
                input.id
            ],
        )?;
        current.updated_at = now;
        Ok(current)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn move_card(state: State<'_, DbState>, input: MoveCardInput) -> Result<Card, String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute(
            "UPDATE cards SET column_id = ?1, order_index = ?2, updated_at = ?3 WHERE id = ?4",
            params![input.column_id, input.order_index, now_iso(), input.id],
        )?;
        conn.query_row(
            "SELECT id, column_id, title, description, priority, due_date, notes, archived, order_index, created_at, updated_at FROM cards WHERE id = ?1",
            params![input.id],
            row_to_card,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn reorder_cards(
    state: State<'_, DbState>,
    input: ReorderCardsInput,
) -> Result<Vec<CardSummary>, String> {
    crate::db::with_connection(&state, |conn| {
        let tx = conn.unchecked_transaction()?;
        let now = now_iso();
        for (index, card_id) in input.ordered_ids.iter().enumerate() {
            tx.execute(
                "UPDATE cards SET order_index = ?1, column_id = ?2, updated_at = ?3 WHERE id = ?4",
                params![index as i64, input.column_id, now, card_id],
            )?;
        }
        tx.commit()?;
        list_cards_internal(conn, &input.column_id, false)
    })
    .map_err(map_db_err)
}

pub fn list_cards_internal(
    conn: &Connection,
    column_id: &str,
    include_archived: bool,
) -> rusqlite::Result<Vec<CardSummary>> {
    let sql = if include_archived {
        "SELECT c.id, c.column_id, c.title, c.priority, c.due_date, c.archived, c.order_index,
         (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id) AS checklist_total,
         (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id AND ci.completed = 1) AS checklist_done
         FROM cards c WHERE c.column_id = ?1 ORDER BY c.order_index ASC"
    } else {
        "SELECT c.id, c.column_id, c.title, c.priority, c.due_date, c.archived, c.order_index,
         (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id) AS checklist_total,
         (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id AND ci.completed = 1) AS checklist_done
         FROM cards c WHERE c.column_id = ?1 AND c.archived = 0 ORDER BY c.order_index ASC"
    };
    let mut stmt = conn.prepare(sql)?;
    let bases: Vec<_> = stmt
        .query_map(params![column_id], row_to_card_summary_base)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    bases.into_iter().map(|b| enrich_summary(conn, b)).collect()
}

#[tauri::command]
pub fn duplicate_card(state: State<'_, DbState>, id: String) -> Result<Card, String> {
    crate::db::with_connection(&state, |conn| {
        let source = conn.query_row(
            "SELECT id, column_id, title, description, priority, due_date, notes, archived, order_index, created_at, updated_at FROM cards WHERE id = ?1",
            params![id],
            row_to_card,
        )?;
        let max_order: i64 = conn.query_row(
            "SELECT COALESCE(MAX(order_index), -1) FROM cards WHERE column_id = ?1",
            params![source.column_id],
            |row| row.get(0),
        )?;
        let new_card_id = new_id();
        let now = now_iso();
        let title = format!("{} (copy)", source.title);
        let order_index = max_order + 1;
        conn.execute(
            "INSERT INTO cards (id, column_id, title, description, priority, due_date, notes, archived, order_index, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8, ?9, ?10)",
            params![
                new_card_id,
                source.column_id,
                title,
                source.description,
                source.priority,
                source.due_date,
                source.notes,
                order_index,
                now,
                now
            ],
        )?;
        let mut stmt = conn.prepare(
            "SELECT id, card_id, text, completed, order_index FROM checklist_items WHERE card_id = ?1",
        )?;
        let items: Vec<crate::models::ChecklistItem> = stmt
            .query_map(params![id], |row| {
                Ok(crate::models::ChecklistItem {
                    id: row.get(0)?,
                    card_id: row.get(1)?,
                    text: row.get(2)?,
                    completed: row.get::<_, i64>(3)? != 0,
                    order_index: row.get(4)?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        for item in items {
            conn.execute(
                "INSERT INTO checklist_items (id, card_id, text, completed, order_index) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![
                    new_id(),
                    new_card_id,
                    item.text,
                    item.completed as i64,
                    item.order_index
                ],
            )?;
        }
        let tag_ids: Vec<String> = conn
            .prepare("SELECT tag_id FROM card_tags WHERE card_id = ?1")?
            .query_map(params![id], |row| row.get(0))?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        for tag_id in tag_ids {
            conn.execute(
                "INSERT INTO card_tags (card_id, tag_id) VALUES (?1, ?2)",
                params![new_card_id, tag_id],
            )?;
        }
        Ok(Card {
            id: new_card_id,
            column_id: source.column_id,
            title,
            description: source.description,
            priority: source.priority,
            due_date: source.due_date,
            notes: source.notes,
            archived: false,
            order_index,
            created_at: now.clone(),
            updated_at: now,
        })
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn archive_card(state: State<'_, DbState>, input: ArchiveCardInput) -> Result<Card, String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute(
            "UPDATE cards SET archived = ?1, updated_at = ?2 WHERE id = ?3",
            params![input.archived as i64, now_iso(), input.id],
        )?;
        conn.query_row(
            "SELECT id, column_id, title, description, priority, due_date, notes, archived, order_index, created_at, updated_at FROM cards WHERE id = ?1",
            params![input.id],
            row_to_card,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_card(state: State<'_, DbState>, id: String) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute("DELETE FROM cards WHERE id = ?1", params![id])?;
        Ok(())
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn move_card_to_column(
    state: State<'_, DbState>,
    id: String,
    column_id: String,
) -> Result<Card, String> {
    crate::db::with_connection(&state, |conn| {
        let max_order: i64 = conn.query_row(
            "SELECT COALESCE(MAX(order_index), -1) FROM cards WHERE column_id = ?1",
            params![column_id],
            |row| row.get(0),
        )?;
        let order_index = max_order + 1;
        conn.execute(
            "UPDATE cards SET column_id = ?1, order_index = ?2, updated_at = ?3 WHERE id = ?4",
            params![column_id, order_index, now_iso(), id],
        )?;
        conn.query_row(
            "SELECT id, column_id, title, description, priority, due_date, notes, archived, order_index, created_at, updated_at FROM cards WHERE id = ?1",
            params![id],
            row_to_card,
        )
    })
    .map_err(map_db_err)
}
