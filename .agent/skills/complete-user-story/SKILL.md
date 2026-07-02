---
name: complete-user-story
description: Closes a Meridian user story after implementation — fills Record, acceptance, status and board. Use when marking US done, completing US-XXXX, or after implementing a user story.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Complete user story (Meridian)

## Selective reading

| File | When to read |
| ------- | ---------- |
| `.agent/references/templates/INDEX.md` | Before closing any US |
| `.agent/references/templates/section-contracts.md` | Verify all `##` / `###` still match contract |
| `references/implementation-template.md` | **Mandatory** before filling `## Record` |
| `.agent/references/commit-after-us-close.md` | Commit timing and message — suggest only on close |
| `.agent/references/scrum-meridian-map.md` | Definition of Done alignment with `04_principles.md` |
| `../create-user-story/references/us-template.md` | Full US structure (verify all sections) |

## When to trigger

- Code (or product docs) implementation finished for a US.
- Manager asks to mark US as `✅`.
- Workflow `/complete-us` or explicit post-implementation closure.

**Do not** use on US creation — use `create-user-story`.

## Preconditions (hard gate)

| Check | Requirement |
| ----------- | --------- |
| US exists | `docs/us/US-XXXX.md` |
| Dependencies | Every `depends_on` with status `✅` |
| Evidence | Applicable build/lint/test passed |
| Acceptance | Criteria proven (mark `[x]`) |
| DoD | Project DoD in `docs/04_principles.md` satisfied (global); CA remain per US |

If anything fails → **do not** mark `✅`; use `🔶` with `Missing:` in acceptance.

## Procedure

1. Read `.agent/references/templates/INDEX.md`, **full** `implementation-template.md`, and target `docs/us/US-XXXX.md`.
2. Identify scope (acceptance + `done_when` + Plan refs).
3. Inspect what was delivered: `git diff`, changed files, test output.
4. Replace `## Record` with the **real delivery record** (see `references/implementation-template.md`):
   - paths relative to repo (not bare filenames);
   - summary per layer (Backend, Frontend, Scripts, Docs);
   - remove placeholders `_(fill on close)_` and prior plans that do not match code.
5. In `## Plan` / `### Planned` and `## Record` / `### Executed`:
   - mark `[x]` on **all** **Planned** items;
   - fill **Executed** with command/check + result (date optional);
   - add **suggested commit:** line per `commit-after-us-close.md` (do not run `git commit` unless manager explicitly asked);
   - **git commit:** line only if the manager already committed in this session or pastes SHA + message — otherwise omit (manager may add after commit);
   - update frontmatter `tests_status: done` (when `tests: required`).
6. Mark acceptance `[x]` with objective evidence.
7. Update frontmatter `status: ✅` (or `🔶` if partial + `Missing:`). Only mark `✅` if `tests: none` **or** `tests_status: done`.
8. Invoke `generate-board-json`.
9. If relevant cross-cutting change → read `update-decisions-log` skill + run `date` before Write (local US decisions stay in Record).

## Validations before marking `✅`

- `## Record` filled — not placeholder, not plan only.
- `### Files` section lists real paths touched (or `_n/a_` with explicit justification).
- Every verifiable acceptance item is `[x]` or has `Missing:` with status `🔶`.
- `depends_on` satisfied.
- If `tests: required`: `tests_status: done`, all **Planned** `[x]`, **Executed** filled.

## Output

```txt
US completed:
File:
Status:
Implementation summary: (1 line)
Files touched: (count)
Tests run:
Board updated:
Decisions logged: yes | no
Suggested commit: (line for manager — human commits after close)
Next (human): git commit per commit-after-us-close.md
Open items:
```
