use super::ids::next_version_id;
use crate::db::DbState;
use crate::models::{CreateVersionInput, UpdateVersionInput, Version};
use crate::util::{map_db_err, now_iso, validate_name};
use rusqlite::params;
use tauri::State;

const VERSION_SELECT: &str = "
SELECT id, project_id, title, status, outcome, objective, done_criteria,
       included_json, explicitly_out, go_live_checklist_json, created_at, updated_at
FROM versions";

fn row_to_version(row: &rusqlite::Row<'_>) -> rusqlite::Result<Version> {
    Ok(Version {
        id: row.get(0)?,
        project_id: row.get(1)?,
        title: row.get(2)?,
        status: row.get(3)?,
        outcome: row.get(4)?,
        objective: row.get(5)?,
        done_criteria: row.get(6)?,
        included_json: row.get(7)?,
        explicitly_out: row.get(8)?,
        go_live_checklist_json: row.get(9)?,
        created_at: row.get(10)?,
        updated_at: row.get(11)?,
    })
}

#[tauri::command]
pub fn list_versions(state: State<'_, DbState>, project_id: String) -> Result<Vec<Version>, String> {
    crate::db::with_connection(&state, |conn| {
        let sql = format!(
            "{VERSION_SELECT} WHERE project_id = ?1 ORDER BY CAST(SUBSTR(id, 2) AS INTEGER) ASC"
        );
        let mut stmt = conn.prepare(&sql)?;
        let rows = stmt
            .query_map(params![project_id], row_to_version)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(rows)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn create_version(
    state: State<'_, DbState>,
    input: CreateVersionInput,
) -> Result<Version, String> {
    validate_name(&input.title)?;
    crate::db::with_connection(&state, |conn| {
        let id = if let Some(custom) = input.id {
            custom
        } else {
            next_version_id(conn, &input.project_id)?
        };
        let now = now_iso();
        let title = input.title.trim().to_string();
        let status = input.status.unwrap_or_else(|| "planned".to_string());
        conn.execute(
            "INSERT INTO versions (
                id, project_id, title, status, outcome, objective, done_criteria,
                included_json, explicitly_out, go_live_checklist_json, created_at, updated_at
             ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)",
            params![
                id,
                input.project_id,
                title,
                status,
                input.outcome.filter(|s| !s.trim().is_empty()),
                input.objective.filter(|s| !s.trim().is_empty()),
                input.done_criteria.filter(|s| !s.trim().is_empty()),
                input.included_json.filter(|s| !s.trim().is_empty()),
                input.explicitly_out.filter(|s| !s.trim().is_empty()),
                input.go_live_checklist_json.filter(|s| !s.trim().is_empty()),
                now,
                now
            ],
        )?;
        conn.query_row(
            &format!("{VERSION_SELECT} WHERE project_id = ?1 AND id = ?2"),
            params![input.project_id, id],
            row_to_version,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn update_version(
    state: State<'_, DbState>,
    input: UpdateVersionInput,
) -> Result<Version, String> {
    validate_name(&input.title)?;
    crate::db::with_connection(&state, |conn| {
        let now = now_iso();
        let title = input.title.trim().to_string();
        conn.execute(
            "UPDATE versions SET
                title = ?1, status = ?2, outcome = ?3, objective = ?4, done_criteria = ?5,
                included_json = ?6, explicitly_out = ?7, go_live_checklist_json = ?8, updated_at = ?9
             WHERE project_id = ?10 AND id = ?11",
            params![
                title,
                input.status,
                input.outcome,
                input.objective,
                input.done_criteria,
                input.included_json,
                input.explicitly_out,
                input.go_live_checklist_json,
                now,
                input.project_id,
                input.id
            ],
        )?;
        conn.query_row(
            &format!("{VERSION_SELECT} WHERE project_id = ?1 AND id = ?2"),
            params![input.project_id, input.id],
            row_to_version,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_version(
    state: State<'_, DbState>,
    project_id: String,
    id: String,
) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute(
            "DELETE FROM versions WHERE project_id = ?1 AND id = ?2",
            params![project_id, id],
        )?;
        Ok(())
    })
    .map_err(map_db_err)
}
