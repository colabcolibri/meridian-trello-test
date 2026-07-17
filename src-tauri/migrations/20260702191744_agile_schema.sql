-- Agile / Meridian-equivalent schema (v3)

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS versions (
  id TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('planned', 'active', 'complete')),
  outcome TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (project_id, id)
);

CREATE INDEX IF NOT EXISTS idx_versions_project ON versions(project_id);

CREATE TABLE IF NOT EXISTS epics (
  id TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'complete', 'paused')),
  outcome TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (project_id, id)
);

CREATE INDEX IF NOT EXISTS idx_epics_project ON epics(project_id);

CREATE TABLE IF NOT EXISTS sprints (
  id TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('planned', 'active', 'complete')),
  goal TEXT,
  done_when TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (project_id, id),
  FOREIGN KEY (project_id, version_id) REFERENCES versions(project_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sprints_version ON sprints(project_id, version_id);

CREATE TABLE IF NOT EXISTS workflow_columns (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  maps_status TEXT,
  UNIQUE(project_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_workflow_columns_project ON workflow_columns(project_id);

CREATE TABLE IF NOT EXISTS user_stories (
  id TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  epic_id TEXT,
  version_id TEXT,
  sprint_id TEXT,
  workflow_column_id TEXT NOT NULL REFERENCES workflow_columns(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  as_role TEXT,
  i_want TEXT,
  so_that TEXT,
  why TEXT,
  where_text TEXT,
  approach TEXT,
  done_when TEXT,
  moscow TEXT NOT NULL DEFAULT 'Must' CHECK(moscow IN ('Must', 'Should', 'Could', 'Wont')),
  ready INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT '❌',
  missing_note TEXT,
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (project_id, id),
  FOREIGN KEY (project_id, epic_id) REFERENCES epics(project_id, id) ON DELETE SET NULL,
  FOREIGN KEY (project_id, version_id) REFERENCES versions(project_id, id) ON DELETE SET NULL,
  FOREIGN KEY (project_id, sprint_id) REFERENCES sprints(project_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stories_sprint ON user_stories(project_id, sprint_id);
CREATE INDEX IF NOT EXISTS idx_stories_version ON user_stories(project_id, version_id);
CREATE INDEX IF NOT EXISTS idx_stories_epic ON user_stories(project_id, epic_id);
CREATE INDEX IF NOT EXISTS idx_stories_column ON user_stories(workflow_column_id);

CREATE TABLE IF NOT EXISTS acceptance_criteria (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  story_id TEXT NOT NULL,
  text TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (project_id, story_id) REFERENCES user_stories(project_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_acceptance_story ON acceptance_criteria(project_id, story_id);

CREATE TABLE IF NOT EXISTS story_dependencies (
  story_id TEXT NOT NULL,
  depends_on_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  PRIMARY KEY (story_id, depends_on_id),
  FOREIGN KEY (project_id, story_id) REFERENCES user_stories(project_id, id) ON DELETE CASCADE,
  FOREIGN KEY (project_id, depends_on_id) REFERENCES user_stories(project_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_story_deps_story ON story_dependencies(project_id, story_id);
