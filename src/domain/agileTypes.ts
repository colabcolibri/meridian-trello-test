export type Moscow = "Must" | "Should" | "Could" | "Wont";
export type StoryStatus = "❌" | "🔶" | "✅";
export type VersionStatus = "planned" | "active" | "complete";
export type SprintStatus = "planned" | "active" | "complete";
export type EpicStatus = "active" | "complete" | "paused";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** version-template.md — frontmatter + body sections */
export interface Version {
  id: string;
  project_id: string;
  title: string;
  status: VersionStatus;
  outcome: string | null;
  objective: string | null;
  done_criteria: string | null;
  included_json: string | null;
  explicitly_out: string | null;
  go_live_checklist_json: string | null;
  created_at: string;
  updated_at: string;
}

/** epic-template.md — frontmatter + body sections */
export interface Epic {
  id: string;
  project_id: string;
  title: string;
  status: EpicStatus;
  outcome: string | null;
  capability: string | null;
  expected_outcome: string | null;
  out_of_scope: string | null;
  notes: string | null;
  profiles_json: string | null;
  version_ids_json: string | null;
  created_at: string;
  updated_at: string;
}

/** sprint-template.md — frontmatter + body sections */
export interface Sprint {
  id: string;
  project_id: string;
  version_id: string;
  title: string;
  status: SprintStatus;
  goal: string | null;
  done_when: string | null;
  out_of_scope: string | null;
  retrospective_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowColumn {
  id: string;
  project_id: string;
  name: string;
  order_index: number;
  maps_status: string | null;
}

export interface StorySummary {
  id: string;
  project_id: string;
  epic_id: string | null;
  version_id: string | null;
  sprint_id: string | null;
  workflow_column_id: string;
  workflow_column_name: string;
  title: string;
  as_role: string | null;
  i_want: string | null;
  so_that: string | null;
  why: string | null;
  done_when: string | null;
  moscow: Moscow;
  ready: boolean;
  status: StoryStatus;
  order_index: number;
  tests: string;
  tests_status: string;
  acceptance_total: number;
  acceptance_done: number;
  acceptance_preview: AcceptanceCriterion[];
  depends_on_count: number;
  blocked: boolean;
}

export interface AcceptanceCriterion {
  id: string;
  story_id: string;
  text: string;
  checked: boolean;
  order_index: number;
}

/** us-template.md schema v2 — Intent · Plan · Record · Boundaries */
export interface StoryDetail {
  id: string;
  project_id: string;
  epic_id: string | null;
  version_id: string | null;
  sprint_id: string | null;
  workflow_column_id: string;
  title: string;
  as_role: string | null;
  i_want: string | null;
  so_that: string | null;
  why: string | null;
  where_text: string | null;
  approach: string | null;
  done_when: string | null;
  moscow: Moscow;
  ready: boolean;
  status: StoryStatus;
  missing_note: string | null;
  tests: string;
  tests_status: string;
  out_of_scope: string | null;
  boundary_notes: string | null;
  architecture_refs: string | null;
  api_db_impact: string | null;
  security_notes: string | null;
  related_decisions: string | null;
  planned_json: string | null;
  record_json: string | null;
  record_files: string | null;
  record_backend: string | null;
  record_frontend: string | null;
  record_scripts: string | null;
  record_executed: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  acceptance: AcceptanceCriterion[];
  depends_on: string[];
  blocked: boolean;
}

export interface StoryFilters {
  sprintId?: string | null;
  versionId?: string | null;
  epicId?: string | null;
}

export interface AcceptanceItemInput {
  id?: string;
  text: string;
  checked: boolean;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface VersionIncludedEpic {
  id: string;
  title: string;
}

export interface VersionIncluded {
  epics: VersionIncludedEpic[];
  story_count: number;
  sprint_count: number;
}
