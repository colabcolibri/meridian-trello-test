use super::ids::{first_workflow_column_id, next_story_id};
use super::relations::validate_story_relations;
use crate::db::DbState;
use crate::models::{
    AcceptanceCriterion, CreateStoryInput, ListStoriesInput, MoveStoryInput, SetStoryAcceptanceInput,
    SetStoryDependenciesInput, StoryDetail, StorySummary, UpdateStoryInput,
};
use crate::util::{map_db_err, new_id, now_iso, validate_title};
use rusqlite::{params, Connection};
use std::collections::HashMap;
use tauri::State;

fn row_to_summary(row: &rusqlite::Row<'_>) -> rusqlite::Result<StorySummary> {
    Ok(StorySummary {
        id: row.get(0)?,
        project_id: row.get(1)?,
        epic_id: row.get(2)?,
        version_id: row.get(3)?,
        sprint_id: row.get(4)?,
        workflow_column_id: row.get(5)?,
        workflow_column_name: row.get(6)?,
        title: row.get(7)?,
        as_role: row.get(8)?,
        i_want: row.get(9)?,
        so_that: row.get(10)?,
        why: row.get(11)?,
        done_when: row.get(12)?,
        moscow: row.get(13)?,
        ready: row.get::<_, i64>(14)? != 0,
        status: row.get(15)?,
        order_index: row.get(16)?,
        tests: row.get(17)?,
        tests_status: row.get(18)?,
        acceptance_total: row.get(19)?,
        acceptance_done: row.get(20)?,
        acceptance_preview: Vec::new(),
        depends_on_count: row.get(21)?,
        blocked: row.get::<_, i64>(22)? != 0,
    })
}

fn load_dependencies(conn: &Connection, project_id: &str, story_id: &str) -> rusqlite::Result<Vec<String>> {
    let mut stmt = conn.prepare(
        "SELECT depends_on_id FROM story_dependencies WHERE project_id = ?1 AND story_id = ?2",
    )?;
    let deps = stmt
        .query_map(params![project_id, story_id], |row| row.get(0))?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(deps)
}

fn load_acceptance(conn: &Connection, project_id: &str, story_id: &str) -> rusqlite::Result<Vec<AcceptanceCriterion>> {
    let mut stmt = conn.prepare(
        "SELECT id, story_id, text, checked, order_index
         FROM acceptance_criteria WHERE project_id = ?1 AND story_id = ?2 ORDER BY order_index ASC",
    )?;
    let items = stmt
        .query_map(params![project_id, story_id], |row| {
            Ok(AcceptanceCriterion {
                id: row.get(0)?,
                story_id: row.get(1)?,
                text: row.get(2)?,
                checked: row.get::<_, i64>(3)? != 0,
                order_index: row.get(4)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(items)
}

fn load_acceptance_previews(
    conn: &Connection,
    project_id: &str,
) -> rusqlite::Result<HashMap<String, Vec<AcceptanceCriterion>>> {
    let mut stmt = conn.prepare(
        "SELECT id, story_id, text, checked, order_index
         FROM acceptance_criteria WHERE project_id = ?1 ORDER BY story_id ASC, order_index ASC",
    )?;
    let mut map: HashMap<String, Vec<AcceptanceCriterion>> = HashMap::new();
    let rows = stmt.query_map([project_id], |row| {
        Ok(AcceptanceCriterion {
            id: row.get(0)?,
            story_id: row.get(1)?,
            text: row.get(2)?,
            checked: row.get::<_, i64>(3)? != 0,
            order_index: row.get(4)?,
        })
    })?;
    for row in rows {
        let item = row?;
        let entry = map.entry(item.story_id.clone()).or_default();
        if entry.len() < 3 {
            entry.push(item);
        }
    }
    Ok(map)
}

fn enrich_summaries(
    conn: &Connection,
    project_id: &str,
    mut summaries: Vec<StorySummary>,
) -> rusqlite::Result<Vec<StorySummary>> {
    let previews = load_acceptance_previews(conn, project_id)?;
    for summary in &mut summaries {
        summary.acceptance_preview = previews.get(&summary.id).cloned().unwrap_or_default();
    }
    Ok(summaries)
}

fn is_blocked(conn: &Connection, project_id: &str, story_id: &str) -> rusqlite::Result<bool> {
    let blocked: i64 = conn.query_row(
        "SELECT COUNT(*) FROM story_dependencies sd
         JOIN user_stories us ON us.project_id = sd.project_id AND us.id = sd.depends_on_id
         WHERE sd.project_id = ?1 AND sd.story_id = ?2 AND us.status != '✅'",
        params![project_id, story_id],
        |row| row.get(0),
    )?;
    Ok(blocked > 0)
}

fn validate_preamble(
    as_role: &Option<String>,
    i_want: &Option<String>,
    so_that: &Option<String>,
    done_when: &Option<String>,
) -> Result<(), String> {
    let as_r = as_role.as_deref().unwrap_or("").trim();
    let want = i_want.as_deref().unwrap_or("").trim();
    let that = so_that.as_deref().unwrap_or("").trim();
    let done = done_when.as_deref().unwrap_or("").trim();
    if as_r.is_empty() || want.is_empty() || that.is_empty() {
        return Err("Preamble (As / I want / so that) is required".into());
    }
    if done.is_empty() {
        return Err("done_when is required".into());
    }
    Ok(())
}

fn derive_title(input_title: &str, i_want: &str) -> String {
    let trimmed = input_title.trim();
    if !trimmed.is_empty() {
        return trimmed.to_string();
    }
    let want = i_want.trim();
    if want.len() <= 100 {
        want.to_string()
    } else {
        format!("{}…", &want[..97])
    }
}

fn validate_status_rules(
    status: &str,
    missing_note: &Option<String>,
    acceptance: &[AcceptanceCriterion],
) -> Result<(), String> {
    if status == "🔶" {
        let note = missing_note.as_deref().unwrap_or("").trim();
        let has_missing_in_acceptance = acceptance
            .iter()
            .any(|a| a.text.contains("Missing:"));
        if note.is_empty() && !has_missing_in_acceptance {
            return Err("Status 🔶 requires missing_note or Missing: in acceptance".into());
        }
    }
    if status == "✅" {
        if acceptance.is_empty() {
            return Err("Status ✅ requires at least one acceptance criterion".into());
        }
        if !acceptance.iter().all(|a| a.checked) {
            return Err("Status ✅ requires all acceptance criteria checked".into());
        }
    }
    Ok(())
}

fn detect_dependency_cycle(
    conn: &Connection,
    project_id: &str,
    story_id: &str,
    depends_on: &[String],
) -> Result<(), String> {
    for dep in depends_on {
        if dep == story_id {
            return Err("Story cannot depend on itself".into());
        }
        let mut stack = vec![dep.clone()];
        let mut visited = std::collections::HashSet::new();
        while let Some(current) = stack.pop() {
            if current == story_id {
                return Err("Dependency cycle detected".into());
            }
            if !visited.insert(current.clone()) {
                continue;
            }
            let next: Vec<String> = conn
                .prepare(
                    "SELECT depends_on_id FROM story_dependencies WHERE project_id = ?1 AND story_id = ?2",
                )
                .and_then(|mut stmt| {
                    stmt.query_map(params![project_id, current], |row| row.get(0))
                        .and_then(|rows| rows.collect())
                })
                .unwrap_or_default();
            stack.extend(next);
        }
    }
    Ok(())
}

const LIST_STORIES_SQL: &str = "
SELECT us.id, us.project_id, us.epic_id, us.version_id, us.sprint_id, us.workflow_column_id,
       wc.name, us.title, us.as_role, us.i_want, us.so_that, us.why, us.done_when,
       us.moscow, us.ready, us.status, us.order_index, us.tests, us.tests_status,
       (SELECT COUNT(*) FROM acceptance_criteria ac WHERE ac.project_id = us.project_id AND ac.story_id = us.id),
       (SELECT COUNT(*) FROM acceptance_criteria ac WHERE ac.project_id = us.project_id AND ac.story_id = us.id AND ac.checked = 1),
       (SELECT COUNT(*) FROM story_dependencies sd WHERE sd.project_id = us.project_id AND sd.story_id = us.id),
       CASE WHEN EXISTS (
         SELECT 1 FROM story_dependencies sd
         JOIN user_stories dep ON dep.project_id = sd.project_id AND dep.id = sd.depends_on_id
         WHERE sd.project_id = us.project_id AND sd.story_id = us.id AND dep.status != '✅'
       ) THEN 1 ELSE 0 END AS blocked
FROM user_stories us
JOIN workflow_columns wc ON wc.id = us.workflow_column_id
WHERE us.project_id = ?1
";

const STORY_DETAIL_SQL: &str = "
SELECT id, project_id, epic_id, version_id, sprint_id, workflow_column_id,
       title, as_role, i_want, so_that, why, where_text, approach, done_when,
       moscow, ready, status, missing_note, tests, tests_status,
       out_of_scope, boundary_notes, architecture_refs, api_db_impact, security_notes,
       related_decisions, planned_json, record_json, record_files, record_backend,
       record_frontend, record_scripts, record_executed,
       order_index, created_at, updated_at
FROM user_stories WHERE project_id = ?1 AND id = ?2
";

fn map_story_detail_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<StoryDetail> {
    Ok(StoryDetail {
        id: row.get(0)?,
        project_id: row.get(1)?,
        epic_id: row.get(2)?,
        version_id: row.get(3)?,
        sprint_id: row.get(4)?,
        workflow_column_id: row.get(5)?,
        title: row.get(6)?,
        as_role: row.get(7)?,
        i_want: row.get(8)?,
        so_that: row.get(9)?,
        why: row.get(10)?,
        where_text: row.get(11)?,
        approach: row.get(12)?,
        done_when: row.get(13)?,
        moscow: row.get(14)?,
        ready: row.get::<_, i64>(15)? != 0,
        status: row.get(16)?,
        missing_note: row.get(17)?,
        tests: row.get(18)?,
        tests_status: row.get(19)?,
        out_of_scope: row.get(20)?,
        boundary_notes: row.get(21)?,
        architecture_refs: row.get(22)?,
        api_db_impact: row.get(23)?,
        security_notes: row.get(24)?,
        related_decisions: row.get(25)?,
        planned_json: row.get(26)?,
        record_json: row.get(27)?,
        record_files: row.get(28)?,
        record_backend: row.get(29)?,
        record_frontend: row.get(30)?,
        record_scripts: row.get(31)?,
        record_executed: row.get(32)?,
        order_index: row.get(33)?,
        created_at: row.get(34)?,
        updated_at: row.get(35)?,
        acceptance: Vec::new(),
        depends_on: Vec::new(),
        blocked: false,
    })
}

#[tauri::command]
pub fn list_stories(
    state: State<'_, DbState>,
    input: ListStoriesInput,
) -> Result<Vec<StorySummary>, String> {
    crate::db::with_connection(&state, |conn| {
        let mut sql = LIST_STORIES_SQL.to_string();
        let mut conditions: Vec<String> = Vec::new();
        if input.sprint_id.is_some() {
            conditions.push("us.sprint_id = ?2".to_string());
        }
        if input.version_id.is_some() {
            let idx = if input.sprint_id.is_some() { 3 } else { 2 };
            conditions.push(format!("us.version_id = ?{idx}"));
        }
        if input.epic_id.is_some() {
            let idx = 2
                + input.sprint_id.is_some() as usize
                + input.version_id.is_some() as usize;
            conditions.push(format!("us.epic_id = ?{idx}"));
        }
        if !conditions.is_empty() {
            sql.push_str(" AND ");
            sql.push_str(&conditions.join(" AND "));
        }
        sql.push_str(" ORDER BY us.workflow_column_id, us.order_index ASC");

        let mut stmt = conn.prepare(&sql)?;
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(input.project_id.clone())];
        if let Some(ref sid) = input.sprint_id {
            params_vec.push(Box::new(sid.clone()));
        }
        if let Some(ref vid) = input.version_id {
            params_vec.push(Box::new(vid.clone()));
        }
        if let Some(ref eid) = input.epic_id {
            params_vec.push(Box::new(eid.clone()));
        }
        let param_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

        let rows = stmt
            .query_map(param_refs.as_slice(), row_to_summary)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        enrich_summaries(conn, &input.project_id, rows)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn get_story(
    state: State<'_, DbState>,
    project_id: String,
    id: String,
) -> Result<StoryDetail, String> {
    crate::db::with_connection(&state, |conn| get_story_internal(conn, &project_id, &id))
        .map_err(map_db_err)
}

#[tauri::command]
pub fn create_story(
    state: State<'_, DbState>,
    input: CreateStoryInput,
) -> Result<StoryDetail, String> {
    if let Err(msg) = validate_preamble(&input.as_role, &input.i_want, &input.so_that, &input.done_when) {
        return Err(msg);
    }
    if input.why.as_deref().unwrap_or("").trim().is_empty() {
        return Err("Why is required".into());
    }
    if input.where_text.as_deref().unwrap_or("").trim().is_empty() {
        return Err("Where is required".into());
    }
    let acceptance_count = input
        .acceptance
        .as_ref()
        .map(|items| items.iter().filter(|i| !i.text.trim().is_empty()).count())
        .unwrap_or(0);
    if acceptance_count < 2 {
        return Err("At least 2 observable acceptance criteria are required".into());
    }
    let i_want = input.i_want.as_deref().unwrap_or("").trim().to_string();
    let title = derive_title(&input.title, &i_want);
    validate_title(&title)?;
    crate::db::with_connection(&state, |conn| {
        validate_story_relations(
            conn,
            &input.project_id,
            input.epic_id.as_deref(),
            input.version_id.as_deref(),
            input.sprint_id.as_deref(),
        )
        .map_err(|msg| rusqlite::Error::InvalidParameterName(msg))?;
        let id = next_story_id(conn, &input.project_id)?;
        let now = now_iso();
        let column_id = if let Some(cid) = input.workflow_column_id {
            cid
        } else {
            first_workflow_column_id(conn, &input.project_id)?
        };
        let order_index: i64 = conn.query_row(
            "SELECT COALESCE(MAX(order_index), -1) + 1 FROM user_stories
             WHERE project_id = ?1 AND workflow_column_id = ?2",
            params![input.project_id, column_id],
            |row| row.get(0),
        )?;
        let moscow = input.moscow.unwrap_or_else(|| "Must".to_string());
        conn.execute(
            "INSERT INTO user_stories (
                id, project_id, epic_id, version_id, sprint_id, workflow_column_id,
                title, as_role, i_want, so_that, why, where_text, approach, done_when,
                moscow, ready, status, missing_note, tests, tests_status,
                out_of_scope, boundary_notes, architecture_refs, api_db_impact, security_notes,
                related_decisions, planned_json, order_index, created_at, updated_at
             ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,0,'❌',NULL,'required','pending',?16,?17,?18,?19,?20,?21,?22,?23,?24,?25)",
            params![
                id,
                input.project_id,
                input.epic_id,
                input.version_id,
                input.sprint_id,
                column_id,
                title,
                input.as_role.as_ref().map(|s| s.trim().to_string()),
                Some(i_want),
                input.so_that.as_ref().map(|s| s.trim().to_string()),
                input.why,
                input.where_text,
                input.approach,
                input.done_when.as_ref().map(|s| s.trim().to_string()),
                moscow,
                input.out_of_scope,
                input.boundary_notes,
                input.architecture_refs,
                input.api_db_impact,
                input.security_notes,
                input.related_decisions,
                input.planned_json,
                order_index,
                now,
                now
            ],
        )?;
        if let Some(items) = &input.acceptance {
            for (index, item) in items.iter().enumerate() {
                let text = item.text.trim();
                if text.is_empty() {
                    continue;
                }
                let ac_id = item.id.clone().unwrap_or_else(new_id);
                conn.execute(
                    "INSERT INTO acceptance_criteria (id, project_id, story_id, text, checked, order_index)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![
                        ac_id,
                        input.project_id,
                        id,
                        text,
                        if item.checked { 1i64 } else { 0i64 },
                        index as i64
                    ],
                )?;
            }
        }
        get_story_internal(conn, &input.project_id, &id)
    })
    .map_err(map_db_err)
}

fn get_story_internal(conn: &Connection, project_id: &str, id: &str) -> rusqlite::Result<StoryDetail> {
    let mut detail = conn.query_row(STORY_DETAIL_SQL, params![project_id, id], map_story_detail_row)?;
    detail.acceptance = load_acceptance(conn, project_id, id)?;
    detail.depends_on = load_dependencies(conn, project_id, id)?;
    detail.blocked = is_blocked(conn, project_id, id)?;
    Ok(detail)
}

#[tauri::command]
pub fn update_story(
    state: State<'_, DbState>,
    input: UpdateStoryInput,
) -> Result<StoryDetail, String> {
    if let Some(ref title) = input.title {
        validate_title(title)?;
    }
    crate::db::with_connection(&state, |conn| {
        let acceptance = load_acceptance(conn, &input.project_id, &input.id)?;
        let status = input.status.clone().unwrap_or_else(|| {
            conn.query_row(
                "SELECT status FROM user_stories WHERE project_id = ?1 AND id = ?2",
                params![input.project_id, input.id],
                |row| row.get(0),
            )
            .unwrap_or_else(|_| "❌".to_string())
        });
        if let Err(msg) = validate_status_rules(&status, &input.missing_note, &acceptance) {
            return Err(rusqlite::Error::InvalidParameterName(msg));
        }

        let (cur_epic, cur_version, cur_sprint): (Option<String>, Option<String>, Option<String>) =
            conn.query_row(
                "SELECT epic_id, version_id, sprint_id FROM user_stories
                 WHERE project_id = ?1 AND id = ?2",
                params![input.project_id, input.id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )?;

        let epic_id = input.epic_id.as_ref().or(cur_epic.as_ref());
        let version_id = input.version_id.as_ref().or(cur_version.as_ref());
        let sprint_id = input.sprint_id.as_ref().or(cur_sprint.as_ref());
        validate_story_relations(
            conn,
            &input.project_id,
            epic_id.map(String::as_str),
            version_id.map(String::as_str),
            sprint_id.map(String::as_str),
        )
        .map_err(|msg| rusqlite::Error::InvalidParameterName(msg))?;

        let now = now_iso();
        let title = input.title.as_ref().map(|t| t.trim().to_string());
        conn.execute(
            "UPDATE user_stories SET
                title = COALESCE(?1, title),
                epic_id = COALESCE(?2, epic_id),
                version_id = COALESCE(?3, version_id),
                sprint_id = COALESCE(?4, sprint_id),
                as_role = COALESCE(?5, as_role),
                i_want = COALESCE(?6, i_want),
                so_that = COALESCE(?7, so_that),
                why = COALESCE(?8, why),
                where_text = COALESCE(?9, where_text),
                approach = COALESCE(?10, approach),
                done_when = COALESCE(?11, done_when),
                moscow = COALESCE(?12, moscow),
                ready = COALESCE(?13, ready),
                status = COALESCE(?14, status),
                missing_note = COALESCE(?15, missing_note),
                tests = COALESCE(?16, tests),
                tests_status = COALESCE(?17, tests_status),
                out_of_scope = COALESCE(?18, out_of_scope),
                boundary_notes = COALESCE(?19, boundary_notes),
                architecture_refs = COALESCE(?20, architecture_refs),
                api_db_impact = COALESCE(?21, api_db_impact),
                security_notes = COALESCE(?22, security_notes),
                related_decisions = COALESCE(?23, related_decisions),
                planned_json = COALESCE(?24, planned_json),
                record_json = COALESCE(?25, record_json),
                record_files = COALESCE(?26, record_files),
                record_backend = COALESCE(?27, record_backend),
                record_frontend = COALESCE(?28, record_frontend),
                record_scripts = COALESCE(?29, record_scripts),
                record_executed = COALESCE(?30, record_executed),
                updated_at = ?31
             WHERE project_id = ?32 AND id = ?33",
            params![
                title,
                input.epic_id,
                input.version_id,
                input.sprint_id,
                input.as_role,
                input.i_want,
                input.so_that,
                input.why,
                input.where_text,
                input.approach,
                input.done_when,
                input.moscow,
                input.ready.map(|r| if r { 1i64 } else { 0i64 }),
                input.status,
                input.missing_note,
                input.tests,
                input.tests_status,
                input.out_of_scope,
                input.boundary_notes,
                input.architecture_refs,
                input.api_db_impact,
                input.security_notes,
                input.related_decisions,
                input.planned_json,
                input.record_json,
                input.record_files,
                input.record_backend,
                input.record_frontend,
                input.record_scripts,
                input.record_executed,
                now,
                input.project_id,
                input.id
            ],
        )?;
        get_story_internal(conn, &input.project_id, &input.id)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn delete_story(
    state: State<'_, DbState>,
    project_id: String,
    id: String,
) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute(
            "DELETE FROM user_stories WHERE project_id = ?1 AND id = ?2",
            params![project_id, id],
        )?;
        Ok(())
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn set_story_acceptance(
    state: State<'_, DbState>,
    input: SetStoryAcceptanceInput,
) -> Result<Vec<AcceptanceCriterion>, String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute(
            "DELETE FROM acceptance_criteria WHERE project_id = ?1 AND story_id = ?2",
            params![input.project_id, input.story_id],
        )?;
        for (index, item) in input.items.iter().enumerate() {
            let id = item.id.clone().unwrap_or_else(new_id);
            conn.execute(
                "INSERT INTO acceptance_criteria (id, project_id, story_id, text, checked, order_index)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    id,
                    input.project_id,
                    input.story_id,
                    item.text.trim(),
                    if item.checked { 1i64 } else { 0i64 },
                    index as i64
                ],
            )?;
        }
        load_acceptance(conn, &input.project_id, &input.story_id)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn set_story_dependencies(
    state: State<'_, DbState>,
    input: SetStoryDependenciesInput,
) -> Result<Vec<String>, String> {
    crate::db::with_connection(&state, |conn| {
        if let Err(msg) =
            detect_dependency_cycle(conn, &input.project_id, &input.story_id, &input.depends_on)
        {
            return Err(rusqlite::Error::InvalidParameterName(msg));
        }
        conn.execute(
            "DELETE FROM story_dependencies WHERE project_id = ?1 AND story_id = ?2",
            params![input.project_id, input.story_id],
        )?;
        for dep in &input.depends_on {
            conn.execute(
                "INSERT INTO story_dependencies (story_id, depends_on_id, project_id) VALUES (?1, ?2, ?3)",
                params![input.story_id, dep, input.project_id],
            )?;
        }
        load_dependencies(conn, &input.project_id, &input.story_id)
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn move_story(state: State<'_, DbState>, input: MoveStoryInput) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute_batch("BEGIN IMMEDIATE")?;
        let result = (|| -> rusqlite::Result<()> {
            let maps_status: Option<String> = conn.query_row(
                "SELECT maps_status FROM workflow_columns WHERE id = ?1",
                params![input.workflow_column_id],
                |row| row.get(0),
            )?;

            if let Some(s) = maps_status {
                conn.execute(
                    "UPDATE user_stories SET status = ?1 WHERE project_id = ?2 AND id = ?3",
                    params![s, input.project_id, input.story_id],
                )?;
            }

            conn.execute(
                "UPDATE user_stories SET workflow_column_id = ?1, order_index = ?2, updated_at = ?3
                 WHERE project_id = ?4 AND id = ?5",
                params![
                    input.workflow_column_id,
                    input.order_index,
                    now_iso(),
                    input.project_id,
                    input.story_id
                ],
            )?;
            Ok(())
        })();
        if result.is_ok() {
            conn.execute_batch("COMMIT")?;
        } else {
            conn.execute_batch("ROLLBACK")?;
        }
        result
    })
    .map_err(map_db_err)
}

#[tauri::command]
pub fn reorder_stories(
    state: State<'_, DbState>,
    project_id: String,
    workflow_column_id: String,
    ordered_ids: Vec<String>,
) -> Result<(), String> {
    crate::db::with_connection(&state, |conn| {
        conn.execute_batch("BEGIN IMMEDIATE")?;
        let result = (|| -> rusqlite::Result<()> {
            for (index, story_id) in ordered_ids.iter().enumerate() {
                conn.execute(
                    "UPDATE user_stories SET order_index = ?1, updated_at = ?2
                     WHERE project_id = ?3 AND id = ?4 AND workflow_column_id = ?5",
                    params![index as i64, now_iso(), project_id, story_id, workflow_column_id],
                )?;
            }
            Ok(())
        })();
        if result.is_ok() {
            conn.execute_batch("COMMIT")?;
        } else {
            conn.execute_batch("ROLLBACK")?;
        }
        result
    })
    .map_err(map_db_err)
}
