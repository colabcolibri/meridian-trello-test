use crate::db::DbState;
use crate::models::{CreateTagInput, SetCardTagsInput, Tag};
use crate::util::{map_db_err, new_id, validate_name};
use rusqlite::{params, Connection};
use tauri::State;

fn row_to_tag(row: &rusqlite::Row<'_>) -> rusqlite::Result<Tag> {
    Ok(Tag {
        id: row.get(0)?,
        board_id: row.get(1)?,
        name: row.get(2)?,
        color: row.get(3)?,
    })
}

pub fn load_tags_for_card(conn: &Connection, card_id: &str) -> rusqlite::Result<Vec<Tag>> {
    let mut stmt = conn.prepare(
        "SELECT t.id, t.board_id, t.name, t.color FROM tags t
         INNER JOIN card_tags ct ON ct.tag_id = t.id
         WHERE ct.card_id = ?1 ORDER BY t.name ASC",
    )?;
    let tags: Vec<Tag> = stmt
        .query_map(params![card_id], row_to_tag)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(tags)
}

#[tauri::command]
pub fn list_tags(state: State<'_, DbState>, board_id: String) -> Result<Vec<Tag>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT id, board_id, name, color FROM tags WHERE board_id = ?1 ORDER BY name ASC",
        )?;
        let tags: Vec<Tag> = stmt
            .query_map(params![board_id], row_to_tag)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(tags)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn create_tag(state: State<'_, DbState>, input: CreateTagInput) -> Result<Tag, String> {
    validate_name(&input.name)?;
    crate::db::with_connection(&state, |conn| {
        let id = new_id();
        let name = input.name.trim().to_string();
        conn.execute(
            "INSERT INTO tags (id, board_id, name, color) VALUES (?1, ?2, ?3, ?4)",
            params![id, input.board_id, name, input.color],
        )?;
        Ok(Tag {
            id,
            board_id: input.board_id,
            name,
            color: input.color,
        })
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn set_card_tags(
    state: State<'_, DbState>,
    input: SetCardTagsInput,
) -> Result<Vec<Tag>, String> {
    crate::db::with_connection(&state, |conn| {
        let tx = conn.unchecked_transaction()?;
        tx.execute(
            "DELETE FROM card_tags WHERE card_id = ?1",
            params![input.card_id],
        )?;
        for tag_id in &input.tag_ids {
            tx.execute(
                "INSERT INTO card_tags (card_id, tag_id) VALUES (?1, ?2)",
                params![input.card_id, tag_id],
            )?;
        }
        tx.commit()?;
        load_tags_for_card(conn, &input.card_id)
    })
    .map_err(map_db_err)
}
