---
description: Review and deepen security documentation before architecture or implementation.
---

# /security-pass — security review

$ARGUMENTS

---

## Critical rules

1. Use `security-steward` + `@[skills/security-review]`
2. Read `references/checklists.md` in full
3. Update `02_security.md`
4. Relevant decisions → `docs/decisions/YYYY-MM-DD.json`
5. Do not silently approve architecture `approved` if critical gaps remain open

---

## Task

```txt
CONTEXT:
- User Request: $ARGUMENTS
- Mode: SECURITY REVIEW

RULES:
1. security-steward Phase 0
2. Full checklist pass
3. Document risks, mitigations, AI-agent rules for project
4. No weakening controls without logged decision
5. Report blockers to process-manager if needed
```

---

## Output

```txt
02_security status:
Critical findings:
Mitigations proposed:
Blocked docs/phases:
Decisions logged:
```

---

## After

```txt
Next: manager approves 02_security → /architecture when stable
```
