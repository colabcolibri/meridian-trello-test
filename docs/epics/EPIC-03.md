---
id: EPIC-03
title: Colunas kanban
status: active
versions: [v1]
profiles: [Usuário local]
outcome: "Dentro de um quadro, usuário cria, renomeia, reordena e exclui colunas lado a lado com scroll horizontal."
---

# EPIC-03 — Colunas kanban

## Capability

Um quadro vazio não organiza trabalho. Usuários de kanban esperam colunas como "A Fazer", "Em andamento" ou rótulos personalizados — totalmente editáveis, na ordem que fizer sentido. Sem colunas, cartões não têm lugar nem status implícito.

Este épico renderiza o layout horizontal de colunas, permite CRUD completo e reordenação (botões ou drag futuro de colunas — opcional v1). Nomes são inline-editáveis. Scroll horizontal aparece quando há muitas colunas. Status do cartão será inferido pela coluna onde estiver.

## Expected outcome

Dentro de um quadro selecionado, o usuário vê colunas em faixa horizontal, cria novas, renomeia existentes, reordena e remove colunas vazias ou com confirmação se contiver cartões. Layout responsivo em notebook/desktop conforme `ui-kanban.md`.

## Out of scope for this epic

- Cartões dentro das colunas — EPIC-04.
- Drag and drop de colunas — nice-to-have; reordenação por controles explícitos basta na v1 se DnD atrasar.

## Notes

Sugestão de colunas padrão na criação do primeiro quadro pode ser implementada na US de create board ou create column.
