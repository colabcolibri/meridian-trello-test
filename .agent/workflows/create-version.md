---
description: Create a Meridian release in docs/versions.
---

# /create-version — create version (release)

$ARGUMENTS

---

## Critical rules

1. Use `sprint-planner` + `@[skills/create-version]`
2. **Mandatory read:** `writing-guide.md` + `version-template.md`
3. **Gate:** `05_architecture.md` approved; scope + user types solid
4. Objective + Done criteria = **paragraphs**, not one-liners

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: CREATE VERSION

RULES:
1. Next vX id
2. Write Objective paragraph — release theme for user/manager
3. Write Done criteria paragraph — observable complete state
4. Included — epics/US with one explanatory line each
5. Save docs/versions/vX.md
6. validate_meridian.py
```

---

## Output

```txt
Version created:
File:
Release theme (one line):
Next: /plan-sprint → /create-us
```
