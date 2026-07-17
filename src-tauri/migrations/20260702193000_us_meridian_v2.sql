-- US Meridian schema v2 fields + workflow Refine column

ALTER TABLE user_stories ADD COLUMN tests TEXT NOT NULL DEFAULT 'required';
ALTER TABLE user_stories ADD COLUMN tests_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE user_stories ADD COLUMN out_of_scope TEXT;
ALTER TABLE user_stories ADD COLUMN boundary_notes TEXT;
ALTER TABLE user_stories ADD COLUMN architecture_refs TEXT;
ALTER TABLE user_stories ADD COLUMN planned_json TEXT;
ALTER TABLE user_stories ADD COLUMN record_json TEXT;

-- Add Refine column to projects that still use the 5-column v3 seed
INSERT INTO workflow_columns (id, project_id, name, order_index, maps_status)
SELECT lower(hex(randomblob(16))), p.id, 'Refine', 1, '❌'
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM workflow_columns wc WHERE wc.project_id = p.id AND wc.name = 'Refine'
);

UPDATE workflow_columns SET order_index = 2 WHERE name = 'Pronta';
UPDATE workflow_columns SET order_index = 3 WHERE name = 'Em progresso';
UPDATE workflow_columns SET order_index = 4 WHERE name = 'Revisão';
UPDATE workflow_columns SET order_index = 5 WHERE name = 'Concluída';
