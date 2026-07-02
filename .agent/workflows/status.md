---
description: Report current Meridian project health, blockers and next actions.
---

# /status — project health

$ARGUMENTS

---

## Critical rules

1. **Read-only** — do not change docs without explicit request in `$ARGUMENTS`
2. Use `process-manager`
3. Read `docs/README.md` and frontmatter of `00`–`11`
4. Optional: `python3 .agent/scripts/validate_meridian.py <root>` (append `--json` for CI)

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: STATUS REPORT

PROCEDURE:
1. Read .agent/MERIDIAN.md
2. Resolve kit root and Meridian projects:
   - Read .meridian/projects.json if present
   - Discovery: every folder named exactly docs with 00_scope or us/
   - Report active project (manager choice, default, or single match)
3. Read docs/README.md for the **active** docs/ tree
4. For each phase doc 00–08 and 11: record status from frontmatter
5. Count US by status from active docs/us/ or board.json
6. List blockers (missing deps, invalid US, immature docs)
7. Recommend next human decision
```

---

## Output

```txt
Kit root:
Meridian projects (if >1): id → docs path (active marked)
Active project:
Current phase:
Docs:
  00_scope: [status]
  ...
US summary: ❌ n | 🔶 n | ✅ n
Ready for implement (ready: true): n | not ready: n
Board in sync: yes | no
Ready:
Blocked:
Next action (human):
Next action (agent):
Validation warnings:
```
