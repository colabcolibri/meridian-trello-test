pub fn new_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

pub fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

pub fn validate_name(name: &str) -> Result<(), String> {
    if name.trim().is_empty() {
        return Err("Name cannot be empty".into());
    }
    Ok(())
}

pub fn validate_title(title: &str) -> Result<(), String> {
    if title.trim().is_empty() {
        return Err("Title cannot be empty".into());
    }
    Ok(())
}

pub fn map_db_err(err: rusqlite::Error) -> String {
    if let rusqlite::Error::InvalidParameterName(msg) = err {
        return msg;
    }
    err.to_string()
}
