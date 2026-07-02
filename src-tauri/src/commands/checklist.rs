use crate::db::DbState;
use crate::models::{ChecklistItem, ReorderChecklistInput, UpsertChecklistItemInput};
use crate::util::{map_db_err, new_id};
use rusqlite::params;
use tauri::State;

fn row_to_item(row: &rusqlite::Row<'_>) -> rusqlite::Result<ChecklistItem> {
    Ok(ChecklistItem {
        id: row.get(0)?,
        card_id: row.get(1)?,
        text: row.get(2)?,
        completed: row.get::<_, i64>(3)? != 0,
        order_index: row.get(4)?,
    })
}

#[tauri::command]
pub fn list_checklist_items(
    state: State<'_, DbState>,
    card_id: String,
) -> Result<Vec<ChecklistItem>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT id, card_id, text, completed, order_index FROM checklist_items WHERE card_id = ?1 ORDER BY order_index ASC",
        )?;
        let items: Vec<ChecklistItem> = stmt
            .query_map(params![card_id], row_to_item)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(items)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn upsert_checklist_item(
    state: State<'_, DbState>,
    input: UpsertChecklistItemInput,
) -> Result<ChecklistItem, String> {
    if input.text.trim().is_empty() {
        return Err("Texto do item não pode ser vazio".into());
    }
    crate::db::with_connection(&state, |conn| {
        let id = input.id.clone().unwrap_or_else(new_id);
        let text = input.text.trim().to_string();
        conn.execute(
            "INSERT INTO checklist_items (id, card_id, text, completed, order_index) VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(id) DO UPDATE SET text = excluded.text, completed = excluded.completed, order_index = excluded.order_index",
            params![id, input.card_id, text, input.completed as i64, input.order_index],
        )?;
        conn.query_row(
            "SELECT id, card_id, text, completed, order_index FROM checklist_items WHERE id = ?1",
            params![id],
            row_to_item,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_checklist_item(state: State<'_, DbState>, id: String) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute("DELETE FROM checklist_items WHERE id = ?1", params![id])?;
        Ok(())
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn reorder_checklist_items(
    state: State<'_, DbState>,
    input: ReorderChecklistInput,
) -> Result<Vec<ChecklistItem>, String> {
    crate::db::with_connection(&state, |conn| {
        let tx = conn.unchecked_transaction()?;
        for (index, item_id) in input.ordered_ids.iter().enumerate() {
            tx.execute(
                "UPDATE checklist_items SET order_index = ?1 WHERE id = ?2 AND card_id = ?3",
                params![index as i64, item_id, input.card_id],
            )?;
        }
        tx.commit()?;
        let mut stmt = conn.prepare(
            "SELECT id, card_id, text, completed, order_index FROM checklist_items WHERE card_id = ?1 ORDER BY order_index ASC",
        )?;
        let items: Vec<ChecklistItem> = stmt
            .query_map(params![input.card_id], row_to_item)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(items)
    })
    .map_err(map_db_err)
}
