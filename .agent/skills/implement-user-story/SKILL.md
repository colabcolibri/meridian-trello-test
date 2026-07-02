---
name: implement-user-story
description: Gates implementation of a Meridian user story — verifies ready true, Plan, deps and architecture refs before product code. Use with /implement-us US-XXXX before coding.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Implement user story (Meridian)

## Selective reading

| File | When to read |
| ------- | ---------- |
| `references/implement-gate-checklist.md` | **Mandatory** — gate before code |
| `.agent/references/templates/code-quality-at-us-time.md` | **Mandatory** — DRY, SRP during coding |
| Target `docs/us/US-XXXX.md` | Full Intent + Plan |
| `depends_on` US files | Dependency status |
| `docs/05_architecture.md` | Sections cited in Architecture refs |
| `docs/architecture/*.md` | When US cites detail files directly |
| `docs/04_principles.md` | DRY, SRP, layer table — mandatory this session |
| `../refine-user-story/references/refine-checklist.md` | When sending user back to refine |

## When to trigger

- Manager asks to implement, build, fix, or refactor for a US.
- Workflow `/implement-us US-XXXX`.
- After `/refine-us` when starting a coding session.

**Do not** use to close a US — use `complete-user-story` / `/complete-us`.

## Hard gate (block product code if any fail)

| Check | Requirement |
| ----------- | --------- |
| Architecture | `05_architecture.md` `approved` |
| US file | `docs/us/US-XXXX.md` exists |
| `ready` | Frontmatter `ready: true` |
| Plan | `## Plan` filled; Approach not placeholder |
| Dependencies | All `depends_on` at `✅` |
| Status | Not `✅` (use `/complete-us` instead); not `🧊` without manager waiver |

If `ready` is not `true` → **stop**; output blocker; recommend `/refine-us US-XXXX`.

Optional: run `validate_meridian.py` — treat `ready is not true` errors as blocking.

## Procedure

1. Read `implement-gate-checklist.md`, `code-quality-at-us-time.md`, target US, `04_principles`, dependency US, architecture sections.
2. Run gate checklist; report pass/fail per row.
3. If **blocked** → no product code; state smallest fix.
4. If **passed** → announce gate passed; read Architecture refs; implement per Acceptance and Planned with **DRY + SRP** (reuse per `04_principles`; one concern per change).
5. One US per session; cite file path in responses.
6. After delivery → manager reviews diff → `/complete-us` (do not self-close without evidence).

## Output

### Gate blocked

```txt
Implement blocked:
US:
Reason:
Checklist failures:
Next: /refine-us US-XXXX | /status | fix depends_on
```

### Gate passed

```txt
Implement gate passed:
US:
Architecture refs read:
DRY / SRP applied:
Acceptance focus:
Planned tests:
Proceeding with implementation (one US session).
After code: manager review → /complete-us US-XXXX
```
