---
name: complete-sprint
description: Closes a Meridian sprint after sprint review — fills Retrospective, sets status complete, logs decisions. Use with /complete-sprint vX-SY.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Complete sprint (Meridian)

## Selective reading

| File | When to read |
| ------- | ---------- |
| `../create-sprint/references/sprint-template.md` | **Mandatory** — close rules + Retrospective |
| Target `docs/sprints/vX-SY.md` | Sprint goal, stories, current status |
| Listed `docs/us/US-XXXX.md` | US status for sprint review |
| `../update-decisions-log/SKILL.md` | When logging decisions from retrospective |

## When to trigger

- All or accepted subset of sprint US delivered.
- Manager ran sprint review (increment vs `goal` and Acceptance).
- Workflow `/complete-sprint vX-SY`.

**Do not** use to create or expand sprint scope — use `create-sprint` / `/plan-sprint`.

## Preconditions

| Check | Requirement |
| ----------- | --------- |
| Sprint file | `docs/sprints/vX-SY.md` exists |
| Sprint review | Manager confirmed increment (human gate) |
| Retrospective | Must be filled before `status: complete` |

If Must US remain `❌` without manager waiver → report blocker; do not silently mark complete.

## Procedure

1. Read sprint template + target sprint file.
2. For each US in `stories:` frontmatter, read frontmatter `status`.
3. Summarize delivery vs sprint `goal` and `done_when`.
4. Fill `## Retrospective`:
   - What worked:
   - What to improve:
   - Decisions to log:
5. Set frontmatter `status: complete`.
6. If retrospective or scope warrants → `update-decisions-log` (**read skill + run `date`**).
7. `validate_meridian.py` when available.

## Output

```txt
Sprint completed:
File:
Status: complete
US delivered: N ✅ / N 🔶 / N ❌
Retrospective filled: yes | no
Decisions logged: yes | no
Deferred US:
Next: /plan-sprint | /create-us
```
