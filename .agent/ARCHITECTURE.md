# Meridian agent architecture

> Structure of agents, skills, workflows, rules and scripts — Antigravity pattern adapted to the Meridian protocol.

---

## Purpose

| Layer | File | Audience |
| ------ | ------- | ------- |
| Kit monorepo | `README.md` | Humans (GitHub, onboarding) |
| Portable kit | `.agent/` | Copy to client projects; Antigravity, ag-kit, Cursor, Claude Code |
| IDE adapters | `.cursor/`, `.claude/`, `.agents/skills/`, `.codex/` (local, gitignored) | Cursor, Claude Code, Codex (symlinks + generated TOMLs → `.agent/`) — see [IDE_ADAPTERS.md](./IDE_ADAPTERS.md) |
| Always-on rules | `.agent/rules/meridian.mdc` + `.agent/rules/MERIDIAN.md` | Agents |
| Master protocol | `.agent/MERIDIAN.md` | Full governance |
| Operations | `.agent/agents`, `skills`, `workflows` | Personas and procedures |
| Human references | `.agent/references/` | `start-here`, `usage-guide`, `agents-help`, `instruction-surfaces`, `scrum-meridian-map`, optional `scrum-guide-complete` |

The desktop app (`app-desktop/`) monitors Meridian folders; it is not the source of truth. Learn/Commands UI copy lives in `app-desktop/src/features/monitor/content/meridian-concepts.ts` — see [instruction-surfaces.md](./references/instruction-surfaces.md) when the protocol changes.

### Why `.agent` and `.cursor`?

- **`.agent/`** — Antigravity convention; copyable to projects and other tools.
- **`.cursor/`** — **local** adapter (generated symlinks; **do not commit**).

**Edit in `.agent/`** and run `./.agent/scripts/sync_cursor_kit.sh` to recreate adapters in `.cursor/`, `.claude/`, and Codex paths (required after clone).

---

## Directory structure

```txt
.agent/                    # canonical source (Antigravity / distribution)
  MERIDIAN.md
  rules/MERIDIAN.md
  agents/
  skills/
  workflows/
  scripts/
    validate_meridian.py
    migrate_us_v2_structure.py
    sync_cursor_kit.sh
  references/templates/      # delivery templates (INDEX, writing-guide, section-contracts, …)

.cursor/                   # Cursor adapter (local, gitignored — sync_cursor_kit.sh)
  rules/meridian.mdc       # alwaysApply
  skills/
  agents/
  commands/                # workflows as slash commands
```

---

## Rule priority

```txt
P0  .agent/rules/MERIDIAN.md
P1  .agent/MERIDIAN.md + .agent/agents/{agent}.md
P2  .agent/skills/{skill}/SKILL.md (+ references on demand)
```

Workflows orchestrate agents; they do not replace the master protocol.

---

## Agents

| Agent | Purpose | Skills |
| ----- | ------- | ------ |
| `process-manager` | Governance, status, gates, **implement US** | init-project, implement-user-story, update-decisions-log, generate-board-json, meridian-routing |
| `scope-architect` | `00_scope.md` | init-project, update-decisions-log, meridian-routing |
| `documentation-strategist` | Phase docs `01`–`05`, `08`–`10`, `docs/epics/` | init-project, create-epic, create-user-story, update-decisions-log, meridian-routing |
| `security-steward` | `02_security.md` | security-review, update-decisions-log, meridian-routing |
| `architecture-guardian` | `05_architecture.md` | security-review, update-decisions-log, meridian-routing |
| `sprint-planner` | `docs/versions/`, `docs/sprints/` | create-version, create-sprint, complete-sprint, create-user-story, … |
| `board-keeper` | US + `board.json` | create-user-story, review-user-story, refine-user-story, complete-user-story, generate-board-json, update-decisions-log, meridian-routing |

Each agent includes: phases 0/-1, mission, prohibitions, output format, delegation.

---

## Skills

| Skill | References |
| ----- | ---------- |
| `init-project` | `doc-templates.md`, `gitignore-baseline.md` |
| `create-epic` | `epic-template.md`, `writing-guide.md` |
| `create-version` | `version-template.md`, `writing-guide.md` |
| `create-sprint` | `sprint-template.md` |
| `complete-sprint` | `sprint-template.md` |
| `create-user-story` | `us-template.md`, `writing-guide.md` |
| `review-user-story` | `review-checklist.md`, `writing-guide.md` |
| `refine-user-story` | `refine-checklist.md`, `writing-guide.md` |
| `implement-user-story` | `implement-gate-checklist.md` |
| `complete-user-story` | `implementation-template.md` |
| `generate-board-json` | `board-schema.md` |
| `update-decisions-log` | `decision-template.md`, `decision-schema.md` |
| `security-review` | `checklists.md` |
| `meridian-routing` | — (inline matrix) |

**Agent mirror:** all delivery templates are symlinked under `.agent/references/templates/` with registry `INDEX.md`. Agents must read INDEX + full template before Write — see each agent's **Template protocol** section.

See `.agent/skills/doc.md` to create new skills.

---

## Workflows

| Workflow | Agent | Mode |
| -------- | ----- | ---- |
| `init-meridian` | process-manager | init, no code |
| `status` | process-manager | read-only |
| `plan-sprint` | sprint-planner | planning |
| `create-version` | sprint-planner | create release in `docs/versions/` |
| `create-us` | board-keeper | create US |
| `review-us` | board-keeper | audit US — report only |
| `refine-us` | board-keeper | refine US before implement |
| `implement-us` | process-manager | gate + implement when `ready: true` |
| `complete-us` | board-keeper | close US after implementation |
| `create-epic` | documentation-strategist | create epic in `docs/epics/` |
| `architecture` | architecture-guardian | doc 05 |
| `security-pass` | security-steward | doc 02 |
| `sync-board` | board-keeper | derive JSON |
| `daily-with-ai` | process-manager | daily manager + AI routine |

All support `$ARGUMENTS` and a critical rules section.

---

## Scripts

```bash
# Structure + semantic validation (US Plan/Record, epic prose, board sync hints)
python3 .agent/scripts/validate_meridian.py <project-root>
python3 .agent/scripts/validate_meridian.py <project-root> --json   # CI

# One-time US schema migration (flat sections → Intent/Plan/Record/Boundaries)
python3 .agent/scripts/migrate_us_v2_structure.py <project-root>
python3 .agent/scripts/migrate_us_v2_structure.py <project-root> --restore-preamble

# IDE adapters (after clone or kit changes)
./.agent/scripts/sync_cursor_kit.sh
```

---

## Authority

1. User instruction
2. `.agent/MERIDIAN.md`
3. `.agent/rules/MERIDIAN.md`
4. Workflows
5. Agents
6. Skills

---

## Difference vs Antigravity kit

| Antigravity | Meridian |
| ----------- | -------- |
| `README.md` + `rules/GEMINI.md` | `README.md` (kit repo) + `.agent/` + `rules/MERIDIAN.md` |
| 37 code/stack skills | 10 document governance skills |
| `intelligent-routing` (technical domains) | `meridian-routing` (docs/US phases) |
| Plan files `{task-slug}.md` | `docs/` phases `00`–`11` + US |
| Long agents for implementation | Agents for documentation and gates before code |
