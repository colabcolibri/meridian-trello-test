# Template sources — where files really live

> Agents should **read** from `.agent/references/templates/` (registry). They should **edit** only the **canonical** path in the third column.

---

## How the mirror works

```txt
CANONICAL (edit here)          REGISTRY (agents read)              HUMAN / CURSOR (read-only mirrors)
.agent/skills/.../references/  →  .agent/references/templates/  →  app-desktop/docs/templates/
                                                              →  .cursor/references/templates/
```

- **Registry** = symlinks + 4 kit-owned files (`INDEX.md`, `writing-guide.md`, `section-contracts.md`, `lifecycle.md`, `TEMPLATE_SOURCES.md`).
- **Never** edit symlinks in `docs/templates/` or `.cursor/` — they point at `.agent/`.
- After adding a new template file, update `INDEX.md`, run `./.agent/scripts/sync_cursor_kit.sh` (syncs `.cursor/` + `app-desktop/docs/templates/`), and `docs/templates/README.md` in target projects.

---

## Delivery artifacts

| Template | Canonical (edit) | Registry | Used by |
| -------- | ---------------- | -------- | ------- |
| `us-template.md` | `.agent/skills/create-user-story/references/us-template.md` | `.agent/references/templates/us-template.md` | `/create-us`, `/refine-us`, `/review-us`, `/implement-us`, `/complete-us` |
| `refine-checklist.md` | `.agent/skills/refine-user-story/references/refine-checklist.md` | `.agent/references/templates/refine-checklist.md` | `/refine-us` |
| `implement-gate-checklist.md` | `.agent/skills/implement-user-story/references/implement-gate-checklist.md` | `.agent/references/templates/implement-gate-checklist.md` | `/implement-us` |
| `review-checklist.md` | `.agent/skills/review-user-story/references/review-checklist.md` | `.agent/references/templates/review-checklist.md` | `/review-us` |
| `implementation-template.md` | `.agent/skills/complete-user-story/references/implementation-template.md` | `.agent/references/templates/implementation-template.md` | `/complete-us` |
| `epic-template.md` | `.agent/skills/create-epic/references/epic-template.md` | `.agent/references/templates/epic-template.md` | `/create-epic` |
| `version-template.md` | `.agent/skills/create-version/references/version-template.md` | `.agent/references/templates/version-template.md` | `/create-version` |
| `sprint-template.md` | `.agent/skills/create-sprint/references/sprint-template.md` | `.agent/references/templates/sprint-template.md` | `/plan-sprint` |
| `board-schema.md` | `.agent/skills/generate-board-json/references/board-schema.md` | `.agent/references/templates/board-schema.md` | `/sync-board` |
| `decision-template.md` | `.agent/skills/update-decisions-log/references/decision-template.md` | `.agent/references/templates/decision-template.md` | `update-decisions-log` |
| `decision-schema.md` | `.agent/skills/update-decisions-log/references/decision-schema.md` | `.agent/references/templates/decision-schema.md` | `update-decisions-log` (validation) |
| `doc-templates.md` | `.agent/skills/init-project/references/doc-templates.md` | `.agent/references/templates/doc-templates.md` | `/init-meridian` |
| `as-is-inventory-template.md` | *(kit-owned — edit in registry)* | `.agent/references/templates/as-is-inventory-template.md` | `/init-meridian` (Mode B) |

---

## Kit-owned (edit in registry folder)

| File | Purpose |
| ---- | ------- |
| `.agent/references/templates/as-is-inventory-template.md` | Mode B as-is map — `docs/inventory/as-is.md` |
| `.agent/references/templates/projects-manifest-template.md` | Multi-product monorepo — `.meridian/projects.json` |
| `.agent/references/templates/INDEX.md` | Registry table artifact → template → agent → workflow |
| `.agent/references/templates/writing-guide.md` | Prose quality — Intent, Plan, epic paragraphs |
| `.agent/references/templates/code-quality-at-us-time.md` | DRY, SRP at create / refine / implement |
| `.agent/references/templates/architecture-folder-guide.md` | `05` index + `docs/architecture/` detail |
| `.agent/references/templates/section-contracts.md` | Fixed headings — validated by Python + monitor |
| `.agent/references/templates/lifecycle.md` | create → review → refine → implement → close |
| `.agent/references/templates/TEMPLATE_SOURCES.md` | This file — canonical paths |

---

## User story — which template when

| Step | Command | Read before acting |
| ---- | ------- | ------------------- |
| Create | `/create-us` | `writing-guide.md` + `code-quality-at-us-time.md` + `us-template.md` |
| Review | `/review-us` | `review-checklist.md` + `writing-guide.md` + `section-contracts.md` + `us-template.md` |
| Refine | `/refine-us` | `refine-checklist.md` + `writing-guide.md` + `code-quality-at-us-time.md` + `us-template.md` + `04_principles.md` |
| Implement | `/implement-us` | `implement-gate-checklist.md` + `code-quality-at-us-time.md` + target US + `04_principles.md` |
| Architecture | `/architecture` | `architecture-folder-guide.md` + phase docs 00–04 |
| Close | `/complete-us` | `implementation-template.md` + `us-template.md` + `section-contracts.md` |

**Review vs refine:** review = audit report, no edits, no `ready`. Refine = edit US + `ready: true`.

---

## Dogfooding copy

In this repo, human-readable mirrors live at `app-desktop/docs/templates/` (symlinks to registry). Open [README.md](../../../app-desktop/docs/templates/README.md) in the monitor **Templates** section.

Regenerate Cursor mirrors after clone:

```bash
./.agent/scripts/sync_cursor_kit.sh
```
