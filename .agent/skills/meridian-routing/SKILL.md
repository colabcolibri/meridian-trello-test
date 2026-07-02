---
name: meridian-routing
description: Automatic Meridian agent selection and task routing. Analyzes requests and picks process-manager, scope-architect, documentation-strategist, security-steward, architecture-guardian, sprint-planner, or board-keeper without explicit user mentions.
allowed-tools: Read, Glob, Grep
version: 1.0.0
---

# Meridian intelligent routing

> The agent acts as **Meridian process manager**, not a generic implementer.

## Principle

Before responding, classify the request and select the correct Meridian agent. State which expertise is active.

## Selection matrix

| Intent | Keywords | Agent(s) | Auto? |
| -------- | -------------- | -------- | ----- |
| Start / structure | "start", "setup", "create docs", "init meridian" | `process-manager` | yes |
| Status / governance | "status", "phase", "blocker", "can advance" | `process-manager` | yes |
| Daily AI workflow | "how to use AI", "day to day", "cursor routine", `/daily-with-ai` | `process-manager` | yes |
| Scope | "scope", "in scope", "out of scope", `00_scope` | `scope-architect` | yes |
| Phase documents | "tech stack", "principle", "environment", `01_`–`05_`, `08`–`10` | `documentation-strategist` | yes |
| Epic (capability) | "create epic", "new epic", `/create-epic`, `docs/epics/`, `EPIC-` | `documentation-strategist` + skill `create-epic` | yes |
| Security | "security", "OWASP", "secrets", "threat", `02_security` | `security-steward` | yes |
| Architecture | "architecture", `05_architecture` | `architecture-guardian` | yes |
| Version / sprint | "version", "sprint", "roadmap", `/create-version`, `docs/versions/`, `docs/sprints/` | `sprint-planner` + skill `create-version` / `create-sprint` | yes |
| Close sprint | "complete sprint", "close sprint", `/complete-sprint`, sprint retrospective | `sprint-planner` + `complete-sprint` | yes |
| Decisions / log | "decision", "decisions", "decision log", `/update-decisions-log`, `docs/decisions/` | read `update-decisions-log` + run `date` before Write | yes |
| User story / board | "user story", "US-", "kanban", "board.json", "acceptance" | `board-keeper` | yes |
| Implement US / code | "implement", "build", `/implement-us`, "code for US" | `process-manager` + `implement-user-story` | **block** if `ready` not true |
| Refine US | "refine US", "ready for implement", `/refine-us`, "fill context" | `board-keeper` + `refine-user-story` | yes |
| Review US | "review US", "audit US", `/review-us`, "check story quality" | `board-keeper` + `review-user-story` | yes |
| Close US | "complete US", "mark done", `/complete-us`, "close story" | `board-keeper` + `complete-user-story` | yes |
| US + planning | "plan sprint" + "create US" | `sprint-planner` + `board-keeper` | yes |

## Decision flow

```txt
1. Conceptual question? → Answer without changing files
2. Slash command? → Open .agent/workflows/{cmd}.md → read template from .agent/references/templates/ before Write
3. Code? → `/implement-us` gate or process-manager validates `ready: true` + Plan → read Architecture refs → then implement
4. Create/close epic, version, sprint, US? → INDEX.md + full template + `section-contracts.md` mandatory before Write
5. Otherwise → one row from matrix above
```

## Response format (required)

```markdown
🤖 **Applying knowledge from `@[agent-name]`...**

[response]
```

Multiple agents:

```markdown
🤖 **Applying knowledge from `@[scope-architect]` + `@[documentation-strategist]`...**
```

## Rules

1. **Silent analysis** — do not narrate "I am analyzing" for paragraphs.
2. **User override** — `@agent` wins over automatic routing.
3. **Code without docs** — `process-manager` reports blocker; do not invent MVP in code.
4. **Decisions** — any relevant change → read `update-decisions-log` skill + run `date +"%Y-%m-%d"` and `date +"%H:%M"` before Write.
5. **Scrum concepts** — read `.agent/references/scrum-meridian-map.md` only; not `scrum-guide-complete.md` unless the manager asks.

## Complexity detection

| Complexity | Signals | Action |
| ------------ | ------ | ---- |
| Simple | One doc, one domain | One agent |
| Moderate | Two domains (e.g. security + architecture) | Two agents in sequence |
| High | "Build entire product" without docs | `process-manager` + questions (max 3) + `/init-meridian` |

## Gate questions (when vague)

Before creating structure or US:

1. What problem and for whom?
2. What is mandatory now vs later?
3. Which version/epic is the target?

Then proceed with the selected agent.
