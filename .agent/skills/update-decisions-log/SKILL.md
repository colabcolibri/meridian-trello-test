---
name: update-decisions-log
description: Prepends relevant project decisions to docs/decisions/YYYY-MM-DD.json (newest first in entries). Use when scope, stack, security, architecture, versions or acceptance criteria change.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Update decisions log

## Selective reading

| File | When to read |
| ------- | ---------- |
| `references/decision-template.md` | When registering each new entry |
| `references/decision-schema.md` | When creating daily file or validating fields |

## When to register

Change in: scope, stack, security, users, epics, versions, architecture, database, API, environments, acceptance, agent governance.

## Procedure

1. Determine today's date (`YYYY-MM-DD`) — **run** `date +"%Y-%m-%d"` at project root (never guess from chat or training cutoff).
2. **Capture real clock time** — **run** `date +"%H:%M"` (24h, local). Use that value for `entries[].time`. Do **not** round to :00/:15/:30/:45 or invent a time.
3. Open or create `docs/decisions/YYYY-MM-DD.json`.
4. Insert **at the beginning** of `entries` using `references/decision-template.md`.
5. Ensure `date` in JSON matches filename.
6. Old entries remain **below**, intact.
7. If `approved` doc was changed → `status: review` on that doc + mention in impact.
8. **Never** edit or reorder old entries.

## Archiving

Old days remain as immutable JSON files in `docs/decisions/`.
Do not compact or move old entries — history is append-only by prepend.

## Output

```txt
Decision logged:
File: docs/decisions/YYYY-MM-DD.json
Affected document:
Docs moved to review:
Follow-up:
```
