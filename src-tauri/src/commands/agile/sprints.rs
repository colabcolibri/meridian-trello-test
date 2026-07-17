use super::ids::next_sprint_id;
use crate::db::DbState;
use crate::models::{CreateSprintInput, SetLastSprintInput, Sprint, UpdateSprintInput};
use crate::util::{map_db_err, now_iso, validate_name};
use rusqlite::params;
use tauri::State;

const SPRINT_SELECT: &str = "
SELECT id, project_id, version_id, title, status, goal, done_when, out_of_scope,
       retrospective_json, created_at, updated_at
FROM sprints";

fn row_to_sprint(row: &rusqlite::Row<'_>) -> rusqlite::Result<Sprint> {
    Ok(Sprint {
        id: row.get(0)?,
        project_id: row.get(1)?,
        version_id: row.get(2)?,
        title: row.get(3)?,
        status: row.get(4)?,
        goal: row.get(5)?,
        done_when: row.get(6)?,
        out_of_scope: row.get(7)?,
        retrospective_json: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}

#[tauri::command]
pub fn list_sprints(
    state: State<'_, DbState>,
    project_id: String,
    version_id: Option<String>,
) -> Result<Vec<Sprint>, String> {
    crate::db::with_connection(&state, |conn| {
        let rows = if let Some(vid) = version_id {
            let sql = format!("{SPRINT_SELECT} WHERE project_id = ?1 AND version_id = ?2 ORDER BY id ASC");
            let mut stmt = conn.prepare(&sql)?;
            let mapped = stmt.query_map(params![project_id, vid], row_to_sprint)?;
            mapped.collect::<rusqlite::Result<Vec<_>>>()?
        } else {
            let sql = format!("{SPRINT_SELECT} WHERE project_id = ?1 ORDER BY id ASC");
            let mut stmt = conn.prepare(&sql)?;
            let mapped = stmt.query_map(params![project_id], row_to_sprint)?;
            mapped.collect::<rusqlite::Result<Vec<_>>>()?
        };
        Ok(rows)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn create_sprint(state: State<'_, DbState>, input: CreateSprintInput) -> Result<Sprint, String> {
    validate_name(&input.title)?;
    crate::db::with_connection(&state, |conn| {
        let id = if let Some(custom) = input.id {
            custom
        } else {
            next_sprint_id(conn, &input.project_id, &input.version_id)?
        };
        let now = now_iso();
        let title = input.title.trim().to_string();
        let status = input.status.unwrap_or_else(|| "planned".to_string());
        conn.execute(
            "INSERT INTO sprints (
                id, project_id, version_id, title, status, goal, done_when,
                out_of_scope, retrospective_json, created_at, updated_at
             ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
            params![
                id,
                input.project_id,
                input.version_id,
                title,
                status,
                input.goal.filter(|s| !s.trim().is_empty()),
                input.done_when.filter(|s| !s.trim().is_empty()),
                input.out_of_scope.filter(|s| !s.trim().is_empty()),
                input.retrospective_json.filter(|s| !s.trim().is_empty()),
                now,
                now
            ],
        )?;
        conn.query_row(
            &format!("{SPRINT_SELECT} WHERE project_id = ?1 AND id = ?2"),
            params![input.project_id, id],
            row_to_sprint,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn update_sprint(
    state: State<'_, DbState>,
    input: UpdateSprintInput,
) -> Result<Sprint, String> {
    validate_name(&input.title)?;
    crate::db::with_connection(&state, |conn| {
        let now = now_iso();
        let title = input.title.trim().to_string();
        conn.execute(
            "UPDATE sprints SET
                title = ?1, status = ?2, goal = ?3, done_when = ?4,
                out_of_scope = ?5, retrospective_json = ?6, updated_at = ?7
             WHERE project_id = ?8 AND id = ?9",
            params![
                title,
                input.status,
                input.goal,
                input.done_when,
                input.out_of_scope,
                input.retrospective_json,
                now,
                input.project_id,
                input.id
            ],
        )?;
        conn.query_row(
            &format!("{SPRINT_SELECT} WHERE project_id = ?1 AND id = ?2"),
            params![input.project_id, input.id],
            row_to_sprint,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_sprint(
    state: State<'_, DbState>,
    project_id: String,
    id: String,
) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute(
            "DELETE FROM sprints WHERE project_id = ?1 AND id = ?2",
            params![project_id, id],
        )?;
        Ok(())
    })
    .map_err(map_db_err)
}

fn sprint_pref_key(project_id: &str) -> String {
    format!("last_sprint_id:{project_id}")
}

#[tauri::command]
pub fn get_last_sprint_id(
    state: State<'_, DbState>,
    project_id: String,
) -> Result<Option<String>, String> {
    crate::db::with_connection(&state, |conn| {
        let key = sprint_pref_key(&project_id);
        let value: Option<String> = conn
            .query_row(
                "SELECT value FROM app_preferences WHERE key = ?1",
                params![key],
                |row| row.get(0),
            )
            .ok();
        Ok(value)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn set_last_sprint_id(
    state: State<'_, DbState>,
    input: SetLastSprintInput,
) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        let key = sprint_pref_key(&input.project_id);
        match &input.sprint_id {
            Some(sid) => {
                conn.execute(
                    "INSERT INTO app_preferences (key, value) VALUES (?1, ?2)
                     ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                    params![key, sid],
                )?;
            }
            None => {
                conn.execute("DELETE FROM app_preferences WHERE key = ?1", params![key])?;
            }
        }
        Ok(())
    })
    .map_err(map_db_err)
}
