use rusqlite::{Connection, Result};

pub fn next_version_id(conn: &Connection, project_id: &str) -> Result<String> {
    let max_num: Option<i64> = conn.query_row(
        "SELECT MAX(CAST(SUBSTR(id, 2) AS INTEGER)) FROM versions WHERE project_id = ?1 AND id GLOB 'v[0-9]*'",
        [project_id],
        |row| row.get(0),
    )?;
    Ok(format!("v{}", max_num.unwrap_or(0) + 1))
}

pub fn next_epic_id(conn: &Connection, project_id: &str) -> Result<String> {
    let max_num: Option<i64> = conn.query_row(
        "SELECT MAX(CAST(SUBSTR(id, 6) AS INTEGER)) FROM epics WHERE project_id = ?1 AND id GLOB 'EPIC-[0-9]*'",
        [project_id],
        |row| row.get(0),
    )?;
    Ok(format!("EPIC-{:02}", max_num.unwrap_or(0) + 1))
}

pub fn next_sprint_id(conn: &Connection, project_id: &str, version_id: &str) -> Result<String> {
    let prefix = format!("{version_id}-S");
    let max_num: Option<i64> = conn.query_row(
        "SELECT MAX(CAST(SUBSTR(id, ?2 + 1) AS INTEGER)) FROM sprints WHERE project_id = ?1 AND id LIKE ?3",
        rusqlite::params![project_id, prefix.len() as i64, format!("{prefix}%")],
        |row| row.get(0),
    )?;
    Ok(format!("{prefix}{}", max_num.unwrap_or(0) + 1))
}

pub fn next_story_id(conn: &Connection, project_id: &str) -> Result<String> {
    let max_num: Option<i64> = conn.query_row(
        "SELECT MAX(CAST(SUBSTR(id, 4) AS INTEGER)) FROM user_stories WHERE project_id = ?1 AND id GLOB 'US-[0-9]*'",
        [project_id],
        |row| row.get(0),
    )?;
    Ok(format!("US-{:04}", max_num.unwrap_or(0) + 1))
}

pub fn seed_workflow_columns(conn: &Connection, project_id: &str) -> Result<()> {
    let defaults: [(&str, i64, Option<&str>); 6] = [
        ("Backlog", 0, Some("❌")),
        ("Refine", 1, Some("❌")),
        ("Ready", 2, Some("❌")),
        ("In progress", 3, Some("🔶")),
        ("Review", 4, Some("🔶")),
        ("Done", 5, Some("✅")),
    ];
    for (name, order, maps_status) in defaults {
        conn.execute(
            "INSERT INTO workflow_columns (id, project_id, name, order_index, maps_status) VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![
                crate::util::new_id(),
                project_id,
                name,
                order,
                maps_status
            ],
        )?;
    }
    Ok(())
}

pub fn first_workflow_column_id(conn: &Connection, project_id: &str) -> Result<String> {
    conn.query_row(
        "SELECT id FROM workflow_columns WHERE project_id = ?1 ORDER BY order_index ASC LIMIT 1",
        [project_id],
        |row| row.get(0),
    )
}
