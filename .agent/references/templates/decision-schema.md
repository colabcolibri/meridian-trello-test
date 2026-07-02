# Schema — `docs/decisions/YYYY-MM-DD.json`

## Daily file

```json
{
  "date": "2026-06-02",
  "entries": [
    {
      "time": "17:30",
      "title": "Objective title",
      "affected_document": "path/to/doc.md",
      "what_changed": "factual description",
      "why_changed": "context and motivation",
      "impact": "affected docs; mark review",
      "responsible": "role or person"
    }
  ]
}
```

## Rules

| Field | Required | Format |
| ----- | ----------- | ------- |
| `date` | yes | `YYYY-MM-DD`, same as filename |
| `entries` | yes | array; empty only on day bootstrap |
| `entries[].time` | yes | `HH:MM` (24h) — **real clock** at log time (`date +"%H:%M"`). Not rounded or synthetic. |
| `entries[].title` | yes | non-empty string |
| `entries[].affected_document` | yes | string |
| `entries[].what_changed` | yes | string |
| `entries[].why_changed` | yes | string |
| `entries[].impact` | yes | string |
| `entries[].responsible` | yes | string |

## Order

- **Prepend:** new decision at the **beginning** of `entries` (`entries.unshift(...)`).
- Days sorted by filename (ISO date).

## Validation

```bash
python3 .agent/scripts/validate_meridian.py <project-root>
```

## Related

- Rules stub: `docs/11_decisions.md`
- Skill: `update-decisions-log`
- Protocol: `.agent/MERIDIAN.md` §8 Decision log
