---
description: Plan a Meridian version or sprint without writing implementation code.
---

# /plan-sprint — plan version/sprint

$ARGUMENTS

---

## Critical rules

1. **NO CODE** — only `docs/versions/`, `docs/sprints/` and US (if gate OK)
2. Use `sprint-planner` + `@[skills/create-sprint]` + `@[skills/create-user-story]` when applicable
3. Requires `05_architecture.md` approved
4. **Mandatory read:** `sprint-template.md` (+ `us-template.md` + `section-contracts.md` if creating US) **before** Write
5. New US only with epic/version referenced in existing folders
6. Sprints in **`docs/sprints/`** — one file per sprint
7. Log scope shifts → read `@[skills/update-decisions-log]` + run `date` before Write
8. After changing US → `/sync-board`
9. `validate_meridian.py` on project folder when available

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: PLANNING ONLY

RULES:
1. sprint-planner Phase 0 context check
2. Update docs/versions/ and docs/sprints/ as needed
3. MoSCoW per US
4. Explicit dependency order — stories: [US-…] order = sprint priority (no story points)
5. Capacity = Must US + ready + deps + human judgment (see scrum-meridian-map.md)
6. Active sprint: do not expand scope without manager; log scope shifts in decisions
7. Log decisions if scope/version changes — read `update-decisions-log` skill + run `date` before Write
8. NO app/API/DB implementation files
9. validate_meridian.py when available
```

Read `.agent/references/scrum-meridian-map.md` for sprint ↔ ceremony mapping.

---

## Deliverables

| Item | Location |
| ---- | ----- |
| Planned version | `docs/versions/vX.md` |
| Sprint doc | `docs/sprints/vX-SY.md` |
| New US | `docs/us/` (only if preconditions OK) |

---

## Output

```txt
Version:
Sprint:
US in scope:
Dependency order:
Blocked US:
Board synced: yes | no
Human approval needed:
```

---

## After

```txt
Next: review release with manager → /create-us for stories → /sync-board
```
