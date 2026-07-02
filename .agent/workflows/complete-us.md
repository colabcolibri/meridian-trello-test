---
description: Close a Meridian user story after implementation — fill technical summary, acceptance and status.
---

# /complete-us — close user story

$ARGUMENTS

---

## Critical rules

1. Use `board-keeper` + `@[skills/complete-user-story]`
2. **Gate:** implementation delivered; applicable tests passed; `depends_on` at `✅`
3. **Mandatory read:** `implementation-template.md` + `us-template.md` + `section-contracts.md` + target US **before** editing status
4. **Do not** mark `✅` with placeholder in `## Record`
5. Regenerate `board.json` at the end
6. `update-decisions-log` only if cross-cutting decision — **read** `@[skills/update-decisions-log]` and run `date +"%Y-%m-%d"` + `date +"%H:%M"` before Write
7. Add **suggested commit** in `### Executed` — do **not** `git commit` unless manager explicitly asks (see `commit-after-us-close.md`)

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: COMPLETE US

RULES:
1. board-keeper Phase 0 — verify US id and dependencies
2. Inspect git diff / files touched for evidence
3. Fill ## Record (Files + layers + Executed)
4. Mark Intent/Acceptance [x]; update Plan/Planned [x]; set tests_status: done
5. Set status ✅ (or 🔶 + Missing: if partial) — only ✅ if tests: none or tests_status: done
6. generate-board-json
7. update-decisions-log if protocol/architecture changed — read skill + run date before Write
8. suggested commit line in ### Executed; remind manager: commit after /sync-board (human)
```

---

## Output

```txt
US completed:
File:
Status:
Implementation summary:
Files touched:
Tests run:
Board updated:
Decisions logged:
Suggested commit:
Next (human): commit per commit-after-us-close.md
Open items:
```

---

## Examples

| Request | Result |
| ------ | --------- |
| `/complete-us US-0034` | US-0034 with technical implementation + ✅ + board |
| `/complete-us` without id | Ask which US or infer from implementation session |
| Partial implementation | Status 🔶 + explicit Missing:; do not force ✅ |
