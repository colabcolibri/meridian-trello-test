use crate::db::DbState;
use crate::models::{
    Column, CreateColumnInput, ReorderColumnsInput, UpdateColumnInput,
};
use crate::util::{map_db_err, new_id, validate_name};
use rusqlite::params;
use tauri::State;

fn row_to_column(row: &rusqlite::Row<'_>) -> rusqlite::Result<Column> {
    Ok(Column {
        id: row.get(0)?,
        board_id: row.get(1)?,
        name: row.get(2)?,
        order_index: row.get(3)?,
    })
}

#[tauri::command]
pub fn list_columns(state: State<'_, DbState>, board_id: String) -> Result<Vec<Column>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT id, board_id, name, order_index FROM columns WHERE board_id = ?1 ORDER BY order_index ASC",
        )?;
        let columns = stmt
            .query_map(params![board_id], row_to_column)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(columns)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn create_column(
    state: State<'_, DbState>,
    input: CreateColumnInput,
) -> Result<Column, String> {
    validate_name(&input.name)?;
    crate::db::with_connection(&state, |conn| {
        let max_order: i64 = conn
            .query_row(
                "SELECT COALESCE(MAX(order_index), -1) FROM columns WHERE board_id = ?1",
                params![input.board_id],
                |row| row.get(0),
            )
            .unwrap_or(-1);
        let id = new_id();
        let name = input.name.trim().to_string();
        let order_index = max_order + 1;
        conn.execute(
            "INSERT INTO columns (id, board_id, name, order_index) VALUES (?1, ?2, ?3, ?4)",
            params![id, input.board_id, name, order_index],
        )?;
        Ok(Column {
            id,
            board_id: input.board_id,
            name,
            order_index,
        })
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn update_column(
    state: State<'_, DbState>,
    input: UpdateColumnInput,
) -> Result<Column, String> {
    validate_name(&input.name)?;
    crate::db::with_connection(&state, |conn| {
        let name = input.name.trim().to_string();
        conn.execute(
            "UPDATE columns SET name = ?1 WHERE id = ?2",
            params![name, input.id],
        )?;
        conn.query_row(
            "SELECT id, board_id, name, order_index FROM columns WHERE id = ?1",
            params![input.id],
            row_to_column,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn reorder_columns(
    state: State<'_, DbState>,
    input: ReorderColumnsInput,
) -> Result<Vec<Column>, String> {
    crate::db::with_connection(&state, |conn| {
        let tx = conn.unchecked_transaction()?;
        for (index, col_id) in input.ordered_ids.iter().enumerate() {
            tx.execute(
                "UPDATE columns SET order_index = ?1 WHERE id = ?2 AND board_id = ?3",
                params![index as i64, col_id, input.board_id],
            )?;
        }
        tx.commit()?;
        list_columns_internal(conn, &input.board_id)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_column(state: State<'_, DbState>, id: String) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute("DELETE FROM columns WHERE id = ?1", params![id])?;
        Ok(())
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn move_column_up(state: State<'_, DbState>, id: String) -> Result<Vec<Column>, String> {
    reorder_column_by_delta(state, id, -1)
}

#[tauri::command]
pub fn move_column_down(state: State<'_, DbState>, id: String) -> Result<Vec<Column>, String> {
    reorder_column_by_delta(state, id, 1)
}

fn reorder_column_by_delta(
    state: State<'_, DbState>,
    id: String,
    delta: i64,
) -> Result<Vec<Column>, String> {
    crate::db::with_connection(&state, |conn| {
        let (board_id, order_index): (String, i64) = conn.query_row(
            "SELECT board_id, order_index FROM columns WHERE id = ?1",
            params![id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )?;
        let target = order_index + delta;
        if target < 0 {
            return list_columns_internal(conn, &board_id);
        }
        let swap_id: Option<String> = conn
            .query_row(
                "SELECT id FROM columns WHERE board_id = ?1 AND order_index = ?2",
                params![board_id, target],
                |row| row.get(0),
            )
            .ok();
        if let Some(swap_id) = swap_id {
            let tx = conn.unchecked_transaction()?;
            tx.execute(
                "UPDATE columns SET order_index = ?1 WHERE id = ?2",
                params![target, id],
            )?;
            tx.execute(
                "UPDATE columns SET order_index = ?1 WHERE id = ?2",
                params![order_index, swap_id],
            )?;
            tx.commit()?;
        }
        list_columns_internal(conn, &board_id)
    })
    .map_err(map_db_err)
}

fn list_columns_internal(conn: &rusqlite::Connection, board_id: &str) -> rusqlite::Result<Vec<Column>> {
    let mut stmt = conn.prepare(
        "SELECT id, board_id, name, order_index FROM columns WHERE board_id = ?1 ORDER BY order_index ASC",
    )?;
    let columns: Vec<Column> = stmt
        .query_map(params![board_id], row_to_column)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(columns)
}
