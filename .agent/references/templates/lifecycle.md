# Meridian artifact lifecycle

Each phase uses a **fixed template**. Agents must not skip phases or merge them in one conversation without explicit manager approval.

```txt
Existing codebase only (Mode B):
  Codebase → as-is-inventory-template.md → docs/inventory/as-is.md
  ↓ human review + promote rows
  ↓ archive inventory after 05 approved

Phase docs (doc-templates.md; optional docs/architecture/ indexed from 05)
  ↓ 05_architecture approved
Epic (epic-template.md)
  ↓
Version (version-template.md)
  ↓
Sprint (sprint-template.md) — optional but recommended
  ↓
User story create (us-template.md + writing-guide.md + code-quality-at-us-time.md) — status ❌, ready: false, Intent filled
  ↓
/review-us (review-checklist.md) — optional audit; report only; never sets ready
  ↓
/refine-us (refine-checklist.md + code-quality-at-us-time.md + 04_principles) — deepen Plan; DRY/SRP; ready: true
  ↓
/implement-us (implement-gate-checklist.md + code-quality-at-us-time.md) — gate then code; DRY/SRP; requires ready true
  ↓
User story close (implementation-template.md) — Record + status ✅
  ↓
Board sync (board-schema.md)
  ↓
Commit (human) — one commit per closed US; see commit-after-us-close.md
  ↓
Sprint close (sprint-template.md Retrospective) — /complete-sprint when increment delivered
```

Scrum mapping (bugs, spikes, ceremonies, no story points): `.agent/references/scrum-meridian-map.md`.

---

## User story — templates by moment

| Moment | Template | What changes |
| ------ | -------- | ------------ |
| **Create** (`/create-us`) | `us-template.md` + `writing-guide.md` + `code-quality-at-us-time.md` | Intent (Why/Where) + Plan draft; one slice (SRP); `ready: false` |
| **Review** (`/review-us`) | `review-checklist.md` + `section-contracts.md` | Gap report; **no edits**, **no `ready`** |
| **Refine** (`/refine-us`) | `refine-checklist.md` + `code-quality-at-us-time.md` + `04_principles.md` | Plan concrete; DRY/SRP in Approach; `ready: true` |
| **Implement** (`/implement-us`) | `implement-gate-checklist.md` + `code-quality-at-us-time.md` + `04_principles.md` | Gate pass; product code with DRY/SRP |
| **Close** (`/complete-us`) | `implementation-template.md` | `## Record` filled; `status: ✅` |

## Sprint — close

| Moment | Workflow / skill | What changes |
| ------ | ---------------- | ------------ |
| **Close** (`/complete-sprint`) | `sprint-template.md` + `complete-sprint` | `## Retrospective` filled; `status: complete` |

Epic and version **close** remain manual (`status: complete` in frontmatter when outcome reached) — no separate refine workflow.

Between create and close, the US file is the **contract for implementation**. Structure is enforced by `section-contracts.md` (Python + monitor). If Plan or Planned tests are still generic placeholders, the agent must **not** implement — run `/refine-us` first.

---

## Epic vs user story

| Layer | Template | Contains |
| ----- | -------- | -------- |
| Epic | `epic-template.md` | Product capability, outcome, boundaries |
| US | `us-template.md` | Executable slice — Intent, Plan, Record, Boundaries |

US references epic by `epic: EPIC-XX` only — do not paste epic body. Explain the slice in Intent (Why / Where).
