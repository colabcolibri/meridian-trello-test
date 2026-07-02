---
name: review-user-story
description: Audits a Meridian user story against writing quality, section contracts and refine checklist — report only, no ready flag. Use for /review-us US-XXXX, quality audit, or before refine/implement.
allowed-tools: Read, Glob, Grep, Bash
---

# Review user story (Meridian)

> **Read-only audit.** Compare the US file to templates and checklists; output a gap report. Do **not** set `ready: true`, edit the US, or write product code unless the manager explicitly asks to fix in the same turn.

## Selective reading

| File | When to read |
| ------- | ---------- |
| `.agent/references/templates/TEMPLATE_SOURCES.md` | When unsure which file is canonical |
| `.agent/references/templates/writing-guide.md` | Prose quality bar (Why / Where / Approach) |
| `.agent/references/templates/section-contracts.md` | Fixed `##` / `###` structure |
| `references/review-checklist.md` | **Mandatory** — audit rubric and output format |
| `references/us-template.md` | Expected full US shape |
| `.agent/skills/refine-user-story/references/refine-checklist.md` | Same gates `/refine-us` uses — cite failures here |
| Target `docs/us/US-XXXX.md` | File under review |

## When to trigger

- After `/create-us`, before `/refine-us` — “is this draft good enough to refine?”
- On legacy or migrated US — quality audit without auto-editing
- Before implement — confirm gaps even when `ready: true`
- Manager asks “review US-XXXX” without implementing or refining
- Workflow `/review-us US-XXXX`

## Difference vs `/refine-us`

| | `/review-us` | `/refine-us` |
| --- | --- | --- |
| Edits US | **No** (default) | Yes — deepens Context |
| Sets `ready: true` | **Never** | When checklist passes |
| Product code | Never | Never |
| Output | Gap report + recommendation | Updated US file |

If review finds blockers → recommend `/refine-us US-XXXX`. If review passes all refine gates → say “ready for `/refine-us` to set ready: true” (refine still required for the flag).

## Procedure

1. Read templates listed above and target US (+ `depends_on` US if cited).
2. Run `python3 .agent/scripts/validate_meridian.py <project-folder>` when available; include errors/warnings in report.
3. Walk **review-checklist.md** — mark each row pass | fail | warn.
4. Classify prose: Why / Where / Approach vs `writing-guide.md` anti-patterns.
5. Note frontmatter: `ready`, `status`, `depends_on`, `tests` / `tests_status`.
6. **Do not** change files unless manager explicitly requests fixes in the same message.
7. End with one recommended next step: `/refine-us`, `/create-us` rework, implement (only if ready + passes), or `/complete-us` (if code done).

## Output

```txt
US review:
File:
Validator: pass | N errors, M warnings
Checklist: X/Y pass

Failures:
- [check id] — what is wrong — where in file

Warnings:
- ...

Ready for implement (content): yes | no
ready flag in file: true | false | unset
Recommendation: /refine-us US-XXXX | implement | /complete-us | human edit
```
