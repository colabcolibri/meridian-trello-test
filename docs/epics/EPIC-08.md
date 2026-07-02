---
id: EPIC-08
title: Correção drag-and-drop entre colunas
status: active
versions: [v2]
profiles: [Usuário local]
outcome: "Arrastar cartão para outra coluna move exatamente um item, com feedback claro e persistência correta."
---

# EPIC-08 — Correção drag-and-drop entre colunas

## Capability

Na v1, a US-0018 marcou DnD como entregue, mas o comportamento real falha quando o usuário arrasta entre colunas: o cartão permanece visualmente na origem e aparece copiado no destino — quebrando o fluxo central do kanban. Esse tipo de regressão destrói confiança na ferramenta mais rápido do que a falta de polish visual, porque o usuário não sabe se os dados estão corretos.

Este épico corrige a implementação `@dnd-kit` para múltiplos containers: `onDragOver` atualiza estado entre colunas durante o gesto, placeholder na origem evita duplicata com `DragOverlay`, zonas droppable por coluna permitem soltar em área vazia, e `onDragEnd` persiste `move_card` + `reorder_cards` com rollback se o invoke falhar.

## Expected outcome

O usuário arrasta um cartão da coluna A para a B e vê um único item na posição correta; após reload a ordem e a coluna permanecem. Cancelar arraste ou falha de rede/db restaura layout anterior. Gestor valida manualmente na janela Tauri.

## Out of scope for this epic

- Redesign visual Trello — EPIC-09.
- DnD de colunas — versão futura.
- Alteração de schema SQLite ou novos commands — reutiliza API de US-0011.

## Notes

Regressão identificada em dogfood pós-v1; referência técnica em `docs/architecture/ui-kanban.md` § Drag and drop.
