# Instruction surfaces — where to edit when the protocol changes

> **Maintainer map.** When Meridian gains a new rule, artifact, command, or workflow step, walk the checklist in [Protocol change checklist](#protocol-change-checklist) and update every surface listed below.

**Canonical source:** `.agent/` (committed). Everything else is a mirror, runtime read, or **duplicated UI** that must be updated separately.

---

## Golden rules

1. **Edit `.agent/` first** — never start in `.cursor/`, `app-desktop/docs/templates/`, or IDE adapters.
2. **Run** `./.agent/scripts/sync_cursor_kit.sh` — refreshes `.cursor/`, `.claude/`, Codex adapters, `app-desktop/docs/templates/`.
3. **Update duplicated UI** — app-desktop Learn/Commands tabs do not auto-sync from markdown.
4. **VS Code extension** — Help panels that read `.agent/references/*.md` at runtime pick up kit changes after install/upgrade; command catalog and README are separate edits.
5. **Record the change** — prepend `docs/decisions/YYYY-MM-DD.json` in this repo when the protocol itself changes.

---

## Layers at a glance

| Layer | Path | Audience | Edit rule | Priority |
| ----- | ---- | -------- | --------- | -------- |
| Master protocol | `.agent/MERIDIAN.md` | Agents + managers | **Canonical** | P0 |
| P0 rules | `.agent/rules/MERIDIAN.md`, `.agent/rules/meridian.mdc` | Agents (always-on) | **Canonical** | P0 |
| Human onboarding | `.agent/references/start-here.md` | Manager | **Canonical** | P0 |
| Day-to-day guide | `.agent/references/usage-guide.md` | Manager | **Canonical** | P0 |
| Commands & steps | `.agent/references/agents-help.md` | Manager + agents | **Canonical** | P0 |
| Artifact templates | `.agent/references/templates/` + `TEMPLATE_SOURCES.md` | Agents | **Canonical** (see TEMPLATE_SOURCES for edit path) | P0 |
| Agent personas | `.agent/agents/*.md` | Agents | **Canonical** | P0 |
| Skills (procedures) | `.agent/skills/*/SKILL.md` + `references/` | Agents | **Canonical** | P0 |
| Slash workflows | `.agent/workflows/*.md` | IDE slash commands | **Canonical** | P0 |
| Scrum map | `.agent/references/scrum-meridian-map.md` | Manager + agents | **Canonical** | P1 |
| Kit architecture | `.agent/ARCHITECTURE.md`, `.agent/IDE_ADAPTERS.md` | Maintainers | **Canonical** | P1 |
| Distribution | `.agent/KIT_README.md`, `.agent/DISTRIBUTION.md` | Humans installing kit | **Canonical** | P2 |
| Repo README | `README.md` | GitHub visitors | **Canonical** | P2 |
| IDE adapters | `.cursor/`, `.claude/`, `.agents/skills/`, `.codex/` | Cursor / Claude Code / Codex | **Mirror** — sync only | — |
| Desktop template mirror | `app-desktop/docs/templates/` | Humans in monitor | **Mirror** — sync only | — |
| **Desktop UI copy** | `app-desktop/src/features/monitor/content/meridian-concepts.ts` | Manager in Learn/Commands tabs | **Duplicate** — edit by hand | P0 |
| Desktop tab hints | `app-desktop/src/.../MonitorTabs.tsx`, `monitor-views.ts` | Manager | **Duplicate** — edit by hand | P2 |
| Desktop project docs | `app-desktop/docs/README.md` | Desktop dogfood | **Canonical** for app-desktop only | P1 |
| VS Code help (runtime) | `.agent/references/{agents-help,usage-guide,start-here}.md` | Extension user | Same as kit refs — edit `.agent/`; panels: How to Use (static), Start Here, Usage Guide, Agents Help | P0 |
| VS Code command catalog | `app-visual-studio/src/command-catalog.ts` | Extension user | **Canonical** for extension UX | P1 |
| VS Code README | `app-visual-studio/README.md` | Marketplace / GitHub | **Canonical** for extension | P2 |
| Validators | `.agent/scripts/validate_meridian.py`, `meridian_section_contracts.py` | CI + agents | **Canonical** when structure changes | P1 |

---

## Surface detail

### P0 — protocol & procedures (agents execute from here)

| What | Where | When to touch |
| ---- | ----- | ------------- |
| Full governance | `.agent/MERIDIAN.md` | New gates, prohibitions, lifecycle rules |
| Short rules | `.agent/rules/MERIDIAN.md` | P0 rule additions |
| Cursor always-on | `.agent/rules/meridian.mdc` | Slash table, required reading paths |
| Bootstrap / migration | `.agent/skills/init-project/SKILL.md` | Mode A/B, new artifacts (e.g. `docs/inventory/`) |
| Slash command | `.agent/workflows/{command}.md` | Command behavior, deliverables, next steps |
| Template registry | `.agent/references/templates/INDEX.md` | New artifact types |
| Template body | `.agent/references/templates/*.md` or skill `references/` per `TEMPLATE_SOURCES.md` | New sections, fields, checklists |
| Agent routing | `.agent/agents/*.md` | Who owns new artifacts |

### P0 — human narrative (managers read in IDE or repo)

| What | Where | When to touch |
| ---- | ----- | ------------- |
| Concepts & phases | `.agent/references/start-here.md` | New phases, artifacts, folder tree |
| Situations & sequences | `.agent/references/usage-guide.md` | New workflows (migrate, close US, etc.) |
| Numbered steps | `.agent/references/agents-help.md` | New slash commands or groups |

### P0 — app-desktop duplicated UI (must edit manually)

| What | Where | Mirrors |
| ---- | ----- | ------- |
| Learn tab (concepts, journey, folder tree) | `app-desktop/src/features/monitor/content/meridian-concepts.ts` | `start-here.md` (paraphrased) |
| Commands tab (getting started, workflows) | same file — `gettingStartedSteps`, `documentWorkflowSteps`, etc. | `usage-guide.md` (paraphrased) |
| Situation → command map | same file — `usageSituations` | `usage-guide.md` table |
| Slash command reference | same file — `slashCommands` | `agents-help.md` |

> **Gap risk:** If you only update `.agent/references/*.md`, the desktop app **will drift** until `meridian-concepts.ts` is updated.

### P1 — VS Code extension

| What | Where | Notes |
| ---- | ----- | ----- |
| Agents Help / Usage / Start Here panels | Reads `.agent/references/*.md` via `kit-references.ts` | Updates when kit is installed/upgraded |
| Command palette help | `app-visual-studio/src/command-catalog.ts` | Per-command summaries — edit when commands ship; `guides` group first |
| Extension guide panels | `app-visual-studio/src/kit-reference-panels.ts`, `help-webview-html.ts` | Onboarding UX — edit when guide flow changes |
| Extension onboarding | `app-visual-studio/README.md` | Install, F5, kit sync |

### Mirrors (do not edit)

| Path | Regenerated by |
| ---- | -------------- |
| `.cursor/commands/`, `.cursor/skills/`, `.cursor/agents/`, `.cursor/rules/` | `sync_cursor_kit.sh` |
| `.claude/commands/`, `.claude/agents/` | `sync_cursor_kit.sh` |
| `.agents/skills/` (incl. `workflow-*`), `.codex/agents/*.toml`, `AGENTS.md` (symlink) | `sync_cursor_kit.sh` |
| `app-desktop/docs/templates/*` | `sync_cursor_kit.sh` |

---

## Protocol change checklist

Use this when adding or changing protocol behavior (example: **as-is inventory** for Mode B migration).

### 1. Define in kit (P0)

- [ ] `.agent/MERIDIAN.md` — bootstrap / lifecycle section
- [ ] `.agent/skills/init-project/SKILL.md` — procedure
- [ ] `.agent/workflows/init-meridian.md` — deliverables + next steps
- [ ] New template if needed — `.agent/references/templates/` + `INDEX.md` + `TEMPLATE_SOURCES.md`
- [ ] `.agent/references/start-here.md` — concepts + `docs/` tree
- [ ] `.agent/references/usage-guide.md` — situations + step table
- [ ] `.agent/references/agents-help.md` — command group row
- [ ] `.agent/rules/MERIDIAN.md` — tier table if new artifact owner
- [ ] `.agent/agents/*.md` — template protocol rows if agent-owned
- [ ] `.agent/references/templates/lifecycle.md` — flow diagram

### 2. Sync mirrors

- [ ] `./.agent/scripts/sync_cursor_kit.sh`

### 3. Duplicated UI (P0 for user-visible flows)

- [ ] `app-desktop/src/features/monitor/content/meridian-concepts.ts`
  - `gettingStartedSteps` (migration)
  - `folderStructure.items` (new `docs/` paths)
  - `usageSituations` if new situation
  - `slashCommands` / command groups if new slash command

### 4. Extension & onboarding (P1–P2)

- [ ] `app-visual-studio/src/command-catalog.ts` — if new shipped command
- [ ] `README.md` — one-line mention if user-facing
- [ ] `.agent/ARCHITECTURE.md` — if new layer or skill

### 5. Validation & dogfood

- [ ] `.agent/scripts/validate_meridian.py` — only if new required paths
- [ ] `python3 .agent/scripts/validate_meridian.py app-desktop`
- [ ] Decision log entry in `app-desktop/docs/decisions/`

---

## Quick lookup — “I changed X, where do I edit?”

| Change | Edit first | Also update |
| ------ | ---------- | ----------- |
| New slash command | `.agent/workflows/{name}.md` + skill | `agents-help.md`, `meridian.mdc` table, `meridian-concepts.ts`, `sync_cursor_kit.sh` |
| New delivery artifact | Template + skill + `INDEX.md` | `start-here.md`, `lifecycle.md`, validator if required |
| Migration / bootstrap step | `init-project/SKILL.md`, `init-meridian.md` | `usage-guide.md`, `start-here.md`, `meridian-concepts.ts` |
| New `docs/` folder (optional) | `start-here.md`, `doc-templates.md` | `meridian-concepts.ts` `folderStructure`, init skill |
| Multi-product / monorepo (resolver) | `projects-manifest-template.md`, `usage-guide.md`, `start-here.md`, `MERIDIAN.md` | `resolve-meridian-projects.ts`, `meridian-workspace.ts`, `meridian-workspace-picker.ts`, `meridian-context.ts`, `package.json`, `command-catalog.ts`, `meridian-concepts.ts`, `05_architecture.md` |
| Multi-product UI context (v2.04) | `usage-guide.md`, `start-here.md`, `agents-help.md`, `projects-manifest-template.md` | `webview-project-context.ts`, all `*-webview-html.ts`, `planning-panels.ts`, `board-editor-panel.ts`, `command-catalog.ts` (Board + views), `meridian-concepts.ts`, `app-visual-studio/README.md`, `05_architecture.md` § UI structure |
| Agent behavior only | `.agent/agents/{name}.md` | Usually nothing else |
| Desktop-only feature | `app-desktop/docs/us/` + phase docs | Not kit unless protocol changes |

---

## Multi-product (EPIC-13) — full surface checklist

When changing **several `docs/` trees in one repo** or **project context in the IDE**, touch every row below (v2.03 resolver + v2.04 UI).

### Kit narrative (P0)

- [ ] `.agent/MERIDIAN.md` — folder tree + multi-product paragraph
- [ ] `.agent/references/start-here.md` — `docs/` tree + monorepo table
- [ ] `.agent/references/usage-guide.md` — [Multiple Meridian projects](#multiple-meridian-projects) section
- [ ] `.agent/references/agents-help.md` — IDE extension commands table
- [ ] `.agent/references/templates/projects-manifest-template.md` — active project + UI
- [ ] `.agent/workflows/status.md` — resolve active `docs/` in procedure
- [ ] `.agent/skills/init-project/SKILL.md` — Phase 5 manifest proposal

### Extension (P1)

- [ ] `app-visual-studio/src/resolve-meridian-projects.ts` — A + B
- [ ] `app-visual-studio/src/meridian-workspace*.ts`, `meridian-context.ts` — persistence
- [ ] `app-visual-studio/src/webview-project-context.ts` — shared toolbar + titles (v2.04)
- [ ] `app-visual-studio/src/*-webview-html.ts`, `planning-panels.ts`, `board-editor-panel.ts`
- [ ] `app-visual-studio/src/command-catalog.ts` — Board, Deliverables, Select Active Project
- [ ] `app-visual-studio/README.md`, `CHANGELOG.md`

### Dogfood architecture (P1)

- [ ] `app-desktop/docs/05_architecture.md` — § Activation and `docs/` resolution + § UI structure

### Duplicated UI (P0 — manual)

- [ ] `app-desktop/src/features/monitor/content/meridian-concepts.ts` — `folderStructure`, `usageSituations`

### Mirrors

- [ ] `./.agent/scripts/sync_cursor_kit.sh`

---

## Related maps

| Map | Path |
| --- | ---- |
| Template canonical paths | `.agent/references/templates/TEMPLATE_SOURCES.md` |
| Kit architecture | `.agent/ARCHITECTURE.md` |
| IDE adapters | `.agent/IDE_ADAPTERS.md` |
| Scrum ↔ Meridian | `.agent/references/scrum-meridian-map.md` |
| Multi-product manifest | `.agent/references/templates/projects-manifest-template.md` |
