# Decision template

Insert **at the beginning** of `entries` in `docs/decisions/YYYY-MM-DD.json`.
If daily file does not exist, create:

```json
{
  "date": "YYYY-MM-DD",
  "entries": []
}
```

New entry (prepend — first item in array):

**Before writing:** run `date +"%H:%M"` and paste the result into `time`. Must be the actual moment of logging (24h, local timezone). Never use placeholder intervals (:00, :15, :30, :45) unless that is the real clock reading.

```json
{
  "time": "20:58",
  "title": "Objective decision title",
  "affected_document": "path/to/doc.md",
  "what_changed": "factual description of delta",
  "why_changed": "context, constraint or learning that motivated",
  "impact": "list; mark docs that return to review",
  "responsible": "manager or role"
}
```

## When to use

- Scope, stack, security, users, epics, versions, architecture, database, API, environments, acceptance, agent governance.

## Forbidden

- Edit or delete old entries.
- Append at end of `entries` (correct order: **new at beginning**).
- Vague entry ("adjusted scope") without listed impact.

## After decision that changes `approved` doc

1. Prepend in `docs/decisions/YYYY-MM-DD.json`.
2. Change affected doc `status` to `review`.
3. Inform manager which re-approval is needed.
