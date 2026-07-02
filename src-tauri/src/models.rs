use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Version {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub status: String,
    pub outcome: Option<String>,
    pub objective: Option<String>,
    pub done_criteria: Option<String>,
    pub included_json: Option<String>,
    pub explicitly_out: Option<String>,
    pub go_live_checklist_json: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Epic {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub status: String,
    pub outcome: Option<String>,
    pub capability: Option<String>,
    pub expected_outcome: Option<String>,
    pub out_of_scope: Option<String>,
    pub notes: Option<String>,
    pub profiles_json: Option<String>,
    pub version_ids_json: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sprint {
    pub id: String,
    pub project_id: String,
    pub version_id: String,
    pub title: String,
    pub status: String,
    pub goal: Option<String>,
    pub done_when: Option<String>,
    pub out_of_scope: Option<String>,
    pub retrospective_json: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowColumn {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub order_index: i64,
    pub maps_status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorySummary {
    pub id: String,
    pub project_id: String,
    pub epic_id: Option<String>,
    pub version_id: Option<String>,
    pub sprint_id: Option<String>,
    pub workflow_column_id: String,
    pub workflow_column_name: String,
    pub title: String,
    pub as_role: Option<String>,
    pub i_want: Option<String>,
    pub so_that: Option<String>,
    pub why: Option<String>,
    pub done_when: Option<String>,
    pub moscow: String,
    pub ready: bool,
    pub status: String,
    pub order_index: i64,
    pub tests: String,
    pub tests_status: String,
    pub acceptance_total: i64,
    pub acceptance_done: i64,
    pub acceptance_preview: Vec<AcceptanceCriterion>,
    pub depends_on_count: i64,
    pub blocked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AcceptanceCriterion {
    pub id: String,
    pub story_id: String,
    pub text: String,
    pub checked: bool,
    pub order_index: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoryDetail {
    pub id: String,
    pub project_id: String,
    pub epic_id: Option<String>,
    pub version_id: Option<String>,
    pub sprint_id: Option<String>,
    pub workflow_column_id: String,
    pub title: String,
    pub as_role: Option<String>,
    pub i_want: Option<String>,
    pub so_that: Option<String>,
    pub why: Option<String>,
    pub where_text: Option<String>,
    pub approach: Option<String>,
    pub done_when: Option<String>,
    pub moscow: String,
    pub ready: bool,
    pub status: String,
    pub missing_note: Option<String>,
    pub tests: String,
    pub tests_status: String,
    pub out_of_scope: Option<String>,
    pub boundary_notes: Option<String>,
    pub architecture_refs: Option<String>,
    pub api_db_impact: Option<String>,
    pub security_notes: Option<String>,
    pub related_decisions: Option<String>,
    pub planned_json: Option<String>,
    pub record_json: Option<String>,
    pub record_files: Option<String>,
    pub record_backend: Option<String>,
    pub record_frontend: Option<String>,
    pub record_scripts: Option<String>,
    pub record_executed: Option<String>,
    pub order_index: i64,
    pub created_at: String,
    pub updated_at: String,
    pub acceptance: Vec<AcceptanceCriterion>,
    pub depends_on: Vec<String>,
    pub blocked: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectInput {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectInput {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SetLastProjectInput {
    pub project_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateVersionInput {
    pub project_id: String,
    pub id: Option<String>,
    pub title: String,
    pub status: Option<String>,
    pub outcome: Option<String>,
    pub objective: Option<String>,
    pub done_criteria: Option<String>,
    pub included_json: Option<String>,
    pub explicitly_out: Option<String>,
    pub go_live_checklist_json: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateVersionInput {
    pub project_id: String,
    pub id: String,
    pub title: String,
    pub status: String,
    pub outcome: Option<String>,
    pub objective: Option<String>,
    pub done_criteria: Option<String>,
    pub included_json: Option<String>,
    pub explicitly_out: Option<String>,
    pub go_live_checklist_json: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEpicInput {
    pub project_id: String,
    pub id: Option<String>,
    pub title: String,
    pub status: Option<String>,
    pub outcome: Option<String>,
    pub capability: Option<String>,
    pub expected_outcome: Option<String>,
    pub out_of_scope: Option<String>,
    pub notes: Option<String>,
    pub profiles_json: Option<String>,
    pub version_ids_json: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEpicInput {
    pub project_id: String,
    pub id: String,
    pub title: String,
    pub status: String,
    pub outcome: Option<String>,
    pub capability: Option<String>,
    pub expected_outcome: Option<String>,
    pub out_of_scope: Option<String>,
    pub notes: Option<String>,
    pub profiles_json: Option<String>,
    pub version_ids_json: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSprintInput {
    pub project_id: String,
    pub version_id: String,
    pub id: Option<String>,
    pub title: String,
    pub status: Option<String>,
    pub goal: Option<String>,
    pub done_when: Option<String>,
    pub out_of_scope: Option<String>,
    pub retrospective_json: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSprintInput {
    pub project_id: String,
    pub id: String,
    pub title: String,
    pub status: String,
    pub goal: Option<String>,
    pub done_when: Option<String>,
    pub out_of_scope: Option<String>,
    pub retrospective_json: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SetLastSprintInput {
    pub project_id: String,
    pub sprint_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListStoriesInput {
    pub project_id: String,
    pub sprint_id: Option<String>,
    pub version_id: Option<String>,
    pub epic_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateStoryInput {
    pub project_id: String,
    pub title: String,
    pub epic_id: Option<String>,
    pub version_id: Option<String>,
    pub sprint_id: Option<String>,
    pub workflow_column_id: Option<String>,
    pub as_role: Option<String>,
    pub i_want: Option<String>,
    pub so_that: Option<String>,
    pub why: Option<String>,
    pub where_text: Option<String>,
    pub approach: Option<String>,
    pub done_when: Option<String>,
    pub moscow: Option<String>,
    pub out_of_scope: Option<String>,
    pub boundary_notes: Option<String>,
    pub architecture_refs: Option<String>,
    pub api_db_impact: Option<String>,
    pub security_notes: Option<String>,
    pub related_decisions: Option<String>,
    pub planned_json: Option<String>,
    pub acceptance: Option<Vec<AcceptanceItemInput>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStoryInput {
    pub project_id: String,
    pub id: String,
    pub title: Option<String>,
    pub epic_id: Option<String>,
    pub version_id: Option<String>,
    pub sprint_id: Option<String>,
    pub as_role: Option<String>,
    pub i_want: Option<String>,
    pub so_that: Option<String>,
    pub why: Option<String>,
    pub where_text: Option<String>,
    pub approach: Option<String>,
    pub done_when: Option<String>,
    pub moscow: Option<String>,
    pub ready: Option<bool>,
    pub status: Option<String>,
    pub missing_note: Option<String>,
    pub tests: Option<String>,
    pub tests_status: Option<String>,
    pub out_of_scope: Option<String>,
    pub boundary_notes: Option<String>,
    pub architecture_refs: Option<String>,
    pub api_db_impact: Option<String>,
    pub security_notes: Option<String>,
    pub related_decisions: Option<String>,
    pub planned_json: Option<String>,
    pub record_json: Option<String>,
    pub record_files: Option<String>,
    pub record_backend: Option<String>,
    pub record_frontend: Option<String>,
    pub record_scripts: Option<String>,
    pub record_executed: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AcceptanceItemInput {
    pub id: Option<String>,
    pub text: String,
    pub checked: bool,
}

#[derive(Debug, Deserialize)]
pub struct SetStoryAcceptanceInput {
    pub project_id: String,
    pub story_id: String,
    pub items: Vec<AcceptanceItemInput>,
}

#[derive(Debug, Deserialize)]
pub struct SetStoryDependenciesInput {
    pub project_id: String,
    pub story_id: String,
    pub depends_on: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct MoveStoryInput {
    pub project_id: String,
    pub story_id: String,
    pub workflow_column_id: String,
    pub order_index: i64,
}
