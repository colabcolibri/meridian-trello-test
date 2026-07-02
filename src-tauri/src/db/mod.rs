use rusqlite::{Connection, Result};
use std::path::Path;
use std::sync::Mutex;

const INITIAL_MIGRATION: &str = include_str!("../../migrations/20260702173000_initial_schema.sql");
const INITIAL_MIGRATION_VERSION: &str = "20260702173000";

#[allow(dead_code)]
pub struct DbState(pub Mutex<Connection>);

pub fn init(db_path: &Path) -> Result<Connection> {
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).map_err(|err| {
            rusqlite::Error::SqliteFailure(
                rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN),
                Some(format!("failed to create db directory: {err}")),
            )
        })?;
    }

    let conn = Connection::open(db_path)?;
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;
    run_migrations(&conn)?;
    Ok(conn)
}

fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL
        );",
    )?;

    apply_migration(conn, INITIAL_MIGRATION_VERSION, INITIAL_MIGRATION)
}

fn apply_migration(conn: &Connection, version: &str, sql: &str) -> Result<()> {
    let exists: i64 = conn.query_row(
        "SELECT COUNT(*) FROM _schema_migrations WHERE version = ?1",
        [version],
        |row| row.get(0),
    )?;

    if exists == 0 {
        conn.execute_batch(sql)?;
        conn.execute(
            "INSERT INTO _schema_migrations (version, applied_at) VALUES (?1, datetime('now'))",
            [version],
        )?;
    }

    Ok(())
}

#[allow(dead_code)]
pub fn with_connection<F, T>(state: &DbState, f: F) -> Result<T>
where
    F: FnOnce(&Connection) -> Result<T>,
{
    let conn = state.0.lock().expect("database lock poisoned");
    f(&conn)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn migrations_are_idempotent() {
        let db_path = PathBuf::from(std::env::temp_dir()).join("kanban_local_test.db");
        let _ = std::fs::remove_file(&db_path);

        let conn = init(&db_path).expect("first init");
        drop(conn);

        let conn = init(&db_path).expect("second init");
        let table_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
                [],
                |row| row.get(0),
            )
            .expect("count tables");

        assert_eq!(table_count, 8); // 7 domain tables + _schema_migrations

        let _ = std::fs::remove_file(&db_path);
    }
}
