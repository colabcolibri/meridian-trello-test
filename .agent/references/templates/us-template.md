# Full user story template

> **Writing quality:** read `.agent/references/templates/writing-guide.md` before drafting. Explain the slice; do not paste epic body.

```md
---
id: US-XXXX
title: Short title
epic: EPIC-XX
version: vX
status: ❌
moscow: Must
depends_on: []
ready: false
done_when: "Objective and measurable condition."
tests: required
tests_status: pending
---

# US-XXXX — Short title

**As** [user type from 03_user_types.md],
**I want** [concrete action],
**so that** [benefit the user feels — not internal implementation].

## Intent

### Acceptance

Verifiable checklist only — observable outcomes, not plans.

- [ ] Criterion someone can demo or inspect (file, UI, command output)
- [ ] Second criterion — independent from the first
- [ ] Third when scope warrants it
- [ ] 🔶 Partial — Missing: … (only when status 🔶)

### Why

2–4 sentences: what problem this slice solves, what exists before, what the user can do after **this US alone** (not the whole epic).

### Where

2–4 sentences: position in the release, what `depends_on` delivered, what this unblocks next. Name other US ids when relevant — no need to quote epic files.

## Plan

### Approach _(optional at `/create-us` — **required** at `/refine-us`)_

Bullets allowed — **each bullet is a full thought** (one or two sentences): intent, likely area of the codebase, constraint or non-goal. Not required at create.

### Architecture refs

- `docs/05_architecture.md` — § exact heading (fill on `/refine-us` if unknown at create)
- Optional: `docs/architecture/name.md` — § exact heading when detail lives only in the folder

Read `code-quality-at-us-time.md` at refine — Approach must respect DRY and SRP from `04_principles.md`.

### API / DB impact

- _n/a_ — explain in a short phrase when none | named endpoint/table/migration when applicable

### Security notes

- _n/a_ — explain when none | rule from `02_security.md` when writes/auth/secrets involved

### Related decisions

- _n/a_ | `docs/decisions/YYYY-MM-DD.json` — entry title when relevant

### Planned

- [ ] **manual** — numbered steps + expected result (no “verify acceptance end-to-end” alone)
- [ ] **automated** — exact command + scope when applicable

## Record

> **Creation:** placeholders. **Close (`/complete-us`):** real delivery record — skill `complete-user-story`.

### Files

_(fill on close)_

### Backend

_(fill on close or _n/a_)_

### Frontend

_(fill on close or _n/a_)_

### Scripts / Docs

_(fill on close or _n/a_)_

### Executed

_(pending until close)_

## Boundaries

### Out of scope for this story

What this US explicitly does **not** do — prevents scope creep and SRP violations in implementation.

### Notes

Optional: links, risks, follow-ups — not a dump of epic text.
```

## Section contract

Full rules: `section-contracts.md`. Golden examples: `writing-guide.md`.

| Phase | Writing expectation |
| ----- | ------------------- |
| `/create-us` | Intent (Why + Where) filled with prose; Plan refs may be TBD; Approach empty; `ready: false` |
| `/refine-us` | **Approach required** (2+ bullets); real architecture §; concrete Planned tests; `ready: true` |
| `/complete-us` | Record (Files + layers + Executed); `status: ✅` |

## Allowed statuses (frontmatter)

| Symbol | Meaning |
| ------- | ----------- |
| ❌ | Not started |
| 🔶 | Partial (requires `Missing:` in acceptance) |
| ✅ | Complete (acceptance + record + tests when `tests: required`) |

## Test fields

| Field | Values | Rule |
| ----- | ------- | ----- |
| `tests` | `required` / `none` | Default `required` |
| `tests_status` | `pending` / `done` / `n/a` | `n/a` only with `tests: none`; `done` before `status: ✅` |

## Ready (frontmatter)

| Value | Meaning |
| ----- | ------- |
| `false` | Default on `/create-us` — narrative draft; implement blocked |
| `true` | After `/refine-us` — plan and tests concrete enough to code |

## Closure

After implementation → `complete-user-story` or `/complete-us` — do not mark `✅` on creation.
