---
name: create-sprint
description: Creates a Meridian sprint file in docs/sprints linked to a version. Use when planning execution slices within a release.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Create sprint (Meridian)

## Selective reading

| File | When to read |
| ------- | ---------- |
| `.agent/references/templates/INDEX.md` | Before any sprint create |
| `references/sprint-template.md` | **Mandatory** before drafting `docs/sprints/vX-SY.md` |
| `docs/versions/vX.md` | Parent version must exist |
| `docs/sprints/` | Existing sprints for version |

## Preconditions

- File `docs/versions/{version}.md` exists (`version: v1` in sprint).
- Referenced version is `planned` or `active`.
- `05_architecture.md` `approved` before creating new US.

## Procedure

1. Read `.agent/references/templates/INDEX.md` and **full** `references/sprint-template.md`.
2. List sprints for version in `docs/sprints/vX-S*.md` → next SY = highest + 1.
3. Fill template with `stories: [US-XXXX, …]` (existing or planned US).
3. Save `docs/sprints/vX-SY.md`.
4. New US → `/create-us` after gates; then `/sync-board`.

## Output

```txt
Sprint created:
File: docs/sprints/vX-SY.md
Version:
Stories:
sprint file saved: yes | no
```
