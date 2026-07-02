---
description: Close a Meridian sprint — sprint review, retrospective, status complete.
---

# /complete-sprint — close sprint

$ARGUMENTS

---

## Critical rules

1. Use `sprint-planner` + `@[skills/complete-sprint]`
2. **Mandatory read:** `sprint-template.md` + target `docs/sprints/vX-SY.md` **before** editing status
3. **Gate:** manager confirms increment vs sprint `goal` and US Acceptance (sprint review)
4. Fill `## Retrospective` — mandatory even one line per field
5. Set `status: complete` only when retrospective is filled
6. Scope shifts or cross-cutting outcomes → `@[skills/update-decisions-log]` (run `date` first)
7. **NO product code** — docs only

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: COMPLETE SPRINT

RULES:
1. Resolve sprint id from $ARGUMENTS or ask
2. Read sprint file + listed US statuses in docs/us/
3. Report open US (❌ or 🔶 without Missing:) — do not force complete if Must US unfinished unless manager explicitly accepts
4. Fill Retrospective: What worked / What to improve / Decisions to log
5. Set status: complete in frontmatter
6. update-decisions-log if retrospective lists decisions or scope changed
7. validate_meridian.py when available
```

---

## Output

```txt
Sprint completed:
File:
Status: complete
US summary: (✅ / 🔶 / ❌ counts)
Retrospective filled: yes | no
Decisions logged: yes | no
Open US deferred to next sprint:
Next: /plan-sprint or /create-us
```

---

## Examples

| Request | Result |
| ------ | --------- |
| `/complete-sprint v2.05-S1` | Retrospective filled + status complete |
| Must US still ❌ | Block or 🔶 report; manager decides defer vs extend sprint |
