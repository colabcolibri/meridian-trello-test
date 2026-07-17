import type {
  AcceptanceCriterion,
  Epic,
  Project,
  Sprint,
  StoryStatus,
  Version,
  WorkflowColumn,
} from "../../../domain/agileTypes";
import type { BrowserDb, StoredStory, StoryDep, VersionEpicLink } from "./browserAgileStore";

/** Stable id so deep links and prefs stay consistent across reloads. */
export const DEMO_PROJECT_ID = "11111111-1111-4111-8111-111111111111";

const DEMO_TS = "2026-07-02T12:00:00.000Z";

const COL = {
  backlog: "22222222-2222-4222-8222-222222222201",
  refine: "22222222-2222-4222-8222-222222222202",
  ready: "22222222-2222-4222-8222-222222222203",
  progress: "22222222-2222-4222-8222-222222222204",
  review: "22222222-2222-4222-8222-222222222205",
  done: "22222222-2222-4222-8222-222222222206",
} as const;

function workflowColumns(projectId: string): WorkflowColumn[] {
  const rows: Array<[string, string, number, string | null]> = [
    [COL.backlog, "Backlog", 0, "❌"],
    [COL.refine, "Refine", 1, "❌"],
    [COL.ready, "Ready", 2, "❌"],
    [COL.progress, "In progress", 3, "🔶"],
    [COL.review, "Review", 4, "🔶"],
    [COL.done, "Done", 5, "✅"],
  ];
  return rows.map(([id, name, order_index, maps_status]) => ({
    id,
    project_id: projectId,
    name,
    order_index,
    maps_status,
  }));
}

interface SeedStory {
  id: string;
  title: string;
  epic_id: string;
  version_id: string;
  sprint_id: string;
  column: keyof typeof COL;
  status: StoryStatus;
  ready: boolean;
  tests_status: string;
  as_role: string;
  i_want: string;
  so_that: string;
  why: string;
  done_when: string;
  missing_note?: string | null;
  acceptance: Array<{ text: string; checked: boolean }>;
}

function mk(
  id: string,
  title: string,
  version_id: string,
  sprint_id: string,
  epic_id: string,
  column: keyof typeof COL,
  status: StoryStatus,
  i_want: string,
  opts?: { ready?: boolean; tests_status?: string; missing_note?: string | null },
): SeedStory {
  const ready = opts?.ready ?? (status === "✅" || column === "ready");
  const tests_status = opts?.tests_status ?? (status === "✅" ? "done" : "pending");
  const done = status === "✅";
  return {
    id,
    title,
    epic_id,
    version_id,
    sprint_id,
    column,
    status,
    ready,
    tests_status,
    as_role: version_id === "v6" ? "Web demo visitor" : "Local user",
    i_want,
    so_that: "the Meridian agile workspace matches how we ship in this repo",
    why: `Representative sample from docs/us/${id}.md in the exemplo repository — not synced at runtime.`,
    done_when: `${title} — observable acceptance met in the real product slice.`,
    missing_note: opts?.missing_note ?? (status === "🔶" ? "Missing: polish or validation called out in acceptance" : null),
    acceptance: [
      { text: "Slice scoped to single concern (SRP)", checked: done || column === "review" },
      { text: "Manual test steps documented on the US", checked: done },
      { text: "Record filled when status is complete", checked: done },
    ],
  };
}

/** Rich board: v4 card epic + v5 hierarchy + v6 web demo (English copy). */
function demoStoryDefs(): SeedStory[] {
  return [
    // —— v4 / EPIC-18 (mostly Done — product foundation) ——
    mk("US-0044", "Migration US Meridian schema v2", "v4", "v4-S1", "EPIC-18", "done", "✅", "persist full US schema in SQLite"),
    mk("US-0045", "Enriched API summary for card face", "v4", "v4-S1", "EPIC-18", "done", "✅", "see preamble and acceptance on the card"),
    mk("US-0046", "UsCardMeridian replaces compact story card", "v4", "v4-S1", "EPIC-18", "done", "✅", "Meridian-shaped cards on the board"),
    mk("US-0047", "Card face: As / I want / so that", "v4", "v4-S2", "EPIC-18", "done", "✅", "read the user story preamble at a glance"),
    mk("US-0048", "Card face: Why and done_when", "v4", "v4-S2", "EPIC-18", "done", "✅", "scan intent without opening the modal"),
    mk("US-0049", "Card face: mini acceptance progress", "v4", "v4-S2", "EPIC-18", "done", "✅", "see checked vs total criteria on the face"),
    mk("US-0050", "Design system us-card CSS", "v4", "v4-S2", "EPIC-18", "done", "✅", "consistent Meridian card typography and spacing"),
    mk("US-0051", "Create US form: preamble and done_when", "v4", "v4-S2", "EPIC-18", "done", "✅", "create stories with Meridian fields"),
    mk("US-0052", "Modal: schema v2 sections ordered", "v4", "v4-S3", "EPIC-18", "done", "✅", "edit Intent · Plan · Record · Boundaries"),
    mk("US-0053", "Record read-only; Boundaries editable", "v4", "v4-S3", "EPIC-18", "done", "✅", "protect delivery record while refining scope"),
    mk("US-0040", "Board filters: version, epic, sprint", "v4", "v4-S3", "EPIC-18", "refine", "❌", "filter the kanban by release context", {
      ready: false,
    }),
    mk("US-0042", "Modal: edit Meridian US fields", "v4", "v4-S3", "EPIC-18", "backlog", "❌", "edit any schema v2 field in one modal"),

    // —— v5 / EPIC-19 ——
    mk("US-0054", "Six-column Meridian workflow", "v5", "v5-S1", "EPIC-19", "done", "✅", "move cards across Backlog→Done"),
    mk("US-0058", "Schema version_epics and relational API", "v5", "v5-S1", "EPIC-19", "done", "✅", "link epics and versions in the database"),
    mk("US-0059", "Version CRUD with derived Included", "v5", "v5-S2", "EPIC-19", "done", "✅", "stop typing Included lists manually"),
    mk("US-0060", "Epic CRUD with relational version link", "v5", "v5-S2", "EPIC-19", "done", "✅", "pick versions for an epic with a multi-select"),
    mk("US-0061", "Sprint CRUD with version FK wizard", "v5", "v5-S3", "EPIC-19", "done", "✅", "edit sprint metadata in a dedicated wizard"),
    mk("US-0062", "Hierarchical hub: version → epic → sprint", "v5", "v5-S3", "EPIC-19", "progress", "🔶", "navigate the tree instead of flat tabs", {
      tests_status: "pending",
      missing_note: "Missing: final hub polish validation",
    }),
    mk("US-0055", "Visual ready rules per workflow column", "v5", "v5-S3", "EPIC-21", "review", "🔶", "see ready badge rules per column", {
      ready: true,
      tests_status: "pending",
    }),
    mk("US-0063", "US forms: cascading version → epic → sprint", "v5", "v5-S4", "EPIC-19", "ready", "❌", "only pick epics and sprints valid for the version", {
      ready: true,
    }),
    mk("US-0056", "Projects nav primary; legacy boards deprecated", "v5", "v5-S4", "EPIC-21", "backlog", "❌", "land on /projects as the main entry", {
      ready: false,
    }),
    mk("US-0057", "Deprecation banner for task kanban v1", "v5", "v5-S4", "EPIC-21", "refine", "❌", "know task-board is legacy", { ready: false }),

    // —— v6 / EPIC-20 ——
    mk("US-0064", "Browser store and tauriInvoke routing", "v6", "v6-S1", "EPIC-20", "done", "✅", "run the agile UI in the browser"),
    mk("US-0065", "Demo banner, Vite base, GitHub Pages", "v6", "v6-S2", "EPIC-20", "done", "✅", "trust the public static demo"),
    mk("US-0066", "Reset demo and stale route recovery", "v6", "v6-S3", "EPIC-20", "review", "🔶", "reset without infinite loading", {
      ready: true,
      tests_status: "done",
    }),
    mk("US-0067", "English chrome and demo project/hub polish", "v6", "v6-S3", "EPIC-20", "progress", "🔶", "see a polished English demo shell", {
      ready: true,
      tests_status: "done",
    }),
  ];
}

function buildStories(projectId: string): {
  stories: StoredStory[];
  acceptance: AcceptanceCriterion[];
} {
  const defs = demoStoryDefs();
  const stories: StoredStory[] = [];
  const acceptance: AcceptanceCriterion[] = [];
  const orderInColumn: Record<string, number> = {};

  defs.forEach((def) => {
    const workflow_column_id = COL[def.column];
    const order_index = orderInColumn[workflow_column_id] ?? 0;
    orderInColumn[workflow_column_id] = order_index + 1;
    stories.push({
      id: def.id,
      project_id: projectId,
      epic_id: def.epic_id,
      version_id: def.version_id,
      sprint_id: def.sprint_id,
      workflow_column_id,
      title: def.title,
      as_role: def.as_role,
      i_want: def.i_want,
      so_that: def.so_that,
      why: def.why,
      where_text: `${def.version_id} / ${def.epic_id} / ${def.sprint_id}`,
      approach: null,
      done_when: def.done_when,
      moscow: "Must",
      ready: def.ready,
      status: def.status,
      missing_note: def.missing_note ?? null,
      tests: "required",
      tests_status: def.tests_status,
      out_of_scope: null,
      boundary_notes: "Sample data from this repo (exemplo) — not synced to docs/.",
      architecture_refs: "docs/05_architecture.md — § Camadas e limites",
      api_db_impact: null,
      security_notes: null,
      related_decisions: null,
      planned_json: null,
      record_json: null,
      record_files: null,
      record_backend: null,
      record_frontend: null,
      record_scripts: null,
      record_executed: null,
      order_index,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    });
    def.acceptance.forEach((item, index) => {
      acceptance.push({
        id: `${def.id}-ac-${index}`,
        story_id: def.id,
        text: item.text,
        checked: item.checked,
        order_index: index,
      });
    });
  });

  return { stories, acceptance };
}

function dependencies(projectId: string): StoryDep[] {
  const pairs: Array<[string, string]> = [
    ["US-0062", "US-0059"],
    ["US-0062", "US-0060"],
    ["US-0062", "US-0061"],
    ["US-0063", "US-0058"],
    ["US-0065", "US-0064"],
    ["US-0066", "US-0064"],
    ["US-0067", "US-0065"],
    ["US-0060", "US-0058"],
    ["US-0059", "US-0058"],
  ];
  return pairs.map(([story_id, depends_on_id]) => ({
    project_id: projectId,
    story_id,
    depends_on_id,
  }));
}

/** Pre-filled demo DB mirroring exemplo repo v4–v6 (English UI copy). */
export function createDemoSeedDb(): BrowserDb {
  const projectId = DEMO_PROJECT_ID;
  const project: Project = {
    id: projectId,
    name: "Meridian — exemplo (demo)",
    description:
      "Sample workspace from this repo: v4 Meridian cards (EPIC-18), v5 relational agile (EPIC-19), v6 web demo (EPIC-20). ~26 stories across the full board.",
    created_at: DEMO_TS,
    updated_at: DEMO_TS,
  };

  const versions: Version[] = [
    {
      id: "v4",
      project_id: projectId,
      title: "Meridian US cards and schema v2",
      status: "complete",
      outcome: "Board shows Meridian user stories with preamble, Why, done_when, and acceptance on the card face.",
      objective: "Replace task-kanban UX with US schema v2 in SQLite and React.",
      done_criteria: "US-0044 through US-0053 delivered; cartão Meridian is the default.",
      included_json: null,
      explicitly_out: "Task kanban v1 as primary product.",
      go_live_checklist_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v5",
      project_id: projectId,
      title: "Relational agile hierarchy and product UX",
      status: "active",
      outcome:
        "Manage versions, epics, and sprints with SQLite relations — navigate project → version → epic → sprint → board.",
      objective:
        "version_epics junction; derived Included; hierarchical hub and wizards; cascade US forms.",
      done_criteria: "Must US v5 complete with hub and relational CRUD.",
      included_json: null,
      explicitly_out: "Bidirectional sync app ↔ docs/*.md; story points.",
      go_live_checklist_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v6",
      project_id: projectId,
      title: "In-browser web demo (no backend)",
      status: "planned",
      outcome: "Visitors explore Meridian agile UI with localStorage only.",
      objective: "Browser adapter + static GitHub Pages publish.",
      done_criteria: "Demo works without Tauri; CI deploy on agile branch.",
      included_json: null,
      explicitly_out: "Sync with desktop SQLite or docs/us.",
      go_live_checklist_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
  ];

  const epics: Epic[] = [
    {
      id: "EPIC-18",
      project_id: projectId,
      title: "Unified product — agile board only",
      status: "complete",
      outcome: "Projects and Meridian US are the product; task kanban is deprecated.",
      capability: "Schema v2, UsCardMeridian, create/edit modal, enriched list API.",
      expected_outcome: "Every card reads like a docs/us file on the board.",
      out_of_scope: "Task kanban v1 feature parity.",
      notes: "docs/epics/EPIC-18.md",
      profiles_json: JSON.stringify(["Local user"]),
      version_ids_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "EPIC-19",
      project_id: projectId,
      title: "Relational agile hierarchy and product UX",
      status: "active",
      outcome: "SQLite relations and hierarchical navigation without typed IDs.",
      capability: "version_epics, derived Included, hub, sprint/version/epic wizards.",
      expected_outcome: "Configure releases and open the right sprint board from the tree.",
      out_of_scope: "Markdown sync.",
      notes: "docs/epics/EPIC-19.md",
      profiles_json: JSON.stringify(["Local user"]),
      version_ids_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "EPIC-21",
      project_id: projectId,
      title: "Board UX, nav polish, and quality gates",
      status: "active",
      outcome: "Release hygiene: filters, nav, deprecation paths, ready rules on the board.",
      capability: "Should-level polish that spans hub and kanban without new SQLite entities.",
      expected_outcome: "Managers filter by epic on the board while sprints stay version-scoped.",
      out_of_scope: "New backend services.",
      notes: "Demo-only epic in seed — illustrates multiple epics per version (v5).",
      profiles_json: JSON.stringify(["Local user"]),
      version_ids_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "EPIC-20",
      project_id: projectId,
      title: "Meridian agile web demo (local-only)",
      status: "active",
      outcome: "Try the UI in the browser without a backend.",
      capability: "BrowserAgileStore, banner, GitHub Pages.",
      expected_outcome: "Public link opens a populated sample workspace.",
      out_of_scope: "Hosted API.",
      notes: "docs/epics/EPIC-20.md",
      profiles_json: JSON.stringify(["Local user"]),
      version_ids_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
  ];

  const versionEpics: VersionEpicLink[] = [
    { project_id: projectId, version_id: "v4", epic_id: "EPIC-18" },
    { project_id: projectId, version_id: "v5", epic_id: "EPIC-19" },
    { project_id: projectId, version_id: "v5", epic_id: "EPIC-21" },
    { project_id: projectId, version_id: "v6", epic_id: "EPIC-20" },
  ];

  const sprints: Sprint[] = [
    {
      id: "v4-S1",
      project_id: projectId,
      version_id: "v4",
      title: "Schema v2 and card API",
      status: "complete",
      goal: "Migration + enriched summaries + UsCardMeridian.",
      done_when: "US-0044–0046 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v4-S2",
      project_id: projectId,
      version_id: "v4",
      title: "Card face and create flow",
      status: "complete",
      goal: "Preamble, Why, acceptance preview, create form.",
      done_when: "US-0047–0051 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v4-S3",
      project_id: projectId,
      version_id: "v4",
      title: "Modal schema v2",
      status: "complete",
      goal: "Full edit modal and record boundaries.",
      done_when: "US-0052–0053 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v5-S1",
      project_id: projectId,
      version_id: "v5",
      title: "Relational foundation (schema + API)",
      status: "complete",
      goal: "version_epics and workflow columns.",
      done_when: "US-0054, US-0058 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v5-S2",
      project_id: projectId,
      version_id: "v5",
      title: "Version and epic CRUD",
      status: "complete",
      goal: "Derived Included and epic version picker.",
      done_when: "US-0059, US-0060 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v5-S3",
      project_id: projectId,
      version_id: "v5",
      title: "Sprint CRUD and hierarchical hub",
      status: "active",
      goal: "Hub drill-down and sprint wizards.",
      done_when: "US-0061, US-0062 ✅",
      out_of_scope: "Cascade US forms — v5-S4.",
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v5-S4",
      project_id: projectId,
      version_id: "v5",
      title: "US cascade forms and nav polish",
      status: "planned",
      goal: "Create/edit US with version-scoped selects.",
      done_when: "US-0063 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v6-S1",
      project_id: projectId,
      version_id: "v6",
      title: "Browser store and invoke",
      status: "complete",
      goal: "localStorage BrowserAgileStore.",
      done_when: "US-0064 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v6-S2",
      project_id: projectId,
      version_id: "v6",
      title: "Pages and demo UX",
      status: "complete",
      goal: "Banner and GitHub Pages pipeline.",
      done_when: "US-0065 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      id: "v6-S3",
      project_id: projectId,
      version_id: "v6",
      title: "Demo navigation and visual polish",
      status: "active",
      goal: "Reset flow and English demo chrome.",
      done_when: "US-0066, US-0067 ✅",
      out_of_scope: null,
      retrospective_json: null,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
  ];

  const { stories, acceptance } = buildStories(projectId);

  return {
    prefs: {
      last_project_id: projectId,
      [`last_sprint_id:${projectId}`]: "v5-S3",
    },
    projects: [project],
    versions,
    epics,
    versionEpics,
    sprints,
    workflowColumns: workflowColumns(projectId),
    stories,
    acceptance,
    dependencies: dependencies(projectId),
  };
}
