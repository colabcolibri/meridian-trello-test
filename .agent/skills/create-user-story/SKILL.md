---
name: create-user-story
description: Creates a valid Meridian user story after epics and versions are approved. Use when adding work to docs/us and keeping acceptance criteria concrete.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Create user story (Meridian)

## Selective reading

| File | When to read |
| ------- | ---------- |
| `.agent/references/templates/writing-guide.md` | **Mandatory** — how to write explanatory US prose |
| `.agent/references/templates/code-quality-at-us-time.md` | **Mandatory** — DRY, SRP, link to `04_principles` |
| `.agent/references/templates/INDEX.md` | Agent protocol |
| `references/us-template.md` | **Mandatory** — full structure before Write |

## Preconditions (hard gate)

| Doc | Required status |
| --- | -------------- |
| `05_architecture.md` | `approved` |
| epic/version in folders | exist |
| Referenced epic | `docs/epics/EPIC-XX.md` exists |
| Referenced version | `docs/versions/vX.md` exists |
| Profile in `03_user_types.md` | exists |

Frontmatter links `epic:` — **do not paste epic text** into the body. Explain **this slice** in Why / Where / Approach.

## Phase 0 — clarify before writing

If the request is vague, ask (then write):

1. Who is the user (`03_user_types.md`)?
2. What **single slice** does this US deliver — not the whole epic?
3. What exists today vs after **this US only**?
4. What does `depends_on` provide; what does this unblock?
5. How will we know it is done (`done_when` + acceptance)?

Read linked epic and dependency US **for understanding** — write in your own words.

## Writing rules (mandatory)

| Section | Rule |
| ------- | ---- |
| **Why** | 2–4 sentences: problem, before/after for this slice |
| **Where** | 2–4 sentences: version, deps, next US — cite ids, not epic body |
| **Approach** | optional at create; add on refine if bullets help |
| **Acceptance** | 2–4 observable checklist items — not a copy of Approach |
| **Architecture refs** | May use `§ TBD` at create; `/refine-us` fills exact heading |
| **Out of scope** | Prevents SRP violations — what this slice does **not** touch |
| **Code quality** | Read `code-quality-at-us-time.md`; one slice = one concern |

Forbidden: telegraphic stubs, repeating acceptance under Approach, “see EPIC-XX” without explanation.

## Procedure

1. Read `writing-guide.md` + `code-quality-at-us-time.md` + full `us-template.md`.
2. Read epic, version, dependency US files for context.
3. Next ID = highest `US-XXXX` + 1 (4 digits).
4. Write full US — especially Why / Where / Approach with explanatory prose.
5. Set `ready: false` — implement blocked until `/refine-us`.
6. Save `docs/us/US-XXXX.md`.
7. `generate-board-json`; `update-decisions-log` if acceptance model changes.

## Validations before saving

- Every `##` / `###` from template present
- Why + Where + Approach filled with real sentences (not placeholders)
- `ready: false`
- `done_when` measurable

## Output

```txt
US created:
File:
Epic:
Version:
Depends on:
Narrative complete: yes | needs refine
Board updated:
Open questions:
Next: /refine-us US-XXXX
```
