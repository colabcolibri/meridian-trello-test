---
name: generate-board-json
description: Generates docs/kanban/board.json from Meridian user story frontmatter. Use after creating or changing user stories.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Generate board JSON

## Selective reading

| File | When to read |
| ------- | ---------- |
| `references/board-schema.md` | Field validation and divergences |

## Source of truth

```txt
docs/us/US-XXXX.md  →  derived  →  docs/kanban/board.json
```

Never edit the board as primary source.

## Procedure

1. Glob `docs/us/US-*.md`
2. Extract frontmatter: `id`, `title`, `epic`, `version`, `status`, `moscow`, `depends_on`, `done_when`, `tests`, `tests_status`, `ready`
3. Validate against `references/board-schema.md` and epics/versions folders
4. Sort by ascending ID
5. Write `docs/kanban/board.json`
6. Report invalid US without including them

## Optional validation

```bash
python .agent/scripts/validate_meridian.py <project-root>
```

## Output

```txt
Stories read:
Stories exported:
Invalid stories:
Board path:
Warnings:
```
