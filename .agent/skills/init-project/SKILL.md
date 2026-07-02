---
name: init-project
description: Initializes a project with Meridian docs, decision log, board JSON and minimum governance. Use when starting a new project or repairing a missing Meridian structure. Also handles existing codebases migrating into Meridian.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Init project (Meridian)

> Creates minimum structure in `docs/` for governance before any product code.

## Selective reading

| File | When to read |
| ------- | ---------- |
| `.agent/references/templates/INDEX.md` | Before creating phase docs or pointing manager to templates |
| `.agent/references/templates/as-is-inventory-template.md` | **Mode B only** — before creating `docs/inventory/as-is.md` |
| `references/doc-templates.md` | **Mandatory** before creating phase files and first decision |
| `references/gitignore-baseline.md` | Before `npm install` or first commit |

## When to trigger

- New project with Meridian intent
- `.agent/` exists but `docs/` missing
- Incomplete or corrupted structure
- Agent tried to implement without document base
- **Existing codebase migrating to Meridian** (see Mode B below)

---

## Mode A — New project

### Phase 0 — context check

1. Read `.agent/MERIDIAN.md` if it exists.
2. Confirm target folder and user authorization to create files.
3. If project intent missing → ask the following questions (maximum **5** — do not ask all if context is already clear):
   - What problem does this product solve, and for whom?
   - Who are the primary users (role, context, technical level)?
   - What is explicitly out of scope for this version?
   - What are the main technology constraints or decisions already made?
   - Are there security, compliance, or data sensitivity concerns to document from the start?

### Procedure

1. Check if `docs/` exists.
2. If absent, create tree:

```txt
docs/
  README.md
  00_scope.md … 11_decisions.md
  decisions/
  epics/
  versions/
  sprints/
  us/
  templates/          # symlinks to kit delivery templates (recommended)
  kanban/board.json
```

3. Apply frontmatter from `references/doc-templates.md` on each doc (`status: draft`, except initial decision).
4. `11_decisions.md` (stub) + `docs/decisions/YYYY-MM-DD.json` with entry "Project started with Meridian".
5. `00_scope.md`: populate with answers from Phase 0 questions — do not leave it blank.
6. `board.json`: `[]`
7. Validate `.gitignore` with `references/gitignore-baseline.md`.
8. **Do not** create US, app, API, database or migrations.

---

## Mode B — Existing codebase (migration)

Use when the user already has running code and wants to adopt Meridian governance.

### Phase 0 — code reading

Before asking any questions, read the repository to infer:

1. `package.json`, `pyproject.toml`, `Cargo.toml`, or equivalent — technology stack.
2. Top-level folder structure — what are the main modules/apps?
3. Existing README (if any) — product description, setup, audience.
4. Any existing docs, ADRs, or architecture notes.
5. Open issues or PR titles if accessible — infer current priorities.

### Phase 1 — structured interview

After reading the codebase, ask (only what is still unclear after reading):

- Based on the code, this appears to be [your inference]. Is that accurate?
- Who are the primary users of this product, and what problem does it solve for them?
- What is in scope for the next release, and what are you explicitly deferring?
- Are there security or compliance requirements (auth model, PII, regulated data)?
- Are there architecture decisions already made that should be documented (DB choice, hosting, auth library)?

### Phase 2 — as-is inventory

Read `as-is-inventory-template.md`, then create `docs/inventory/as-is.md`:

1. One table row per **user-facing capability** (not per folder).
2. Evidence = real paths, routes, models, or docs.
3. Confidence = `high` | `medium` | `low` — never `high` without evidence.
4. Epic candidate column for significant blocks (ids only — do not create epics yet).
5. Assumptions section for anything the manager must confirm.

### Phase 3 — generate docs from code

Populate phase docs from inventory + observations (not blank templates):

1. `00_scope.md` — derive from README + inventory + interview answers. Include **current product state** from high-confidence rows.
2. `01_tech_stack.md` — list what was found (languages, frameworks, infra). Mark `status: draft`.
3. `02_security.md` — note what exists (auth libraries, env handling) and what is unknown. Mark gaps explicitly.
4. `03_user_types.md` — derive from code (admin routes, user models, role checks found in code).
5. `04_principles.md` — leave mostly blank with a note: "derived from existing code style; needs human review".
6. `05_architecture.md` — diagram the actual structure found. Mark `status: draft` — **not approved**.
7. Cross-check: every `high` inventory row appears in scope or architecture (or explain why not).

### Phase 4 — structure

Same as Mode A steps 3–8, applied to inferred content. Ensure `docs/inventory/` exists with `as-is.md`.

### Phase 5 — multi-product manifest (when applicable)

If discovery finds **more than one** `docs/` folder named exactly `docs` with Meridian fingerprint:

1. Read `projects-manifest-template.md`.
2. Propose `.meridian/projects.json` at kit root with one entry per product (`docs` path relative to kit root).
3. Do **not** treat `docs-extra` or non-`docs` folder names as products.
4. Use `exclude` only for stray `docs/` folders that must not appear in the picker.
5. Set `default` after manager confirms which product is primary.

---

## Checkpoints (both modes)

| # | Check |
| - | ----------- |
| 1 | `docs/`, `decisions/`, `architecture/`, `epics/`, `versions/`, `us/`, `sprints/`, `board.json`, `11_decisions`, `00_scope` exist |
| 2 | `.env*` protected in `.gitignore` |
| 3 | No product code created |
| 4 | (Mode B) `docs/inventory/as-is.md` exists with capability table |
| 5 | (Mode B) Inferences marked as assumptions — human must review and approve |

## Prohibitions

| Forbidden | Allowed |
| -------- | --------- |
| Mark phase docs as `approved` without human | `draft` + assumptions |
| Create US | Empty `us/` structure |
| Create retroactive US with `✅` for legacy | Inventory + epics `complete` + optional v0 |
| Implement features | Docs + initial decision |
| (Mode B) Replace existing README | Add `docs/README.md` alongside |
| (Mode B) Keep inventory after `05_architecture` approved | Archive or delete after promotion |

## Output

```txt
Meridian initialized:
Mode: new project | existing codebase
Created:
Inventory (Mode B): docs/inventory/as-is.md
Inferred (Mode B):
Assumptions requiring human review:
Pending:
Blocked:
Next human decision:
```
