# Meridian skills

> Guide to creating and using skills in the `.agent/` kit.

---

## Overview

Skills package specialized knowledge with **progressive disclosure**: the agent reads metadata (`name`, `description`) and only loads the body when the request matches the description.

This avoids inflating context with the entire Meridian protocol on every message.

---

## Folder structure

```txt
.agent/skills/skill-name/
  SKILL.md          # required — index + procedure
  references/       # optional — templates, long checklists
  scripts/          # optional — automation
  assets/           # optional — images, binary examples
```

| Scope | Path |
| ------ | ------- |
| Workspace (Meridian project) | `<project-root>/.agent/skills/` |
| Meridian kit (this repo) | `meridian/.agent/skills/` |
| Cursor (local mirror) | `<root>/.cursor/` → symlinks to `.agent/` (**gitignored** in kit) |

After editing skills in `.agent/`, run `./.agent/scripts/sync_cursor_kit.sh` for Cursor to index them.

---

## `SKILL.md` frontmatter

```yaml
---
name: my-skill
description: One clear line with triggers. Use when...
allowed-tools: Read, Glob, Grep   # optional — read-only skills
---
```

Rules:

- `name` in kebab-case, same as folder name.
- `description` is the main discovery trigger for the agent.
- File body = **index**; long details go in `references/`.

---

## "When to read" table (required pattern)

Every `SKILL.md` with references must include:

```markdown
| File | When to read |
| ------- | ---------- |
| `references/foo.md` | When creating X |
```

---

## Agents vs skills

| Layer | Role |
| ------ | ------ |
| **Agent** | Persona, phases, prohibitions, output format, skill list |
| **Skill** | Repeatable procedure, templates, checklists, scripts |

The agent references skills in frontmatter:

```yaml
skills: init-project, update-decisions-log
```

---

## Scripts

Scripts live in `.agent/skills/<skill>/scripts/` or global `.agent/scripts/`.

Global example in this kit:

```bash
python .agent/scripts/validate_meridian.py /path/to/project
```

Agents and skills may invoke scripts when the procedure requires objective validation.

---

## Minimal example

```markdown
---
name: example
description: Does X in the Meridian flow. Use when user asks for X.
allowed-tools: Read, Glob, Grep
---

# Example

## When to trigger
- ...

## Procedure
1. ...

## References
| File | When to read |
| ------- | ---------- |
| `references/template.md` | When generating file Y |
```

---

## Official Meridian kit skills

| Skill | Folder |
| ----- | ----- |
| `init-project` | `init-project/` |
| `create-epic` | `create-epic/` |
| `create-version` | `create-version/` |
| `create-sprint` | `create-sprint/` |
| `create-user-story` | `create-user-story/` |
| `review-user-story` | `review-user-story/` |
| `refine-user-story` | `refine-user-story/` |
| `complete-user-story` | `complete-user-story/` |
| `generate-board-json` | `generate-board-json/` |
| `update-decisions-log` | `update-decisions-log/` |
| `security-review` | `security-review/` |
| `meridian-routing` | `meridian-routing/` |

When adding a new skill, update `.agent/ARCHITECTURE.md` and the root `README.md`.
