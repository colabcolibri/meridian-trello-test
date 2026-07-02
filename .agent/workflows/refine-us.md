---
description: Refine a user story for implementation — deepen Approach, architecture refs and tests.
---

# /refine-us — refine user story

$ARGUMENTS

---

## Critical rules

1. Use `board-keeper` + `@[skills/refine-user-story]`
2. **Mandatory read:** `writing-guide.md` + `code-quality-at-us-time.md` + `refine-checklist.md`
3. **Mandatory read:** `docs/04_principles.md` (DRY, SRP) this session
4. **NO product code** — docs only
5. Approach bullets must **explain** (full sentences) — not bare paths
6. `ready: true` only when checklist passes
7. **Not a review** — for audit-only without edits, use `/review-us` first

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: REFINE US

RULES:
1. Read US, depends_on US, cited architecture sections
2. Deepen ### Approach — each bullet: what + where + why
3. Fix ### Architecture refs — exact § from `05_architecture.md` or `docs/architecture/*.md`
4. DRY / SRP — Approach names reuse; no mixed layers; Out of scope lists creep
5. Concrete Plan/Planned — numbered manual steps or commands
6. Fix Why/Where only if create left real gaps
7. ready: true iff checklist passes (rows 11–12 included)
8. generate-board-json
```

---

## Output

```txt
US refined:
File:
Ready: yes | no
DRY / SRP: pass | fail
Approach quality: explanatory | still thin
Tests: concrete | generic
Next: implement | /refine-us again
```
