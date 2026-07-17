---
id: EPIC-15
title: Schema US Meridian v2 no SQLite
status: complete
versions: [v4]
profiles: [Usuário local]
outcome: "User story persiste todos os campos do template Meridian schema v2 — não só subset v3."
---

# EPIC-15 — Schema US Meridian v2 no SQLite

## Capability

A v3 guardou Why, Where, Approach e acceptance, mas omitiu campos que o template `us-template.md` trata como first-class: `tests` / `tests_status`, **Boundaries** (out of scope, notes), snapshot de **Planned**, e separação clara entre `title` e narrativa Intent. Sem isso, a UI continua tratando `title` como nome de tarefa e o backend não distingue story de card genérico. Gestores que conhecem Meridian esperam que o cartão e o export futuro reflitam o mesmo shape do Markdown — incluindo o que vai em frontmatter e seções fixas.

Este épico estende o schema e a API para o contrato v2 completo: colunas ou JSON normalizado para boundaries e planned; enums tests; validação coerente com status 🔶/✅. Nenhuma mudança visual grande ainda — só fundação para EPIC-16 e EPIC-17 consumirem dados corretos na face e no modal.

## Expected outcome

Desenvolvedor inspeciona row `user_stories` + tabelas auxiliares e reconhece paridade com `us-template.md` (Intent, Plan mínimo, Boundaries). `get_story` retorna payload suficiente para renderizar cartão Meridian sem inventar campos no frontend.

## Out of scope for this epic

- Redesign visual do cartão — EPIC-16.
- Modal multi-seção — EPIC-17.
- Remover tabelas boards/cards — EPIC-18.

## Notes

Migration `YYYYMMDDHHMMSS_us_meridian_v2.sql`; convive com schema v3 existente.
