import type {
  AcceptanceCriterion,
  Epic,
  Project,
  Sprint,
  StoryDetail,
  Version,
  VersionIncluded,
  WorkflowColumn,
} from "../../../domain/agileTypes";

const STORAGE_KEY = "meridian-agile-browser-v1";

export interface VersionEpicLink {
  project_id: string;
  version_id: string;
  epic_id: string;
}

export interface StoryDep {
  project_id: string;
  story_id: string;
  depends_on_id: string;
}

export interface StoredStory extends Omit<StoryDetail, "acceptance" | "depends_on" | "blocked"> {}

export interface BrowserDb {
  prefs: Record<string, string>;
  projects: Project[];
  versions: Version[];
  epics: Epic[];
  versionEpics: VersionEpicLink[];
  sprints: Sprint[];
  workflowColumns: WorkflowColumn[];
  stories: StoredStory[];
  acceptance: AcceptanceCriterion[];
  dependencies: StoryDep[];
}

function emptyDb(): BrowserDb {
  return {
    prefs: {},
    projects: [],
    versions: [],
    epics: [],
    versionEpics: [],
    sprints: [],
    workflowColumns: [],
    stories: [],
    acceptance: [],
    dependencies: [],
  };
}

export function loadDb(): BrowserDb {
  if (typeof localStorage === "undefined") return emptyDb();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDb();
    return JSON.parse(raw) as BrowserDb;
  } catch {
    return emptyDb();
  }
}

export function saveDb(db: BrowserDb): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function newId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

function seedWorkflowColumns(projectId: string): WorkflowColumn[] {
  const defaults: Array<[string, number, string | null]> = [
    ["Backlog", 0, "❌"],
    ["Refine", 1, "❌"],
    ["Ready", 2, "❌"],
    ["In progress", 3, "🔶"],
    ["Review", 4, "🔶"],
    ["Done", 5, "✅"],
  ];
  return defaults.map(([name, order_index, maps_status]) => ({
    id: newId(),
    project_id: projectId,
    name,
    order_index,
    maps_status,
  }));
}

function nextVersionId(db: BrowserDb, projectId: string): string {
  const nums = db.versions
    .filter((v) => v.project_id === projectId && /^v\d+$/.test(v.id))
    .map((v) => parseInt(v.id.slice(1), 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return `v${max + 1}`;
}

function nextEpicId(db: BrowserDb, projectId: string): string {
  const nums = db.epics
    .filter((e) => e.project_id === projectId && /^EPIC-\d+$/.test(e.id))
    .map((e) => parseInt(e.id.slice(5), 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return `EPIC-${String(max + 1).padStart(2, "0")}`;
}

function nextSprintId(db: BrowserDb, projectId: string, versionId: string): string {
  const prefix = `${versionId}-S`;
  const nums = db.sprints
    .filter((s) => s.project_id === projectId && s.id.startsWith(prefix))
    .map((s) => parseInt(s.id.slice(prefix.length), 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${max + 1}`;
}

function nextStoryId(db: BrowserDb, projectId: string): string {
  const nums = db.stories
    .filter((s) => s.project_id === projectId && /^US-\d+$/.test(s.id))
    .map((s) => parseInt(s.id.slice(3), 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return `US-${String(max + 1).padStart(4, "0")}`;
}

function epicLinked(db: BrowserDb, projectId: string, versionId: string, epicId: string): boolean {
  return db.versionEpics.some(
    (l) => l.project_id === projectId && l.version_id === versionId && l.epic_id === epicId,
  );
}

function validateRelationsDb(
  db: BrowserDb,
  projectId: string,
  epicId?: string | null,
  versionId?: string | null,
  sprintId?: string | null,
): void {
  if (versionId && epicId && !epicLinked(db, projectId, versionId, epicId)) {
    throw new Error(`Epic ${epicId} is not linked to version ${versionId}`);
  }
  if (versionId && sprintId) {
    const sprint = db.sprints.find((s) => s.project_id === projectId && s.id === sprintId);
    if (sprint && sprint.version_id !== versionId) {
      throw new Error(`Sprint ${sprintId} belongs to version ${sprint.version_id}, not ${versionId}`);
    }
  }
}

function storyDetail(db: BrowserDb, projectId: string, id: string): StoryDetail {
  const story = db.stories.find((s) => s.project_id === projectId && s.id === id);
  if (!story) throw new Error("Story not found");
  const acceptance = db.acceptance
    .filter((a) => a.story_id === id)
    .sort((a, b) => a.order_index - b.order_index);
  const depends_on = db.dependencies
    .filter((d) => d.project_id === projectId && d.story_id === id)
    .map((d) => d.depends_on_id);
  const blocked = depends_on.some((depId) => {
    const dep = db.stories.find((s) => s.id === depId);
    return dep && dep.status !== "✅";
  });
  return { ...story, acceptance, depends_on, blocked };
}

function buildSummary(db: BrowserDb, story: StoredStory) {
  const col = db.workflowColumns.find((c) => c.id === story.workflow_column_id);
  const acceptance = db.acceptance.filter((a) => a.story_id === story.id);
  const preview = [...acceptance].sort((a, b) => a.order_index - b.order_index).slice(0, 3);
  const depends_on = db.dependencies.filter(
    (d) => d.project_id === story.project_id && d.story_id === story.id,
  );
  const blocked = depends_on.some((d) => {
    const dep = db.stories.find((s) => s.id === d.depends_on_id);
    return dep && dep.status !== "✅";
  });
  return {
    ...story,
    workflow_column_name: col?.name ?? "",
    acceptance_total: acceptance.length,
    acceptance_done: acceptance.filter((a) => a.checked).length,
    acceptance_preview: preview,
    depends_on_count: depends_on.length,
    blocked,
  };
}

let singleton: BrowserAgileStore | null = null;

export class BrowserAgileStore {
  private db: BrowserDb;

  private constructor() {
    this.db = loadDb();
  }

  static instance(): BrowserAgileStore {
    if (!singleton) singleton = new BrowserAgileStore();
    return singleton;
  }

  private persist(): void {
    saveDb(this.db);
  }

  invoke<T>(command: string, args?: Record<string, unknown>): T {
    return this.dispatch(command, args) as T;
  }

  private dispatch(command: string, args?: Record<string, unknown>): unknown {
    switch (command) {
      case "list_projects":
        return this.db.projects;
      case "get_project": {
        const id = args?.id as string;
        const p = this.db.projects.find((x) => x.id === id);
        if (!p) throw new Error("Project not found");
        return p;
      }
      case "create_project": {
        const input = args?.input as { name: string; description?: string | null };
        const now = nowIso();
        const id = newId();
        const project: Project = {
          id,
          name: input.name.trim(),
          description: input.description ?? null,
          created_at: now,
          updated_at: now,
        };
        this.db.projects.push(project);
        this.db.workflowColumns.push(...seedWorkflowColumns(id));
        this.persist();
        return project;
      }
      case "update_project": {
        const input = args?.input as { id: string; name: string; description?: string | null };
        const p = this.db.projects.find((x) => x.id === input.id);
        if (!p) throw new Error("Project not found");
        p.name = input.name.trim();
        p.description = input.description ?? null;
        p.updated_at = nowIso();
        this.persist();
        return p;
      }
      case "delete_project": {
        const id = args?.id as string;
        this.db.projects = this.db.projects.filter((p) => p.id !== id);
        this.db.versions = this.db.versions.filter((v) => v.project_id !== id);
        this.db.epics = this.db.epics.filter((e) => e.project_id !== id);
        this.db.sprints = this.db.sprints.filter((s) => s.project_id !== id);
        this.db.stories = this.db.stories.filter((s) => s.project_id !== id);
        this.db.workflowColumns = this.db.workflowColumns.filter((c) => c.project_id !== id);
        this.db.versionEpics = this.db.versionEpics.filter((l) => l.project_id !== id);
        this.db.acceptance = this.db.acceptance.filter((a) =>
          this.db.stories.some((s) => s.id === a.story_id),
        );
        this.db.dependencies = this.db.dependencies.filter((d) => d.project_id !== id);
        this.persist();
        return undefined;
      }
      case "get_last_project_id":
        return this.db.prefs.last_project_id ?? null;
      case "set_last_project_id": {
        const input = args?.input as { project_id?: string | null };
        if (input.project_id) this.db.prefs.last_project_id = input.project_id;
        else delete this.db.prefs.last_project_id;
        this.persist();
        return undefined;
      }
      case "list_versions":
        return this.db.versions.filter((v) => v.project_id === (args?.projectId as string));
      case "create_version": {
        const input = args?.input as Record<string, unknown>;
        const projectId = input.project_id as string;
        const now = nowIso();
        const id = (input.id as string | null) ?? nextVersionId(this.db, projectId);
        const version: Version = {
          id,
          project_id: projectId,
          title: (input.title as string).trim(),
          status: (input.status as Version["status"]) ?? "planned",
          outcome: (input.outcome as string | null) ?? null,
          objective: (input.objective as string | null) ?? null,
          done_criteria: (input.done_criteria as string | null) ?? null,
          included_json: null,
          explicitly_out: (input.explicitly_out as string | null) ?? null,
          go_live_checklist_json: (input.go_live_checklist_json as string | null) ?? null,
          created_at: now,
          updated_at: now,
        };
        this.db.versions.push(version);
        this.persist();
        return version;
      }
      case "update_version": {
        const input = args?.input as Record<string, unknown>;
        const projectId = input.project_id as string;
        const id = input.id as string;
        const v = this.db.versions.find((x) => x.project_id === projectId && x.id === id);
        if (!v) throw new Error("Version not found");
        v.title = (input.title as string).trim();
        v.status = input.status as Version["status"];
        v.outcome = (input.outcome as string | null) ?? v.outcome;
        v.objective = (input.objective as string | null) ?? v.objective;
        v.done_criteria = (input.done_criteria as string | null) ?? v.done_criteria;
        v.explicitly_out = (input.explicitly_out as string | null) ?? v.explicitly_out;
        v.go_live_checklist_json =
          (input.go_live_checklist_json as string | null) ?? v.go_live_checklist_json;
        v.updated_at = nowIso();
        this.persist();
        return v;
      }
      case "delete_version": {
        const projectId = args?.projectId as string;
        const id = args?.id as string;
        this.db.versions = this.db.versions.filter(
          (v) => !(v.project_id === projectId && v.id === id),
        );
        this.db.versionEpics = this.db.versionEpics.filter(
          (l) => !(l.project_id === projectId && l.version_id === id),
        );
        this.persist();
        return undefined;
      }
      case "get_version_included": {
        const projectId = args?.projectId as string;
        const versionId = args?.versionId as string;
        const links = this.db.versionEpics.filter(
          (l) => l.project_id === projectId && l.version_id === versionId,
        );
        const epics = links
          .map((l) => this.db.epics.find((e) => e.project_id === projectId && e.id === l.epic_id))
          .filter(Boolean)
          .map((e) => ({ id: e!.id, title: e!.title }));
        const included: VersionIncluded = {
          epics,
          story_count: this.db.stories.filter(
            (s) => s.project_id === projectId && s.version_id === versionId,
          ).length,
          sprint_count: this.db.sprints.filter(
            (s) => s.project_id === projectId && s.version_id === versionId,
          ).length,
        };
        return included;
      }
      case "list_epics":
        return this.db.epics.filter((e) => e.project_id === (args?.projectId as string));
      case "list_epics_for_version": {
        const projectId = args?.projectId as string;
        const versionId = args?.versionId as string;
        return this.db.versionEpics
          .filter((l) => l.project_id === projectId && l.version_id === versionId)
          .map((l) => {
            const e = this.db.epics.find((x) => x.project_id === projectId && x.id === l.epic_id)!;
            return { id: e.id, title: e.title };
          });
      }
      case "get_epic_versions": {
        const projectId = args?.projectId as string;
        const epicId = args?.epicId as string;
        return this.db.versionEpics
          .filter((l) => l.project_id === projectId && l.epic_id === epicId)
          .map((l) => l.version_id)
          .sort();
      }
      case "set_epic_versions": {
        const input = args?.input as {
          project_id: string;
          epic_id: string;
          version_ids: string[];
        };
        if (!input.version_ids.length) throw new Error("At least one version is required");
        this.db.versionEpics = this.db.versionEpics.filter(
          (l) => !(l.project_id === input.project_id && l.epic_id === input.epic_id),
        );
        for (const vid of input.version_ids) {
          this.db.versionEpics.push({
            project_id: input.project_id,
            version_id: vid,
            epic_id: input.epic_id,
          });
        }
        this.persist();
        return undefined;
      }
      case "create_epic": {
        const input = args?.input as Record<string, unknown>;
        const projectId = input.project_id as string;
        const now = nowIso();
        const id = (input.id as string | null) ?? nextEpicId(this.db, projectId);
        const epic: Epic = {
          id,
          project_id: projectId,
          title: (input.title as string).trim(),
          status: (input.status as Epic["status"]) ?? "active",
          outcome: (input.outcome as string | null) ?? null,
          capability: (input.capability as string | null) ?? null,
          expected_outcome: (input.expected_outcome as string | null) ?? null,
          out_of_scope: (input.out_of_scope as string | null) ?? null,
          notes: (input.notes as string | null) ?? null,
          profiles_json: (input.profiles_json as string | null) ?? null,
          version_ids_json: null,
          created_at: now,
          updated_at: now,
        };
        this.db.epics.push(epic);
        this.persist();
        return epic;
      }
      case "update_epic": {
        const input = args?.input as Record<string, unknown>;
        const projectId = input.project_id as string;
        const id = input.id as string;
        const e = this.db.epics.find((x) => x.project_id === projectId && x.id === id);
        if (!e) throw new Error("Epic not found");
        e.title = (input.title as string).trim();
        e.status = input.status as Epic["status"];
        e.outcome = (input.outcome as string | null) ?? e.outcome;
        e.capability = (input.capability as string | null) ?? e.capability;
        e.expected_outcome = (input.expected_outcome as string | null) ?? e.expected_outcome;
        e.out_of_scope = (input.out_of_scope as string | null) ?? e.out_of_scope;
        e.notes = (input.notes as string | null) ?? e.notes;
        e.profiles_json = (input.profiles_json as string | null) ?? e.profiles_json;
        e.updated_at = nowIso();
        this.persist();
        return e;
      }
      case "delete_epic": {
        const projectId = args?.projectId as string;
        const id = args?.id as string;
        this.db.epics = this.db.epics.filter((e) => !(e.project_id === projectId && e.id === id));
        this.db.versionEpics = this.db.versionEpics.filter(
          (l) => !(l.project_id === projectId && l.epic_id === id),
        );
        this.persist();
        return undefined;
      }
      case "list_sprints": {
        const projectId = args?.projectId as string;
        const versionId = args?.versionId as string | null | undefined;
        return this.db.sprints.filter(
          (s) =>
            s.project_id === projectId &&
            (versionId == null || versionId === "" || s.version_id === versionId),
        );
      }
      case "create_sprint": {
        const input = args?.input as Record<string, unknown>;
        const projectId = input.project_id as string;
        const versionId = input.version_id as string;
        const now = nowIso();
        const id = (input.id as string | null) ?? nextSprintId(this.db, projectId, versionId);
        const sprint: Sprint = {
          id,
          project_id: projectId,
          version_id: versionId,
          title: (input.title as string).trim(),
          status: (input.status as Sprint["status"]) ?? "planned",
          goal: (input.goal as string | null) ?? null,
          done_when: (input.done_when as string | null) ?? null,
          out_of_scope: (input.out_of_scope as string | null) ?? null,
          retrospective_json: (input.retrospective_json as string | null) ?? null,
          created_at: now,
          updated_at: now,
        };
        this.db.sprints.push(sprint);
        this.persist();
        return sprint;
      }
      case "update_sprint": {
        const input = args?.input as Record<string, unknown>;
        const projectId = input.project_id as string;
        const id = input.id as string;
        const s = this.db.sprints.find((x) => x.project_id === projectId && x.id === id);
        if (!s) throw new Error("Sprint not found");
        s.title = (input.title as string).trim();
        s.status = input.status as Sprint["status"];
        s.goal = (input.goal as string | null) ?? s.goal;
        s.done_when = (input.done_when as string | null) ?? s.done_when;
        s.out_of_scope = (input.out_of_scope as string | null) ?? s.out_of_scope;
        s.retrospective_json =
          (input.retrospective_json as string | null) ?? s.retrospective_json;
        s.updated_at = nowIso();
        this.persist();
        return s;
      }
      case "delete_sprint": {
        const projectId = args?.projectId as string;
        const id = args?.id as string;
        this.db.sprints = this.db.sprints.filter(
          (s) => !(s.project_id === projectId && s.id === id),
        );
        this.persist();
        return undefined;
      }
      case "get_last_sprint_id": {
        const projectId = args?.projectId as string;
        return this.db.prefs[`last_sprint_id:${projectId}`] ?? null;
      }
      case "set_last_sprint_id": {
        const input = args?.input as { project_id: string; sprint_id?: string | null };
        const key = `last_sprint_id:${input.project_id}`;
        if (input.sprint_id) this.db.prefs[key] = input.sprint_id;
        else delete this.db.prefs[key];
        this.persist();
        return undefined;
      }
      case "list_workflow_columns":
        return this.db.workflowColumns
          .filter((c) => c.project_id === (args?.projectId as string))
          .sort((a, b) => a.order_index - b.order_index);
      case "list_stories": {
        const input = args?.input as {
          project_id: string;
          sprint_id?: string | null;
          version_id?: string | null;
          epic_id?: string | null;
        };
        let stories = this.db.stories.filter((s) => s.project_id === input.project_id);
        if (input.sprint_id) stories = stories.filter((s) => s.sprint_id === input.sprint_id);
        if (input.version_id) stories = stories.filter((s) => s.version_id === input.version_id);
        if (input.epic_id) stories = stories.filter((s) => s.epic_id === input.epic_id);
        stories.sort((a, b) => {
          if (a.workflow_column_id !== b.workflow_column_id) {
            return a.workflow_column_id.localeCompare(b.workflow_column_id);
          }
          return a.order_index - b.order_index;
        });
        return stories.map((s) => buildSummary(this.db, s));
      }
      case "get_story":
        return storyDetail(this.db, args?.projectId as string, args?.id as string);
      case "create_story": {
        const input = args?.input as Record<string, unknown>;
        const projectId = input.project_id as string;
        validateRelationsDb(
          this.db,
          projectId,
          input.epic_id as string | null,
          input.version_id as string | null,
          input.sprint_id as string | null,
        );
        const now = nowIso();
        const id = nextStoryId(this.db, projectId);
        const columns = this.db.workflowColumns
          .filter((c) => c.project_id === projectId)
          .sort((a, b) => a.order_index - b.order_index);
        const columnId =
          (input.workflow_column_id as string | null) ?? columns[0]?.id ?? newId();
        const maxOrder = this.db.stories
          .filter((s) => s.project_id === projectId && s.workflow_column_id === columnId)
          .reduce((m, s) => Math.max(m, s.order_index), -1);
        const story: StoredStory = {
          id,
          project_id: projectId,
          epic_id: (input.epic_id as string | null) ?? null,
          version_id: (input.version_id as string | null) ?? null,
          sprint_id: (input.sprint_id as string | null) ?? null,
          workflow_column_id: columnId,
          title: ((input.title as string) || (input.i_want as string) || "").slice(0, 100),
          as_role: (input.as_role as string | null) ?? null,
          i_want: (input.i_want as string | null) ?? null,
          so_that: (input.so_that as string | null) ?? null,
          why: (input.why as string | null) ?? null,
          where_text: (input.where_text as string | null) ?? null,
          approach: (input.approach as string | null) ?? null,
          done_when: (input.done_when as string | null) ?? null,
          moscow: (input.moscow as StoredStory["moscow"]) ?? "Must",
          ready: false,
          status: "❌",
          missing_note: null,
          tests: "required",
          tests_status: "pending",
          out_of_scope: (input.out_of_scope as string | null) ?? null,
          boundary_notes: (input.boundary_notes as string | null) ?? null,
          architecture_refs: (input.architecture_refs as string | null) ?? null,
          api_db_impact: (input.api_db_impact as string | null) ?? null,
          security_notes: (input.security_notes as string | null) ?? null,
          related_decisions: (input.related_decisions as string | null) ?? null,
          planned_json: (input.planned_json as string | null) ?? null,
          record_json: null,
          record_files: null,
          record_backend: null,
          record_frontend: null,
          record_scripts: null,
          record_executed: null,
          order_index: maxOrder + 1,
          created_at: now,
          updated_at: now,
        };
        this.db.stories.push(story);
        const items =
          (input.acceptance as Array<{ text: string; checked?: boolean; id?: string }>) ?? [];
        items.forEach((item, index) => {
          const text = item.text?.trim();
          if (!text) return;
          this.db.acceptance.push({
            id: item.id ?? newId(),
            story_id: id,
            text,
            checked: !!item.checked,
            order_index: index,
          });
        });
        this.persist();
        return storyDetail(this.db, projectId, id);
      }
      case "update_story": {
        const input = args?.input as Record<string, unknown>;
        const projectId = input.project_id as string;
        const id = input.id as string;
        const story = this.db.stories.find((s) => s.project_id === projectId && s.id === id);
        if (!story) throw new Error("Story not found");
        const epicId = (input.epic_id as string | null | undefined) ?? story.epic_id;
        const versionId = (input.version_id as string | null | undefined) ?? story.version_id;
        const sprintId = (input.sprint_id as string | null | undefined) ?? story.sprint_id;
        validateRelationsDb(this.db, projectId, epicId, versionId, sprintId);
        if (input.title != null) story.title = (input.title as string).trim();
        if (input.epic_id !== undefined) story.epic_id = input.epic_id as string | null;
        if (input.version_id !== undefined) story.version_id = input.version_id as string | null;
        if (input.sprint_id !== undefined) story.sprint_id = input.sprint_id as string | null;
        if (input.ready !== undefined && input.ready !== null) story.ready = !!input.ready;
        if (input.status !== undefined && input.status !== null) {
          story.status = input.status as StoredStory["status"];
        }
        const patchKeys = [
          "as_role",
          "i_want",
          "so_that",
          "why",
          "where_text",
          "approach",
          "done_when",
          "moscow",
          "missing_note",
          "tests",
          "tests_status",
          "out_of_scope",
          "boundary_notes",
          "architecture_refs",
          "api_db_impact",
          "security_notes",
          "related_decisions",
          "planned_json",
          "record_files",
          "record_backend",
          "record_frontend",
          "record_scripts",
          "record_executed",
        ] as const;
        for (const key of patchKeys) {
          if (input[key] !== undefined && input[key] !== null) {
            (story as Record<string, unknown>)[key] = input[key];
          }
        }
        story.updated_at = nowIso();
        this.persist();
        return storyDetail(this.db, projectId, id);
      }
      case "delete_story": {
        const projectId = args?.projectId as string;
        const id = args?.id as string;
        this.db.stories = this.db.stories.filter(
          (s) => !(s.project_id === projectId && s.id === id),
        );
        this.db.acceptance = this.db.acceptance.filter((a) => a.story_id !== id);
        this.db.dependencies = this.db.dependencies.filter(
          (d) => d.story_id !== id && d.depends_on_id !== id,
        );
        this.persist();
        return undefined;
      }
      case "set_story_acceptance": {
        const input = args?.input as {
          project_id: string;
          story_id: string;
          items: Array<{ id?: string; text: string; checked: boolean }>;
        };
        this.db.acceptance = this.db.acceptance.filter((a) => a.story_id !== input.story_id);
        input.items.forEach((item, index) => {
          this.db.acceptance.push({
            id: item.id ?? newId(),
            story_id: input.story_id,
            text: item.text.trim(),
            checked: item.checked,
            order_index: index,
          });
        });
        this.persist();
        return this.db.acceptance
          .filter((a) => a.story_id === input.story_id)
          .sort((a, b) => a.order_index - b.order_index);
      }
      case "set_story_dependencies": {
        const input = args?.input as {
          project_id: string;
          story_id: string;
          depends_on: string[];
        };
        this.db.dependencies = this.db.dependencies.filter(
          (d) => !(d.project_id === input.project_id && d.story_id === input.story_id),
        );
        for (const dep of input.depends_on) {
          this.db.dependencies.push({
            project_id: input.project_id,
            story_id: input.story_id,
            depends_on_id: dep,
          });
        }
        this.persist();
        return input.depends_on;
      }
      case "move_story": {
        const input = args?.input as {
          project_id: string;
          story_id: string;
          workflow_column_id: string;
          order_index: number;
        };
        const story = this.db.stories.find(
          (s) => s.project_id === input.project_id && s.id === input.story_id,
        );
        if (!story) throw new Error("Story not found");
        const col = this.db.workflowColumns.find((c) => c.id === input.workflow_column_id);
        if (col?.maps_status) story.status = col.maps_status as StoredStory["status"];
        story.workflow_column_id = input.workflow_column_id;
        story.order_index = input.order_index;
        story.updated_at = nowIso();
        this.persist();
        return undefined;
      }
      case "reorder_stories": {
        const projectId = args?.projectId as string;
        const workflowColumnId = args?.workflowColumnId as string;
        const orderedIds = args?.orderedIds as string[];
        orderedIds.forEach((storyId, index) => {
          const story = this.db.stories.find(
            (s) =>
              s.project_id === projectId &&
              s.id === storyId &&
              s.workflow_column_id === workflowColumnId,
          );
          if (story) {
            story.order_index = index;
            story.updated_at = nowIso();
          }
        });
        this.persist();
        return undefined;
      }
      default:
        throw new Error(`Unknown browser command: ${command}`);
    }
  }
}

export function clearBrowserAgileStore(): void {
  saveDb(emptyDb());
  singleton = null;
}
