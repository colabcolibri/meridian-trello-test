use super::ids::seed_workflow_columns;
use crate::db::DbState;
use crate::models::{CreateProjectInput, Project, SetLastProjectInput, UpdateProjectInput};
use crate::util::{map_db_err, new_id, now_iso, validate_name};
use rusqlite::params;
use tauri::State;

fn row_to_project(row: &rusqlite::Row<'_>) -> rusqlite::Result<Project> {
    Ok(Project {
        id: row.get(0)?,
        name: row.get(1)?,
        description: row.get(2)?,
        created_at: row.get(3)?,
        updated_at: row.get(4)?,
    })
}

#[tauri::command]
pub fn list_projects(state: State<'_, DbState>) -> Result<Vec<Project>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT id, name, description, created_at, updated_at FROM projects ORDER BY updated_at DESC",
        )?;
        let rows = stmt
            .query_map([], row_to_project)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(rows)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn get_project(state: State<'_, DbState>, id: String) -> Result<Project, String> {
    crate::db::with_connection(&state, |conn| {
        conn.query_row(
            "SELECT id, name, description, created_at, updated_at FROM projects WHERE id = ?1",
            params![id],
            row_to_project,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn create_project(
    state: State<'_, DbState>,
    input: CreateProjectInput,
) -> Result<Project, String> {
    validate_name(&input.name)?;
    crate::db::with_connection(&state, |conn| {
        let id = new_id();
        let now = now_iso();
        let name = input.name.trim().to_string();
        let description = input
            .description
            .map(|d| d.trim().to_string())
            .filter(|d| !d.is_empty());
        conn.execute(
            "INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, name, description, now, now],
        )?;
        seed_workflow_columns(conn, &id)?;
        Ok(Project {
            id,
            name,
            description,
            created_at: now.clone(),
            updated_at: now,
        })
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn update_project(
    state: State<'_, DbState>,
    input: UpdateProjectInput,
) -> Result<Project, String> {
    validate_name(&input.name)?;
    crate::db::with_connection(&state, |conn| {
        let now = now_iso();
        let name = input.name.trim().to_string();
        let description = input
            .description
            .map(|d| d.trim().to_string())
            .filter(|d| !d.is_empty());
        conn.execute(
            "UPDATE projects SET name = ?1, description = ?2, updated_at = ?3 WHERE id = ?4",
            params![name, description, now, input.id],
        )?;
        conn.query_row(
            "SELECT id, name, description, created_at, updated_at FROM projects WHERE id = ?1",
            params![input.id],
            row_to_project,
        )
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_project(state: State<'_, DbState>, id: String) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute("DELETE FROM projects WHERE id = ?1", params![id])?;
        Ok(())
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn get_last_project_id(state: State<'_, DbState>) -> Result<Option<String>, String> {
    crate::db::with_connection(&state, |conn| {
        let value: Option<String> = conn
            .query_row(
                "SELECT value FROM app_preferences WHERE key = 'last_project_id'",
                [],
                |row| row.get(0),
            )
            .ok();
        Ok(value)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn set_last_project_id(
    state: State<'_, DbState>,
    input: SetLastProjectInput,
) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        match &input.project_id {
            Some(pid) => {
                conn.execute(
                    "INSERT INTO app_preferences (key, value) VALUES ('last_project_id', ?1)
                     ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                    params![pid],
                )?;
            }
            None => {
                conn.execute(
                    "DELETE FROM app_preferences WHERE key = 'last_project_id'",
                    [],
                )?;
            }
        }
        Ok(())
    })
    .map_err(map_db_err)
}
