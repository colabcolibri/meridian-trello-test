-- Epic ↔ Version N:N junction (replaces version_ids_json write path)

CREATE TABLE IF NOT EXISTS version_epics (
  project_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  epic_id TEXT NOT NULL,
  PRIMARY KEY (project_id, version_id, epic_id),
  FOREIGN KEY (project_id, version_id) REFERENCES versions(project_id, id) ON DELETE CASCADE,
  FOREIGN KEY (project_id, epic_id) REFERENCES epics(project_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_version_epics_version ON version_epics(project_id, version_id);
CREATE INDEX IF NOT EXISTS idx_version_epics_epic ON version_epics(project_id, epic_id);

-- Backfill from legacy JSON array on epics
INSERT OR IGNORE INTO version_epics (project_id, version_id, epic_id)
SELECT e.project_id, TRIM(j.value, '"'), e.id
FROM epics e
JOIN json_each(e.version_ids_json) j
WHERE e.version_ids_json IS NOT NULL
  AND TRIM(e.version_ids_json) != ''
  AND json_valid(e.version_ids_json);
