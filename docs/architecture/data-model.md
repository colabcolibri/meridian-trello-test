# Modelo de dados — SQLite

Fonte de verdade runtime do app: **projetos agile** com user stories Meridian (schema v2). Kanban de tarefas v1 foi removido na migration `20260702193736_drop_kanban_v1.sql`.

## Preferências

```sql
CREATE TABLE app_preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- last_project_id, last_sprint_id:{project_id}
```

## Modelo agile

Migration base `20260702191744_agile_schema.sql`. Hierarquia: `projects` → `versions` / `epics` / `sprints` → `user_stories`.

| Tabela | Papel |
| ------ | ----- |
| `projects` | Produto/workspace agile |
| `versions` | Release (`v1`, `v2`…) |
| `epics` | Capability (`EPIC-01`…) |
| `sprints` | Timebox (`v1-S1`…) |
| `workflow_columns` | Colunas do quadro (Backlog → Concluída) |
| `user_stories` | US (`US-0001`…) com Intent/Plan/Boundaries |
| `acceptance_criteria` | Checklist de aceite |
| `story_dependencies` | `depends_on` entre US |

IDs legíveis são únicos por `project_id` (chaves compostas). Coluna `maps_status` em `workflow_columns` atualiza status da US ao mover (ex.: Concluída → ✅).

## US Meridian v2 (v4)

Migration `20260702193000_us_meridian_v2.sql` estende `user_stories`:

| Coluna | Tipo | Papel |
| ------ | ---- | ----- |
| `tests` | TEXT NOT NULL DEFAULT `required` | Política de testes na US |
| `tests_status` | TEXT NOT NULL DEFAULT `pending` | Estado dos testes |
| `out_of_scope` | TEXT | Boundaries — fora de escopo |
| `boundary_notes` | TEXT | Boundaries — notas |
| `architecture_refs` | TEXT | Plan — referências de arquitetura |
| `planned_json` | TEXT | Plan — checklist Planned (JSON array) |
| `record_json` | TEXT | Record — evidência de fechamento (read-only na UI) |

Workflow seed (6 colunas): Backlog → Refine → Pronta → Em progresso → Revisão → Concluída.

`StorySummary` (API `list_stories`) inclui preamble, Why, done_when, preview de acceptance (até 3 itens), `workflow_column_name` e contagens para o cartão `UsCardMeridian`.

## Ordenação

Reordenar stories no quadro recalcula `order_index` em transação única.

## Migrations

Pasta `src-tauri/migrations/` — prefixo `YYYYMMDDHHMMSS`.

- `20260702173000_initial_schema.sql` — bootstrap (`app_preferences`; tabelas v1 removidas depois)
- `20260702191744_agile_schema.sql` — gestão agile v3
- `20260702193000_us_meridian_v2.sql` — campos schema v2 + coluna Refine
- `20260702193736_drop_kanban_v1.sql` — remove boards/columns/cards/tags/checklist
