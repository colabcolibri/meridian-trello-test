---
name: create-epic
description: Creates a Meridian epic file in docs/epics after architecture is approved. Use when defining a new product capability block before user stories.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Create epic (Meridian)

## Selective reading

| File | When to read |
| ------- | ---------- |
| `.agent/references/templates/writing-guide.md` | **Mandatory** — epic prose + golden example |
| `.agent/references/scrum-meridian-map.md` | Epic lifecycle (new epic vs reopen) |
| `references/epic-template.md` | **Mandatory** before Write |
| `docs/03_user_types.md` | Validate `profiles` |
| `docs/epics/`, `docs/versions/` | IDs and duplication |

## Preconditions

| Doc | Required status |
| --- | -------------- |
| `05_architecture.md` | `approved` |
| `00_scope.md` | in scope |
| `03_user_types.md` | `approved` |

Epic = **product capability**, not a folder in `src/`.

## Writing rules (mandatory)

| Section | Rule |
| ------- | ---- |
| **Capability** | ≥ 2 paragraphs: (1) user problem today (2) product behavior after epic |
| **Expected outcome** | 1 paragraph — observable “done” for manager/user |
| **Out of scope** | Bullets with **why** each item is excluded |
| **outcome** (frontmatter) | One sentence summary — body expands, not repeats |

Forbidden: feature bullet list without problem narrative; module names as capability.

## Procedure

1. Read `writing-guide.md` + `epic-template.md`.
2. Next ID = max EPIC-XX + 1.
3. Write prose sections per rules above.
4. Validate `profiles` vs `03_user_types.md`; `versions` vs `docs/versions/`.
5. Save `docs/epics/EPIC-XX.md`.
6. `update-decisions-log` if boundaries change.

## Output

```txt
Epic created:
File:
Outcome:
Versions:
Profiles:
Narrative complete: yes | no
Open questions:
Next: /create-us for slices
```
