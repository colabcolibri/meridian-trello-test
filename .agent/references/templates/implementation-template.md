# Template — Record (fill in on completion)

> **US creation:** placeholders under `## Record`.  
> **Closure (`✅`):** replace with real record of what was delivered.

## Placeholder on creation (status `❌`)

```md
## Record

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
```

## Record on completion (status `✅`)

```md
## Record

### Files

- `src/features/monitor/VersionFilterBar.tsx` — shared filter bar
- `src/context/MonitorVersionFilterContext.tsx` — version state across tabs
- `src/features/monitor/MonitorDashboard.tsx` — provider wiring

### Backend

- _n/a_

### Frontend

- Shared React context across Delivery and Board tabs.
- Selected version persists when switching tabs.
- Default: `active` version; fallback last version with US in folder.

### Scripts / Docs

- _n/a_

### Executed

- `pnpm build` — passed
- manual — filter persists across tabs
- **suggested commit:** `feat(app-desktop): short summary (US-XXXX)`
- **git commit:** `abc1234` — feat(app-desktop): short summary (US-XXXX) _(add after manager commits; omit until then)_
```

## Rules

| Rule | Detail |
| ----- | ------- |
| Paths | Relative to app root or repo; include folder |
| One line per file | What changed in that file |
| Empty layers | `_n/a_` — do not omit heading |
| Plan vs delivery | On completion, remove bullets describing unimplemented intent |
| Global decisions | Register in `docs/decisions/YYYY-MM-DD.json`; local US record stays here |
| Git | US ✅ = docs closed; **commit is human after** `/complete-us` + board sync — see `commit-after-us-close.md`. On close: **suggested commit** in `### Executed`. After commit: optional **git commit** line with SHA + subject; omit until then |

## Anti-patterns (block `✅`)

- `_(fill on close)_` still present
- Only "No functional change" without listing files when there was a change
- Acceptance `[x]` without match in Record or Executed
- Generic list without paths ("monitor components updated")
