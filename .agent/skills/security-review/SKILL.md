---
name: security-review
description: Reviews Meridian security posture, including secrets, threat model, AI-agent safety, OWASP, dependencies and Git hygiene. Use for 02_security.md or security hardening.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Security review (Meridian)

> Security before architecture and before agents execute sensitive work.

## Selective reading

| File | When to read |
| ------- | ---------- |
| `references/checklists.md` | During full review or `02_security.md` creation |

## When to trigger

- Create or review `02_security.md`
- Threat model, secrets, OWASP, supply chain request
- Before `05_architecture.md` goes to `approved`
- Suspected agent violation (destructive command, leak)

## Procedure

1. Read `00_scope.md`, `01_tech_stack.md`, `03_user_types.md` (context).
2. Go through **all** sections of `references/checklists.md`.
3. Update `02_security.md` with risks, mitigations, open items, out of scope.
4. Register relevant decisions via `update-decisions-log`.
5. Do not weaken auth/validation/logging without explicit decision.

## Result in `02_security.md`

- Prioritized risks
- Security decisions
- Mitigations and open items
- Impact on architecture, database, API, environments
- AI agent posture for the project

## Output

```txt
Security review:
02_security status:
Critical gaps:
Decisions logged:
Blocked until:
```
