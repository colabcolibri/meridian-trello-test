---
description: Create a Meridian epic file in docs/epics.
---

# /create-epic — create epic

$ARGUMENTS

---

## Critical rules

1. Use `documentation-strategist` + `@[skills/create-epic]`
2. **Mandatory read:** `writing-guide.md` + `epic-template.md` **before** Write
3. **Gate:** `05_architecture.md` + `03_user_types.md` approved
4. Capability = **≥2 paragraphs** (problem → product behavior)
5. Expected outcome = **1 paragraph** observable done-state
6. Do not create US in same turn

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: CREATE EPIC

RULES:
1. Phase 0 — who uses it, what friction exists today, what changes
2. Next EPIC-XX id
3. Write prose Capability + Expected outcome (see writing-guide golden example)
4. Out of scope — bullets with rationale
5. Save docs/epics/EPIC-XX.md
6. validate_meridian.py
```

---

## Output

```txt
Epic created:
File:
Problem summarized (one line):
Outcome:
Next: /create-us for executable slices
```
