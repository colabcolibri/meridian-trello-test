# Schema `docs/kanban/board.json`

Array sorted by ascending `id` (`US-0001`, `US-0002`, ...).

```json
[
  {
    "id": "US-0001",
    "title": "Short title",
    "epic": "EPIC-01",
    "version": "v1",
    "status": "❌",
    "moscow": "Must",
    "depends_on": [],
    "done_when": "Objective condition.",
    "tests": "required",
    "tests_status": "pending"
  }
]
```

## Required fields

| Field | Source |
| ----- | ----- |
| All | YAML frontmatter of `docs/us/US-XXXX.md` |

## Validations

- Unique ID, format `US-XXXX` (4 digits)
- Epic exists in `docs/epics/EPIC-XX.md`
- Version exists in `docs/versions/vX.md`
- Each `depends_on` references existing US
- `done_when` not empty
- If `status` is `🔶`, acceptance contains `Missing:`
- `tests`: `required` or `none`
- `tests_status`: `pending`, `done` or `n/a` (`n/a` only with `tests: none`)
- `ready`: `true` or `false` (`false` on `/create-us`; `true` after `/refine-us`; required before implement)
- `status: ✅` with `tests: required` requires `tests_status: done`

## Common divergences

| Problem | Action |
| -------- | ---- |
| US on disk, absent from board | Regenerate |
| Board entry without file | Remove entry |
| Invalid epic/version | Block export; report |
| Outdated `tests` / `tests_status` | Regenerate board |
