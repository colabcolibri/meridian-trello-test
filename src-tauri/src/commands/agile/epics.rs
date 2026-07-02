use super::ids::next_epic_id;
use crate::db::DbState;
use crate::models::{CreateEpicInput, Epic, UpdateEpicInput};
use crate::util::{map_db_err, now_iso, validate_name};
use rusqlite::params;
use tauri::State;

const EPIC_SELECT: &str = "
SELECT id, project_id, title, status, outcome, capability, expected_outcome,
       out_of_scope, notes, profiles_json, version_ids_json, created_at, updated_at
FROM epics";

fn row_to_epic(row: &rusqlite::Row<'_>) -> rusqlite::Result<Epic> {
    Ok(Epic {
        id: row.get(0)?,
        project_id: row.get(1)?,
        title: row.get(2)?,
        status: row.get(3)?,
        outcome: row.get(4)?,
        capability: row.get(5)?,
        expected_outcome: row.get(6)?,
        out_of_scope: row.get(7)?,
        notes: row.get(8)?,
        profiles_json: row.get(9)?,
        version_ids_json: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
    })
}

#[tauri::command]
pub fn list_epics(state: State<'_, DbState>, project_id: String) -> Result<Vec<Epic>, String> {
    crate::db::with_connection(&state, |conn| {
        let sql = format!("{EPIC_SELECT} WHERE project_id = ?1 ORDER BY id ASC");
        let mut stmt = conn.prepare(&sql)?;
        let rows = stmt
            .query_map(params![project_id], row_to_epic)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(rows)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn create_epic(state: State<'_, DbState>, input: CreateEpicInput) -> Result<Epic, String> {
    validate_name(&input.title)?;
    crate::db::with_connection(&state, |conn| {
        let id = if let Some(custom) = input.id {
            custom
        } else {
            next_epic_id(conn, &input.project_id)?
        };
        let now = now_iso();
        let title = input.title.trim().to_string();
        let status = input.status.unwrap_or_else(|| "active".to_string());
        conn.execute(
            "INSERT INTO epics (
                id, project_id, title, status, outcome, capability, expected_outcome,
                out_of_scope, notes, profiles_json, version_ids_json, created_at, updated_at
             ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)",
            params![
                id,
                input.project_id,
                title,
                status,
                input.outcome.filter(|s| !s.trim().is_empty()),
                input.capability.filter(|s| !s.trim().is_empty()),
                input.expected_outcome.filter(|s| !s.trim().is_empty()),
                input.out_of_scope.filter(|s| !s.trim().is_empty()),
                input.notes.filter(|s| !s.trim().is_empty()),
                input.profiles_json.filter(|s| !s.trim().is_empty()),
                None::<String>,
                now,
                now
            ],
        )?;
        conn.query_row(
            &format!("{EPIC_SELECT} WHERE project_id = ?1 AND id = ?2"),
            params![input.project_id, id],
            row_to_epic,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn update_epic(state: State<'_, DbState>, input: UpdateEpicInput) -> Result<Epic, String> {
    validate_name(&input.title)?;
    crate::db::with_connection(&state, |conn| {
        let now = now_iso();
        let title = input.title.trim().to_string();
        conn.execute(
            "UPDATE epics SET
                title = ?1, status = ?2, outcome = ?3, capability = ?4, expected_outcome = ?5,
                out_of_scope = ?6, notes = ?7, profiles_json = ?8, updated_at = ?9
             WHERE project_id = ?10 AND id = ?11",
            params![
                title,
                input.status,
                input.outcome,
                input.capability,
                input.expected_outcome,
                input.out_of_scope,
                input.notes,
                input.profiles_json,
                now,
                input.project_id,
                input.id
            ],
        )?;
        conn.query_row(
            &format!("{EPIC_SELECT} WHERE project_id = ?1 AND id = ?2"),
            params![input.project_id, input.id],
            row_to_epic,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_epic(
    state: State<'_, DbState>,
    project_id: String,
    id: String,
) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute(
            "DELETE FROM epics WHERE project_id = ?1 AND id = ?2",
            params![project_id, id],
        )?;
        Ok(())
    })
    .map_err(map_db_err)
}
