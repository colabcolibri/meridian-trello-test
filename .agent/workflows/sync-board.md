---
description: Regenerate docs/kanban/board.json from Meridian user stories.
---

# /sync-board — sync board

$ARGUMENTS

---

## Critical rules

1. Use `board-keeper` + `@[skills/generate-board-json]`
2. Source of truth: `docs/us/*.md` only
3. Do not preserve orphan entries in JSON
4. Report invalid US without exporting
5. Optional: `validate_meridian.py`

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: SYNC BOARD

RULES:
1. Glob docs/us/US-*.md
2. Validate per board-schema reference
3. Write docs/kanban/board.json sorted by id
4. List invalid stories and warnings
```

---

## Output

```txt
Stories read:
Stories exported:
Invalid stories:
Board path:
Warnings:
```
