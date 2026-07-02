use crate::db::DbState;
use crate::models::{Board, CreateBoardInput, SetLastBoardInput, UpdateBoardInput};
use crate::util::{map_db_err, new_id, now_iso, validate_name};
use rusqlite::params;
use tauri::State;

const DEFAULT_COLUMNS: &[&str] = &["To Do", "In Progress", "Waiting", "Done"];

fn row_to_board(row: &rusqlite::Row<'_>) -> rusqlite::Result<Board> {
    Ok(Board {
        id: row.get(0)?,
        name: row.get(1)?,
        created_at: row.get(2)?,
        updated_at: row.get(3)?,
    })
}

#[tauri::command]
pub fn list_boards(state: State<'_, DbState>) -> Result<Vec<Board>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT id, name, created_at, updated_at FROM boards ORDER BY updated_at DESC",
        )?;
        let boards = stmt
            .query_map([], row_to_board)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(boards)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn create_board(
    state: State<'_, DbState>,
    input: CreateBoardInput,
) -> Result<Board, String> {
    validate_name(&input.name)?;
    crate::db::with_connection(&state, |conn| {
        let id = new_id();
        let now = now_iso();
        let name = input.name.trim().to_string();
        conn.execute(
            "INSERT INTO boards (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
            params![id, name, now, now],
        )?;
        for (index, col_name) in DEFAULT_COLUMNS.iter().enumerate() {
            conn.execute(
                "INSERT INTO columns (id, board_id, name, order_index) VALUES (?1, ?2, ?3, ?4)",
                params![new_id(), id, col_name, index as i64],
            )?;
        }
        Ok(Board {
            id,
            name,
            created_at: now.clone(),
            updated_at: now,
        })
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn update_board(
    state: State<'_, DbState>,
    input: UpdateBoardInput,
) -> Result<Board, String> {
    validate_name(&input.name)?;
    crate::db::with_connection(&state, |conn| {
        let now = now_iso();
        let name = input.name.trim().to_string();
        conn.execute(
            "UPDATE boards SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![name, now, input.id],
        )?;
        conn.query_row(
            "SELECT id, name, created_at, updated_at FROM boards WHERE id = ?1",
            params![input.id],
            row_to_board,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_board(state: State<'_, DbState>, id: String) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute("DELETE FROM boards WHERE id = ?1", params![id])?;
        conn.execute(
            "DELETE FROM app_preferences WHERE key = 'last_board_id' AND value = ?1",
            params![id],
        )?;
        Ok(())
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn get_last_board_id(state: State<'_, DbState>) -> Result<Option<String>, String> {
    crate::db::with_connection(&state, |conn| {
        let result = conn.query_row(
            "SELECT value FROM app_preferences WHERE key = 'last_board_id'",
            [],
            |row| row.get::<_, String>(0),
        );
        match result {
            Ok(value) => Ok(Some(value)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(err) => Err(err),
        }
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn set_last_board_id(
    state: State<'_, DbState>,
    input: SetLastBoardInput,
) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute(
            "DELETE FROM app_preferences WHERE key = 'last_board_id'",
            [],
        )?;
        if let Some(board_id) = input.board_id {
            conn.execute(
                "INSERT INTO app_preferences (key, value) VALUES ('last_board_id', ?1)",
                params![board_id],
            )?;
        }
        Ok(())
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn get_board(state: State<'_, DbState>, id: String) -> Result<Board, String> {
    crate::db::with_connection(&state, |conn| {
        conn.query_row(
            "SELECT id, name, created_at, updated_at FROM boards WHERE id = ?1",
            params![id],
            row_to_board,
        )
    })
    .map_err(map_db_err)
}
