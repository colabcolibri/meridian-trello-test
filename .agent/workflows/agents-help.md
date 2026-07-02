---
description: Open the agents and slash commands reference — groups, steps, and who serves what.
---

# /agents-help — agents & commands map

$ARGUMENTS

---

## Critical rules

1. **Read-only** — do not change docs unless `$ARGUMENTS` explicitly asks
2. Use `process-manager`
3. Primary reference: `.agent/references/agents-help.md`
4. Cross-read: `.agent/references/start-here.md` (concepts), `.agent/references/usage-guide.md` (situations)

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: HELP / ORIENTATION

PROCEDURE:
1. Read .agent/references/agents-help.md
2. If project has docs/, read docs/README.md and phase frontmatter 00–08, 11
3. Summarize for the human:
   - Agent groups (1 Orchestration … 6 Board)
   - Slash command groups (A Bootstrap … F Decisions)
   - Where they are in the numbered end-to-end steps (1–17)
   - Which agent + command applies to their request (or /status if unclear)
4. Tell them to open agents-help.md in the editor for the full tables
5. If $ARGUMENTS names a specific agent or command, expand that row only
```

---

## Output format

```txt
Meridian agents help

Your situation: [one line from docs state or user request]

You are around step [N]: [step name]
Recommended next: [command] → agent [name] → group [letter/number]

Quick map:
- Orchestration: process-manager — /status, /init-meridian, /daily-with-ai
- Scope: scope-architect — 00_scope
- Phase docs: documentation-strategist — 01–08, /create-epic
- Security: security-steward — /security-pass
- Architecture: architecture-guardian — /architecture (gate before backlog)
- Planning: sprint-planner — /create-version, /plan-sprint
- Execution: board-keeper — /create-us, /refine-us, /complete-us, /sync-board

Full reference: .agent/references/agents-help.md
```

---

## After

Offer to run **`/status`** if the user wants project-specific next action instead of the generic map.
