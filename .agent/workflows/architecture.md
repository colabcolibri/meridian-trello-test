---
description: Create or review 05_architecture.md and docs/architecture/ detail files after required Meridian documents are approved.
---

# /architecture — architecture

$ARGUMENTS

---

## Critical rules

1. Use `architecture-guardian` + `@[skills/meridian-routing]` if ambiguous
2. **Mandatory read:** `architecture-folder-guide.md` before splitting or indexing detail files
3. Prerequisites: scope, stack, security, users (draft minimum)
4. Align with `02_security` — load `@[skills/security-review]` if auth, data, or agent boundaries change
5. Material change → `@[skills/update-decisions-log]` (run `date` before Write)
6. Gate stays on `05_architecture.md` frontmatter — not on each file in `architecture/`
7. No product code in this workflow (unless explicit request in $ARGUMENTS)

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: ARCHITECTURE DOC

RULES:
1. architecture-guardian Phase 0 gate
2. Read 00, 01, 02, 03, 04 before editing 05
3. Cross-check 06/07/08 if they exist — no contradictions
4. Keep 05 as overview + index; move deep specs to docs/architecture/*.md when warranted
5. Fill checklist in agent file; maintain ## Architecture detail files table when folder used
6. Set status draft or review — not approved without human
```

---

## Output

```txt
05_architecture status:
Detail files (if any):
Aligned with: [docs]
Drift detected:
Proposed changes:
Security follow-ups:
Ready for review: yes | no
```
