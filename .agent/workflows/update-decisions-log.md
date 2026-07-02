---
description: Prepend a decision entry to docs/decisions/YYYY-MM-DD.json with real date and clock time.
---

# /update-decisions-log — log a decision

$ARGUMENTS

---

## Critical rules

1. **Mandatory read:** `@[skills/update-decisions-log]` + `references/decision-template.md`
2. **Before Write:** run at project root:
   - `date +"%Y-%m-%d"` → filename + JSON `date`
   - `date +"%H:%M"` → `entries[].time` (24h local; never invent or round)
3. Prepend at the **start** of `entries` — never edit or delete old entries
4. **NO product code** — decision log only unless manager also asked for implementation

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: LOG DECISION

RULES:
1. Capture what changed, why, impact, affected_document, responsible
2. Create docs/decisions/YYYY-MM-DD.json if missing (date matches filename)
3. Prepend new entry using decision-template.md
4. If an approved phase doc changed → set that doc status: review + mention in impact
5. validate_meridian.py on project folder when available
```

---

## Output

```txt
Decision logged:
File: docs/decisions/YYYY-MM-DD.json
Clock used: HH:MM (from date command)
Affected document:
Docs moved to review:
Follow-up:
```
