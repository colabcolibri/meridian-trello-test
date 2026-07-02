---
id: EPIC-02
title: Quadros e navegação do workspace
status: active
versions: [v1]
profiles: [Usuário local]
outcome: "Usuário abre o app no workspace, gerencia quadros e retoma o último quadro usado."
---

# EPIC-02 — Quadros e navegação do workspace

## Capability

Sem este épico, o usuário não teria onde agrupar colunas — quadros representam projetos ou fluxos distintos. Hoje, após a fundação técnica, falta a primeira experiência real: abrir o app e ver imediatamente seus quadros ou continuar de onde parou, sem landing page ou fluxo de login.

O épico implementa a shell de navegação: lista de quadros, criação com nome editável, seleção, exclusão com confirmação e preferência `last_board_id` persistida. Ao terminar, o usuário sente que o app é uma ferramenta de trabalho — abre e organiza projetos locais.

## Expected outcome

Ao iniciar o app, o usuário vê lista de quadros ou é levado ao último quadro aberto. Consegue criar "Projeto Alpha", renomear, excluir e alternar entre quadros; preferência sobrevive reinício. Must US deste épico ✅.

## Out of scope for this epic

- Colunas e cartões dentro do quadro — EPIC-03 e EPIC-04.
- Colunas padrão na criação — pode ser US dentro de EPIC-03 se não couber aqui.

## Notes

Primeira tela do produto definida em `05_architecture.md` e `ui-kanban.md`.
