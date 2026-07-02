---
description: Daily workflow for managers using AI agents with Meridian — orient, implement, close US.
---

# /daily-with-ai — daily AI workflow

$ARGUMENTS

---

## Critical rules

1. Human manager approves; agents execute within `docs/`.
2. One US per implementation cycle when possible.
3. Code only with minimum docs: `05_architecture` approved; epic/version in folders; US with `ready: true`.
4. **Refine before implement** — `/refine-us` after `/create-us`; never skip to code with `ready: false`.
5. **Implement only via gate** — `/implement-us US-XXXX` after `ready: true`; agent blocks otherwise.
5. Always close with `complete-user-story` or `/complete-us` — never ✅ in chat only.
6. `board.json` is derived — use `/sync-board` after changing US.
7. **Commit after close** — human step after `/complete-us` + `/sync-board`; one commit per US. See `commit-after-us-close.md`. Agents suggest message only unless you explicitly ask them to commit.

---

## Who it is for

People who have already read **Start here** and **Usage guide** in the app (four phases: document → backlog → refine → execute).

---

## Daily loop

### 1. Orient

```txt
Agent: process-manager
Skill: meridian-routing (optional)
Command: /status
App: Settings tab + **Decisions** (log) + Board
```

- Identify blockers (draft docs, US deps).
- Choose next unblocked Must US.

### 2. Contextualize

```txt
Cite: US-XXXX or docs/us/US-XXXX.md
Prompt: "Implement US-XXXX per acceptance. Do not mark ✅ without evidence."
```

- Always cite US ID.
- **Block** if `ready` is not `true` → run `/refine-us US-XXXX` first.
- For phase docs: cite file (`05_architecture.md`) + appropriate agent.

### 2b. Refine (if needed)

```txt
Agent: board-keeper
Skill: refine-user-story
Command: /refine-us US-XXXX
```

- After `/create-us` or when Plan is still placeholder.
- Deepens **Approach**, exact architecture §, Plan/Planned.
- Sets `ready: true` only when refine checklist passes.

### 3. Implement

```txt
Agent: process-manager
Skill: implement-user-story
Command: /implement-us US-XXXX
```

- Gate runs first — blocks if `ready` is not `true`.
- Agent reads US, architecture, dependencies before coding.
- Manager reviews diff.
- Partial → `🔶` + `Missing:` in US acceptance.

### 4. Close

```txt
Agent: board-keeper
Skill: complete-user-story
Command: /complete-us US-XXXX
Then: /sync-board
```

- Fill `## Record` (Files + layers + Executed).
- Intent/Acceptance `[x]`, status `✅`, tests documented.
- Cross-cutting decision → `/update-decisions-log` (read skill + run `date +"%Y-%m-%d"` and `date +"%H:%M"` before Write).

### 5. Commit (human)

```txt
After: /complete-us + /sync-board for US-XXXX
Reference: .agent/references/commit-after-us-close.md
```

- Review diff vs `## Record` / `### Files` — one US per commit.
- Use **suggested commit** from `### Executed` if present, or `type(scope): summary (US-XXXX)`.
- Run pre-commit (lint-staged); fix failures before committing.
- Agent commits **only** if you explicitly request it in this step.

### 6. Review

- App: Board tab — US in correct column?
- Record consistent with what was tested?
- Optional later: monitor US-0071 — last commit touching `docs/us/`

---

## Day-to-day commands

| Command | Use |
| ------- | --- |
| `/status` | Session start |
| `/create-us` | New task (gates OK) |
| `/refine-us` | Deepen Plan; set `ready: true` before code |
| `/implement-us` | Gate + implement — requires `ready: true` |
| `/complete-us` | Close US after implementation |
| `/complete-sprint` | Close sprint — retrospective + status complete |
| `/sync-board` | Regenerate kanban JSON |
| `/update-decisions-log` | Prepend decision entry (real date + clock) |
| `/plan-sprint` | Work slice in version |
| `/create-epic` | New product capability |
| `/architecture` | Doc 05 before structural change |
| `/security-pass` | Doc 02 before sensitive feature |

---

## Anti-patterns

- Code without US, `ready: false`, or skipping `/implement-us` gate.
- ✅ in chat without updating `docs/us/US-XXXX.md`.
- Editing `board.json` by hand.
- Single conversation mixing many features.
- `approved` on phase doc without human review.
- ✅ in US with uncommitted git changes left indefinitely.
- Agent auto-commit on `/complete-us` without explicit manager request.

---

## Expected output

```txt
Session:
US worked:
Final status:
Board updated: yes | no
Commit: done | pending (human)
Suggested commit: (from Record if any)
Remaining blockers:
Suggested next US:
```

---

## References

| Resource | Path |
| ------- | ------- |
| Master protocol | `.agent/MERIDIAN.md` |
| Close US | `.agent/workflows/complete-us.md` |
| App — guides | **Start here** and **Usage guide** tabs / `meridian-concepts.ts` |
| Human guides | `.agent/references/start-here.md` · `.agent/references/usage-guide.md` · `.agent/references/agents-help.md` (cheat sheet: Daily loop section) |
| Scrum map | `.agent/references/scrum-meridian-map.md` (agents; not scrum-guide-complete unless manager asks) |
