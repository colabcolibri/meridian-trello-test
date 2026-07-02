---
id: EPIC-06
title: Drag and drop e layout kanban
status: active
versions: [v1]
profiles: [Usuário local]
outcome: "Usuário arrasta cartões entre colunas e dentro da coluna com fluidez; layout kanban polido e responsivo."
---

# EPIC-06 — Drag and drop e layout kanban

## Capability

Mover cartões por menus funciona, mas kanban exige gesto direto: arrastar tarefa de "A Fazer" para "Concluído" em segundos. A fricção de cliques múltiplos quebra o fluxo que usuários de Trello esperam.

Este épico integra biblioteca DnD (`@dnd-kit` recomendado), persiste ordem e column_id ao soltar, trata optimistic UI com rollback em erro, e polir layout: colunas estáveis, cartões legíveis, scroll horizontal suave, responsividade notebook/desktop sem overflow no body.

## Expected outcome

Usuário arrasta cartão dentro da mesma coluna ou para outra; ordem persiste após reload. Interface parece ferramenta de produção — limpa, sem decoração excessiva. Must US ✅.

## Out of scope for this epic

- DnD de colunas inteiras — opcional; não bloqueia épico.
- Animações elaboradas ou haptics — polish futuro.

## Notes

Depende de EPIC-04 (cartões existentes) e commands `move_card` / `reorder_cards`.
