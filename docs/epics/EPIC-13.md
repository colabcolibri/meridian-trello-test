---
id: EPIC-13
title: Quadro kanban agile de user stories
status: complete
versions: [v3]
profiles: [Usuário local]
outcome: "Sprint backlog visível em colunas de workflow; cartões comunicam metadados Meridian; filtros reduzem ruído."
---

# EPIC-13 — Quadro kanban agile de user stories

## Capability

Cerimônias agile precisam de um quadro onde o gestor **veja e mova** user stories ao longo do fluxo — equivalente ao `board.json` derivado no Meridian, mas interativo e SQLite-backed. Colunas representam workflow (ex.: Backlog, Pronta, Em progresso, Revisão, Concluída), não nomes livres de tarefa. Cada cartão deve comunicar de relance: id US-XXXX, título, épico, versão, MoSCoW, badge `ready`, status ❌/🔶/✅ e indicador de dependências bloqueantes.

Drag-and-drop reutiliza a stack corrigida na v2, mas opera sobre entidades `user_stories` e `workflow_column` — não sobre `cards` de tarefa. Filtros por versão, épico e sprint permitem foco em planning e review sem misturar releases.

## Expected outcome

Durante uma sessão de planning simulada, o gestor filtra v3 + EPIC-11, arrasta US de Backlog para Pronta, abre detalhe (EPIC-14), e após reload o board reflete ordem e coluna corretas. Três revisores identificam cartão como "user story de produto", não cartão de tarefa genérico.

## Out of scope for this epic

- Edição inline de Why/Where/Acceptance — EPIC-14 (modal dedicado).
- Geração de `board.json` ou sync com `docs/us/` — app é SQLite-first.
- WIP limits ou swimlanes por perfil — agile avançado para versão futura.
- DnD de colunas inteiras — opcional pós-v3.

## Notes

Mapeamento Scrum ↔ Meridian: colunas ≈ combinação de `status` + `ready` + posição no sprint; ver `scrum-meridian-map.md`.
