# Architecture folder — `docs/architecture/`

Use with `/architecture` and agent `architecture-guardian`. Read before creating or splitting architecture detail files.

---

## Roles

| Path | Role |
| ---- | ---- |
| `docs/05_architecture.md` | Phase doc + **gate** (`status: approved` unlocks backlog). Overview, context diagram, cross-cutting rules, **index** of detail files. |
| `docs/architecture/*.md` | Deep dives when one file is too large or domains are distinct. |

One approved `05_architecture.md` is enough for the validator. Detail files do not need their own `approved` status — they are in scope when listed in the `05` index at approval time.

---

## When to split into `architecture/`

- A section would exceed ~40 lines or is a distinct domain (extension vs monitor vs sidecar vs database).
- Parallel edits would constantly conflict in one file.
- A US needs stable citations to a module spec that changes often.

Keep short cross-cutting content (layers table, gate rules, repo layout summary) in `05_architecture.md`.

---

## Required index in `05_architecture.md`

When any detail file exists, add:

```markdown
## Architecture detail files

| File | Scope |
| ---- | ----- |
| `architecture/desktop-monitor.md` | Vite app, loading, HTTP path |
| `architecture/vscode-extension.md` | Webviews, sync board, activation |
```

Each detail file should have frontmatter (`title`, `updated`) and link back to the relevant § in `05`.

---

## Workflow

1. `/architecture` — draft or review `05` and/or create `architecture/*.md`.
2. Cross-check `02_security`; load `security-review` when auth, data, or agent boundaries change.
3. Material change when `05` is `approved` → bump `05` version, set `review`, run `/update-decisions-log` (`date` before Write).

---

## US architecture refs

| Style | When |
| ----- | ---- |
| `docs/05_architecture.md — § exact heading` | Default — heading may summarize and link to detail |
| `docs/architecture/name.md — § exact heading` | At `/refine-us` when detail lives only in the folder |

Implement gate: every ref in the US must resolve before product code.
