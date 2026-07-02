use crate::db::DbState;
use crate::models::WorkflowColumn;
use crate::util::map_db_err;
use rusqlite::params;
use tauri::State;

fn row_to_column(row: &rusqlite::Row<'_>) -> rusqlite::Result<WorkflowColumn> {
    Ok(WorkflowColumn {
        id: row.get(0)?,
        project_id: row.get(1)?,
        name: row.get(2)?,
        order_index: row.get(3)?,
        maps_status: row.get(4)?,
    })
}

#[tauri::command]
pub fn list_workflow_columns(
    state: State<'_, DbState>,
    project_id: String,
) -> Result<Vec<WorkflowColumn>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut stmt = conn.prepare(
            "SELECT id, project_id, name, order_index, maps_status
             FROM workflow_columns WHERE project_id = ?1 ORDER BY order_index ASC",
        )?;
        let rows = stmt
            .query_map(params![project_id], row_to_column)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(rows)
    })
    .map_err(map_db_err)
}
