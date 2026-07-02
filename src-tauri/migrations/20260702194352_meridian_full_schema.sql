-- Meridian full schema: US Plan/Record, Version, Epic, Sprint body sections

-- User story — Plan + Record (section-contracts schema v2)
ALTER TABLE user_stories ADD COLUMN api_db_impact TEXT;
ALTER TABLE user_stories ADD COLUMN security_notes TEXT;
ALTER TABLE user_stories ADD COLUMN related_decisions TEXT;
ALTER TABLE user_stories ADD COLUMN record_files TEXT;
ALTER TABLE user_stories ADD COLUMN record_backend TEXT;
ALTER TABLE user_stories ADD COLUMN record_frontend TEXT;
ALTER TABLE user_stories ADD COLUMN record_scripts TEXT;
ALTER TABLE user_stories ADD COLUMN record_executed TEXT;

-- Version — version-template.md sections
ALTER TABLE versions ADD COLUMN objective TEXT;
ALTER TABLE versions ADD COLUMN done_criteria TEXT;
ALTER TABLE versions ADD COLUMN included_json TEXT;
ALTER TABLE versions ADD COLUMN explicitly_out TEXT;
ALTER TABLE versions ADD COLUMN go_live_checklist_json TEXT;

-- Epic — epic-template.md sections
ALTER TABLE epics ADD COLUMN capability TEXT;
ALTER TABLE epics ADD COLUMN expected_outcome TEXT;
ALTER TABLE epics ADD COLUMN out_of_scope TEXT;
ALTER TABLE epics ADD COLUMN notes TEXT;
ALTER TABLE epics ADD COLUMN profiles_json TEXT;
ALTER TABLE epics ADD COLUMN version_ids_json TEXT;

-- Sprint — sprint-template.md sections
ALTER TABLE sprints ADD COLUMN out_of_scope TEXT;
ALTER TABLE sprints ADD COLUMN retrospective_json TEXT;
