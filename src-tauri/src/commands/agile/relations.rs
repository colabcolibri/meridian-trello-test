use crate::db::DbState;
use crate::models::{SetEpicVersionsInput, VersionIncluded, VersionIncludedEpic};
use crate::util::map_db_err;
use rusqlite::{params, Connection};
use tauri::State;

fn epic_linked_to_version(
    conn: &Connection,
    project_id: &str,
    version_id: &str,
    epic_id: &str,
) -> rusqlite::Result<bool> {
    conn.query_row(
        "SELECT 1 FROM version_epics
         WHERE project_id = ?1 AND version_id = ?2 AND epic_id = ?3",
        params![project_id, version_id, epic_id],
        |_| Ok(true),
    )
    .or_else(|e| {
        if matches!(e, rusqlite::Error::QueryReturnedNoRows) {
            Ok(false)
        } else {
            Err(e)
        }
    })
}

pub fn validate_story_relations(
    conn: &Connection,
    project_id: &str,
    epic_id: Option<&str>,
    version_id: Option<&str>,
    sprint_id: Option<&str>,
) -> Result<(), String> {
    if let (Some(vid), Some(eid)) = (version_id, epic_id) {
        if !epic_linked_to_version(conn, project_id, vid, eid).map_err(map_db_err)? {
            return Err(format!("Epic {eid} is not linked to version {vid}"));
        }
    }
    if let (Some(vid), Some(sid)) = (version_id, sprint_id) {
        let sprint_version: String = conn
            .query_row(
                "SELECT version_id FROM sprints WHERE project_id = ?1 AND id = ?2",
                params![project_id, sid],
                |row| row.get(0),
            )
            .map_err(map_db_err)?;
        if sprint_version != vid {
            return Err(format!(
                "Sprint {sid} belongs to version {sprint_version}, not {vid}"
            ));
        }
    }
    Ok(())
}

#[tauri::command]
pub fn set_epic_versions(
    state: State<'_, DbState>,
    input: SetEpicVersionsInput,
) -> Result<(), String> {
    if input.version_ids.is_empty() {
        return Err("At least one version is required".into());
    }
    crate::db::with_connection(&state, |conn| {
        let exists: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM epics WHERE project_id = ?1 AND id = ?2",
                params![input.project_id, input.epic_id],
                |row| row.get(0),
            )?;
        if exists == 0 {
            return Err(rusqlite::Error::InvalidParameterName("Epic not found".into()));
        }
        for vid in &input.version_ids {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM versions WHERE project_id = ?1 AND id = ?2",
                params![input.project_id, vid],
                |row| row.get(0),
            )?;
            if count == 0 {
                return Err(rusqlite::Error::InvalidParameterName(
                    format!("Version {vid} not found"),
                ));
            }
        }
        conn.execute(
            "DELETE FROM version_epics WHERE project_id = ?1 AND epic_id = ?2",
            params![input.project_id, input.epic_id],
        )?;
        for vid in &input.version_ids {
            conn.execute(
                "INSERT OR IGNORE INTO version_epics (project_id, version_id, epic_id)
                 VALUES (?1, ?2, ?3)",
                params![input.project_id, vid, input.epic_id],
            )?;
        }
        Ok(())
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn get_epic_versions(
    state: State<'_, DbState>,
    project_id: String,
    epic_id: String,
) -> Result<Vec<String>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT version_id FROM version_epics
             WHERE project_id = ?1 AND epic_id = ?2
             ORDER BY version_id ASC",
        )?;
        let rows = stmt
            .query_map(params![project_id, epic_id], |row| row.get(0))?
            .collect::<rusqlite::Result<Vec<String>>>()?;
        Ok(rows)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn list_epics_for_version(
    state: State<'_, DbState>,
    project_id: String,
    version_id: String,
) -> Result<Vec<VersionIncludedEpic>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT e.id, e.title
             FROM epics e
             INNER JOIN version_epics ve ON ve.project_id = e.project_id AND ve.epic_id = e.id
             WHERE ve.project_id = ?1 AND ve.version_id = ?2
             ORDER BY e.id ASC",
        )?;
        let rows = stmt
            .query_map(params![project_id, version_id], |row| {
                Ok(VersionIncludedEpic {
                    id: row.get(0)?,
                    title: row.get(1)?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(rows)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn get_version_included(
    state: State<'_, DbState>,
    project_id: String,
    version_id: String,
) -> Result<VersionIncluded, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT e.id, e.title
             FROM epics e
             INNER JOIN version_epics ve ON ve.project_id = e.project_id AND ve.epic_id = e.id
             WHERE ve.project_id = ?1 AND ve.version_id = ?2
             ORDER BY e.id ASC",
        )?;
        let epics = stmt
            .query_map(params![project_id, version_id], |row| {
                Ok(VersionIncludedEpic {
                    id: row.get(0)?,
                    title: row.get(1)?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;

        let story_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM user_stories WHERE project_id = ?1 AND version_id = ?2",
            params![project_id, version_id],
            |row| row.get(0),
        )?;

        let sprint_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM sprints WHERE project_id = ?1 AND version_id = ?2",
            params![project_id, version_id],
            |row| row.get(0),
        )?;

        Ok(VersionIncluded {
            epics,
            story_count,
            sprint_count,
        })
    })
    .map_err(map_db_err)
}
