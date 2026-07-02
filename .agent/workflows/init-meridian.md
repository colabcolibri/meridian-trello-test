---
description: Initialize a project using the Meridian protocol and minimum governance. Works for new projects and existing codebases migrating to Meridian.
---

# /init-meridian — initialize project

$ARGUMENTS

---

## Critical rules

1. **NO PRODUCT CODE** — only `docs/` structure and governance
2. Use agent `process-manager`, not generic IDE plan mode
3. Follow `@[skills/init-project]` — read Mode A (new) or Mode B (existing codebase)
4. Register initial decision in `docs/decisions/YYYY-MM-DD.json`
5. Never mark phase docs `approved` — only `draft`

---

## Mode detection

| Situation | Mode |
| --------- | ---- |
| No codebase yet, starting fresh | **Mode A** — new project |
| Code exists, no `docs/` | **Mode B** — existing codebase |
| `docs/` exists but incomplete | Repair — run `init-project` and fill gaps only |

If `$ARGUMENTS` does not specify, read the repository first — then determine mode.

---

## Task

Use `process-manager` with this context:

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: INIT ONLY (no product code)
- Target: project root (confirm with user if ambiguous)

RULES:
1. Read .agent/MERIDIAN.md
2. Detect mode: new project (Mode A) or existing codebase (Mode B)
3. Run init-project skill for the detected mode
4. Mode A: ask up to 5 questions before creating docs
5. Mode B: read codebase first, then ask only what is still unclear
6. Create docs/ tree per skill
7. 00_scope.md = draft, populated (not blank)
8. 11_decisions.md stub + first JSON entry in docs/decisions/
9. board.json = []
10. Validate .gitignore baseline
11. REPORT exact paths created and any inferences (Mode B)
```

---

## Deliverables

| Item | Location |
| ---- | ----- |
| Docs structure | `docs/` + subfolders |
| Initial scope | `docs/00_scope.md` (populated, not blank) |
| Decision log | `docs/decisions/YYYY-MM-DD.json` + stub `11_decisions.md` |
| Empty board | `docs/kanban/board.json` |
| As-is inventory (Mode B only) | `docs/inventory/as-is.md` |
| Templates mirror | `docs/templates/` (symlinks to kit; optional but recommended) |

---

## Expected output

```txt
Meridian initialized:
Mode: new project | existing codebase
Created:
Inferred (Mode B only):
Assumptions requiring human review:
Pending:
Blocked:
Next human decision:
```

---

## After

Tell the user:

```txt
Next steps (new project):
1. Review docs/00_scope.md — approve or adjust inferences
2. Work through 01_tech_stack → 02_security → 03_user_types → 04_principles (in order)
3. Run /architecture to draft 05_architecture.md
4. Approve 05_architecture (human action in frontmatter)
5. Plan delivery: /create-epic → /create-version → /plan-sprint
6. Create work: /create-us → /refine-us → /implement-us → /complete-us → /sync-board

Next steps (existing codebase — add before step 5):
A. Review docs/inventory/as-is.md — fix confidence, gaps, epic candidates
B. Promote validated rows into phase docs; archive inventory after 05_architecture approved
C. /create-epic for existing capabilities (status: complete where already shipped)
D. Optional v0 baseline version for pre-Meridian state — no retroactive US with ✅
E. Forward work only in v1+ via /create-us
```
