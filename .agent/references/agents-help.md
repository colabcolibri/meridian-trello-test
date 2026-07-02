# Agents & commands help

Explicit map of **who does what**, **which group they belong to**, and **which step to run** in Meridian.

| Read first | File |
| ---------- | ---- |
| Concepts (phases, US, gates) | [start-here.md](./start-here.md) |
| Day-to-day situations | [usage-guide.md](./usage-guide.md) |
| **This file** | Agents, slash commands, skills, step order |
| Scrum mapping | [scrum-meridian-map.md](./scrum-meridian-map.md) |

---

## How the harness is layered

```txt
Human (manager)
    ↓ approves direction, sets approved / ✅
Slash command (/create-us)  →  opens workflow in .agent/workflows/
    ↓ assigns persona
Agent (@board-keeper)       →  .agent/agents/{name}.md
    ↓ executes procedure
Skill (create-user-story)   →  .agent/skills/{name}/SKILL.md
    ↓ writes artifacts
docs/                       →  source of truth
```

| Layer | Role | You invoke |
| ----- | ---- | ---------- |
| **Workflow** | Step-by-step recipe for one command | `/status`, `/create-us` |
| **Agent** | Domain persona with gates and output format | Automatic routing or `@agent-name` |
| **Skill** | Repeatable procedure (templates, scripts) | Used by agent — rarely typed by human |

**Routing:** describe the task in chat → agent announces `Applying knowledge from @[agent]…`. Override anytime with `@process-manager`, `@board-keeper`, etc.

**Priority:** P0 rules → MERIDIAN.md → agent → skill → templates.

---

## Agent groups

Seven agents in **six groups**. One agent may appear in notes when it supports another group.

### Group 1 — Orchestration

Keeps you as manager. Gates phases, reports blockers, decides what can move next.

| Agent | Serves for | Primary artifacts | Does not |
| ----- | ---------- | ----------------- | -------- |
| **`process-manager`** | Project health, phase progression, “can we advance?”, init, daily loop | All `docs/` (read), decision log | Invent MVP code; approve docs; mark ✅ without Record |

**When to use:** `/status`, `/init-meridian`, `/daily-with-ai`, vague “what next?”, before any implementation.

**Skills:** `init-project`, `create-epic`, `update-decisions-log`, `generate-board-json`, `meridian-routing`

---

### Group 2 — Scope & framing

Defines *what the product is* before structure and code.

| Agent | Serves for | Primary artifacts | Does not |
| ----- | ---------- | ----------------- | -------- |
| **`scope-architect`** | Problem, users, in/out of scope, assumptions, risks | `docs/00_scope.md`, scope decisions | Tech stack, architecture, US |

**When to use:** drafting or challenging `00_scope`, scope arguments, “is this in scope?”

**Skills:** `init-project`, `update-decisions-log`, `meridian-routing`

---

### Group 3 — Documentation & phase docs

Writes and reviews phase documents and product-facing docs agents can execute.

| Agent | Serves for | Primary artifacts | Does not |
| ----- | ---------- | ----------------- | -------- |
| **`documentation-strategist`** | Phase docs `01`–`04`, `06`–`08`, `11`; epic drafting; doc quality | `docs/01_*` … `docs/08_*`, `docs/epics/` | Approve `status: approved`; implement code |

**When to use:** filling tech stack, principles, environments; `/create-epic` (with templates).

**Skills:** `init-project`, `create-epic`, `create-user-story`, `update-decisions-log`, `meridian-routing`

---

### Group 4 — Security & architecture

Hardens structure before backlog and implementation.

| Agent | Serves for | Primary artifacts | Does not |
| ----- | ---------- | ----------------- | -------- |
| **`security-steward`** | Threat model, secrets, OWASP, AI-agent safety, Git hygiene | `docs/02_security.md` | Skip security to ship faster |
| **`architecture-guardian`** | System boundaries, modules, integrations, consistency | `docs/05_architecture.md` | Architecture before scope/security drafts exist |

**When to use:** `/security-pass`, `/architecture`, security review before merge.

**Skills:** `security-review`, `update-decisions-log`, `meridian-routing` (+ `security-review` on architecture-guardian)

**Gate:** `05_architecture.md` must be **`approved`** before epics/versions/US (enforced by `sprint-planner` and `board-keeper`).

---

### Group 5 — Delivery planning

Turns approved architecture into releases, sprints, and execution order.

| Agent | Serves for | Primary artifacts | Does not |
| ----- | ---------- | ----------------- | -------- |
| **`sprint-planner`** | Versions, sprints, MoSCoW, go-live checklist, story sequencing | `docs/versions/`, `docs/sprints/` | Create US before architecture approved |

**When to use:** `/create-version`, `/plan-sprint`, roadmap and sprint scope.

**Skills:** `create-epic`, `create-version`, `create-sprint`, `create-user-story`, `generate-board-json`, `update-decisions-log`, `meridian-routing`

---

### Group 6 — Board & user stories

Owns the executable backlog and honest execution state.

| Agent | Serves for | Primary artifacts | Does not |
| ----- | ---------- | ----------------- | -------- |
| **`board-keeper`** | US lifecycle, dependencies, board sync, close with evidence | `docs/us/`, `docs/kanban/board.json` (generated) | Implement without `ready: true`; mark ✅ without Record |

**When to use:** `/create-us`, `/review-us`, `/refine-us`, `/complete-us`, `/sync-board`, kanban consistency.

**Skills:** `create-user-story`, `review-user-story`, `refine-user-story`, `complete-user-story`, `generate-board-json`, `update-decisions-log`, `meridian-routing`

---

## Slash command groups

Slash command groups — workflows in **six groups**. Each maps to one primary agent (sometimes two).

### Group A — Bootstrap

| Step | Command | Agent | What it does |
| ---- | ------- | ----- | ------------ |
| A1 | **`/init-meridian`** | `process-manager` | Creates `docs/` tree, initial scope, decision log, empty board. **Mode B (existing codebase):** also `docs/inventory/as-is.md` — transitional capability map; no retroactive US. **No product code.** |

---

### Group B — Session & orientation

| Step | Command | Agent | What it does |
| ---- | ------- | ----- | ------------ |
| B1 | **`/status`** | `process-manager` | Read-only health: kit root, Meridian projects (multi-`docs/` repos), active product, phase doc statuses, US counts, blockers. |
| B2 | **`/daily-with-ai`** | `process-manager` | Guided session: status → pick story → implement → close → sync. |
| B3 | **`/agents-help`** | `process-manager` | Opens this reference; summarizes groups and current-step hints. |

---

### Group C — Phase documents (structure)

Complete in order: `00` → `01` → `02` → `03` → `04` → **`05`** → `06` → `07` → `08`.

| Step | Command | Agent | Target doc | What it does |
| ---- | ------- | ----- | ---------- | ------------ |
| C1 | *(conversation)* | `scope-architect` | `00_scope.md` | Scope, users, out of scope. |
| C2 | *(conversation)* | `documentation-strategist` | `01`, `03`, `04`, `06`–`08` | Draft phase documents. |
| C3 | **`/security-pass`** | `security-steward` | `02_security.md` | Threat model, secrets, OWASP, agent safety. |
| C4 | **`/architecture`** | `architecture-guardian` | `05_architecture.md` + optional `docs/architecture/` | Overview, index, detail files; gate for backlog. |

**Human gate:** you set `status: approved` on each doc. Agent never sets `approved`.

---

### Group D — Backlog artifacts

**Prerequisite:** `05_architecture.md` is **`approved`**.

| Step | Command | Agent | Output | What it does |
| ---- | ------- | ----- | ------ | ------------ |
| D1 | **`/create-epic`** | `documentation-strategist` | `docs/epics/EPIC-XX.md` | Product capability block. |
| D2 | **`/create-version`** | `sprint-planner` | `docs/versions/vX.md` | Release grouping epics/US. |
| D3 | **`/plan-sprint`** | `sprint-planner` | `docs/sprints/vX-SY.md` | Time-boxed goal + story list. |
| D4 | **`/complete-sprint vX-SY`** | `sprint-planner` | sprint `status: complete` | Sprint review + Retrospective filled. |

Order: **Epic → Version → Sprint** (sprint optional but recommended) → User story → **`/complete-sprint`** when increment delivered.

Epic/version **close:** set `status: complete` manually when outcome reached (no `/complete-epic` workflow).

---

### Group E — User story lifecycle

| Step | Command | Agent | US state after | What it does |
| ---- | ------- | ----- | -------------- | ------------ |
| E1 | **`/create-us`** | `board-keeper` | `ready: false` | New US: Intent + draft Plan. |
| E2 | **`/review-us US-XXXX`** | `board-keeper` | unchanged | Read-only quality audit. No `ready` change. |
| E3 | **`/refine-us US-XXXX`** | `board-keeper` | `ready: true` | Approach, arch refs, concrete tests. **Gate for code.** |
| E4 | **`/implement-us US-XXXX`** | `process-manager` | — | Gate: `ready: true`, deps, Plan; then product code. **Block if not refined.** |
| E5 | *(manager review)* | human | — | Review diff and run tests. |
| E6 | **`/complete-us US-XXXX`** | `board-keeper` | `status: ✅` | Fills Record, checks acceptance, syncs board. |
| E7 | **`/sync-board`** | `board-keeper` | — | Regenerates `docs/kanban/board.json` from US frontmatter. |

**Rules:** no code without E3 (`ready: true`) **and** E4 gate. No ✅ without E6 (`## Record` + evidence).

---

### Group F — Decisions & validation

| Step | Command / action | Agent / tool | What it does |
| ---- | ---------------- | ------------ | ------------ |
| F1 | **`/update-decisions-log`** | any + skill | Read skill; run `date +"%Y-%m-%d"` + `date +"%H:%M"`; prepend `docs/decisions/YYYY-MM-DD.json`. Never edit old entries. |
| F2 | **`validate_meridian.py`** | script | `python3 .agent/scripts/validate_meridian.py <project-root>` — structure, US contracts, board. |
| F3 | **Meridian: Validate Project** *(extension)* | IDE command | Same validator from VS Code/Cursor sidebar. |

---

## End-to-end steps (numbered)

Use this as the canonical sequence. Skip steps only when the artifact already exists and is approved.

```txt
 1. /init-meridian                          [Group A]  process-manager
 2. Complete 00_scope → approve             [Group C]  scope-architect
 3. Complete 01, 03, 04 (draft → approve)  [Group C]  documentation-strategist
 4. /security-pass → approve 02             [Group C]  security-steward
 5. /architecture → approve 05              [Group C]  architecture-guardian  ← GATE
 6. Complete 06, 07, 08 as needed          [Group C]  documentation-strategist
 7. /create-epic                            [Group D]  documentation-strategist
 8. /create-version                         [Group D]  sprint-planner
 9. /plan-sprint                            [Group D]  sprint-planner
10. /create-us                               [Group E]  board-keeper
11. /review-us US-XXXX                       [Group E]  board-keeper  (optional)
12. /refine-us US-XXXX                       [Group E]  board-keeper  → ready: true
13. /implement-us US-XXXX                    [Group E]  process-manager → gate then code
14. Manager review diff + tests              [Group E]  human
15. /complete-us US-XXXX                     [Group E]  board-keeper
16. /sync-board                              [Group E]  board-keeper
17. git commit (human)                       [Group F]  you — one US per commit
18. /status or /daily-with-ai                [Group B]  process-manager → back to step 10
19. /complete-sprint vX-SY (when sprint done) [Group D]  sprint-planner — after US in sprint closed
```

---

## Skill groups

Skills are procedures agents load automatically. Grouped by purpose.

### Governance & routing

| Skill | Used by | Purpose |
| ----- | ------- | ------- |
| `meridian-routing` | all agents | Pick correct agent from intent |
| `init-project` | process-manager, scope-architect, documentation-strategist | Bootstrap `docs/` |
| `update-decisions-log` | most agents | Prepend decision JSON (real `date` commands) |

### Delivery authoring

| Skill | Used by | Purpose |
| ----- | ------- | ------- |
| `create-epic` | documentation-strategist, sprint-planner | Epic file from template |
| `create-version` | sprint-planner | Version file |
| `create-sprint` | sprint-planner | Sprint file |
| `complete-sprint` | sprint-planner | Sprint close + Retrospective |
| `create-user-story` | documentation-strategist, board-keeper | US file at create |

### User story quality & close

| Skill | Used by | Purpose |
| ----- | ------- | ------- |
| `review-user-story` | board-keeper | Read-only US audit |
| `refine-user-story` | board-keeper | Approach + `ready: true` |
| `implement-user-story` | process-manager | Gate + implement when `ready: true` |
| `complete-user-story` | board-keeper | Record + ✅ + board sync |

### Board & security

| Skill | Used by | Purpose |
| ----- | ------- | ------- |
| `generate-board-json` | board-keeper, sprint-planner, process-manager | Regenerate `board.json` |
| `security-review` | security-steward, architecture-guardian | Security doc pass |

---

## Intent → agent quick lookup

| You want to… | Group | Agent | Command |
| ------------ | ----- | ----- | ------- |
| Start or migrate project | A | `process-manager` | `/init-meridian` |
| See blockers and next step | B | `process-manager` | `/status` |
| Full guided day | B | `process-manager` | `/daily-with-ai` |
| Open this manual | B | `process-manager` | `/agents-help` |
| Define scope | C | `scope-architect` | chat + `00_scope` |
| Draft phase docs | C | `documentation-strategist` | chat |
| Security doc | C | `security-steward` | `/security-pass` |
| Architecture doc | C | `architecture-guardian` | `/architecture` |
| New epic | D | `documentation-strategist` | `/create-epic` |
| New version / sprint | D | `sprint-planner` | `/create-version`, `/plan-sprint`, `/complete-sprint` |
| New / refine / implement / close US | E | `board-keeper` / `process-manager` | `/create-us`, `/refine-us`, `/implement-us`, `/complete-us` |
| Refresh kanban JSON | E | `board-keeper` | `/sync-board` |
| Log a decision | F | any | `/update-decisions-log` |
| Validate structure | F | script / extension | `validate_meridian.py` or **Validate Project** |

---

## IDE extension commands (separate layer)

These are **not** agents. They read the **active** `docs/` in the editor (extension `app-visual-studio`). In monorepos, **one active project** at a time — see [usage-guide.md § Multiple Meridian projects](./usage-guide.md#multiple-meridian-projects).

| Group | Command | Purpose |
| ----- | ------- | ------- |
| Views | **Open Board**, **Open Versions**, **Open Sprints**, **Open Epics** | Read-only planning UI; **Project** row in toolbar shows name + `docs/` path |
| Governance | **Select Active Project**, **Validate Project**, **Sync Board**, **Show Workspace Status** | Switch product (saved); validate `packageRoot`; board JSON; list all projects |
| Help | **Open Command Help**, **Open Agents Help** | Extension catalog; kit `agents-help.md` at runtime |

**Multi-product UI:** Board and Deliverables show which `docs/` is loaded; dropdown switches product and refreshes open tabs. Status bar shows project name when N>1. Install: Marketplace **Meridian Harness** or `pnpm install:cursor` in `app-visual-studio/`.

---

## Invocation cheat sheet

| Method | Example | When |
| ------ | ------- | ---- |
| Slash command | `/refine-us US-0017` | Known workflow step |
| Explicit agent | `@board-keeper refine US-0017` | Override routing |
| Natural language | “Implement docs/us/US-0017.md” | Run `/implement-us US-0017` if `ready: true`; else block |
| Read-only check | `/status` | Start of every session |

---

## Related files

| Path | Content |
| ---- | ------- |
| `.agent/agents/*.md` | Full agent procedures |
| `.agent/workflows/*.md` | Full slash command recipes |
| `.agent/skills/*/SKILL.md` | Skill procedures |
| `.agent/references/usage-guide.md` | Situation-based how-to |
| `.agent/references/start-here.md` | Concepts and artifact anatomy |
