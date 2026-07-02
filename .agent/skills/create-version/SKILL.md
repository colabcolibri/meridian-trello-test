---
name: create-version
description: Creates a Meridian release file in docs/versions. Use when defining a new product version before user stories.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Create version (Meridian)

## Selective reading

| File | When to read |
| ------- | ---------- |
| `.agent/references/templates/writing-guide.md` | Release prose example |
| `references/version-template.md` | **Mandatory** before Write |
| `docs/versions/`, `docs/00_scope.md` | IDs and scope |

## Preconditions

| Doc | Required status |
| --- | -------------- |
| `05_architecture.md` | `approved` |
| `00_scope.md`, `03_user_types.md` | aligned with release |

## Writing rules (mandatory)

| Section | Rule |
| ------- | ---- |
| **Objective** | Paragraph — release theme, user-visible change vs previous version |
| **Done criteria** | Paragraph — who validates complete, observable end state |
| **Included** | Epics/US ids with **one explanatory line each** — not copy-paste from epic |
| **Explicitly out** | Bullets with rationale |

## Procedure

1. Read `writing-guide.md` + `version-template.md`.
2. Next `vX` id.
3. Write prose Objective + Done criteria.
4. Save `docs/versions/vX.md`.
5. `update-decisions-log` if boundaries change.
6. `validate_meridian.py`

## Output

```txt
Version created:
File:
Outcome:
Narrative complete: yes | no
Next: /plan-sprint → /create-us
```
