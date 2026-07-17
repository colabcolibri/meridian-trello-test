---
id: EPIC-16
title: Face do cartão US Meridian
status: complete
versions: [v4]
profiles: [Usuário local]
outcome: "Compacto no quadro comunica user story Meridian — não cartão de tarefa Trello."
---

# EPIC-16 — Face do cartão US Meridian

## Capability

Hoje `StoryCompact` reutiliza classe `trello-card` e mostra essencialmente **título + badges** — o mesmo padrão mental de `CardCompact` (tarefa com labels). Quem faz scan do board não lê As/I want/so that, não vê Why, não percebe done_when nem primeiros critérios de aceite. Isso contradiz o objetivo de gestão agile: a US é o artefato, não um sticky note.

Este épico substitui o compacto por **`UsCardMeridian`**: layout dedicado (`us-card` CSS), hierarquia tipográfica Intent-first, preview de acceptance (até N itens + contador), indicadores blocked/depends, sem priority/due_date/tags de tarefa. Drag handle preservado da v2/v3. O cartão deve ser reconhecível como US Meridian **sem abrir o modal**.

## Expected outcome

Três revisores olham o board por 10s e descrevem "user stories de produto", não "lista de tarefas". Nenhum cartão agile usa componente `CardCompact` ou estilos de label colorida de prazo.

## Out of scope for this epic

- Modal completo schema v2 — EPIC-17.
- Form de criação rico — EPIC-17 / US-0051.
- Redirect /boards — EPIC-18.

## Notes

Referência visual: frontmatter + primeiras linhas de `docs/us/US-0032.md`, não `CardDetailModal` de tarefa.
