---
id: EPIC-12
title: Workspace e hierarquia de produto
status: complete
versions: [v3]
profiles: [Usuário local]
outcome: "Usuário escolhe projeto, navega versão e sprint, e gerencia releases/épicos/sprints pela UI."
---

# EPIC-12 — Workspace e hierarquia de produto

## Capability

Com a API agile disponível, o usuário ainda precisa de um lugar para **entrar** no trabalho: hoje a primeira tela lista quadros de tarefa, sem conceito de produto ou release. Para gestão agile, o fluxo natural é abrir o app → escolher projeto (ex.: "App Kanban", "Side project X") → ver versões ativas → entrar no sprint corrente ou backlog da versão. Sem essa hierarquia, commands CRUD ficam inacessíveis exceto por invoke manual.

Este épico entrega workspace de projetos (lista, criar, renomear, excluir com confirmação), breadcrumb ou navegação equivalente projeto → versão → sprint, e telas enxutas para CRUD de versões, épicos e sprints — sempre persistindo via commands do EPIC-11. Visual alinhado ao design system v2 (Trello-inspired) para não parecer módulo colado.

## Expected outcome

Gestor abre o app, cria projeto "Meu SaaS", adiciona versão v1 e sprint v1-S1, vê a sprint selecionada como contexto ativo, e consegue voltar ao workspace para trocar de projeto sem perder dados. Épicos e versões listados com status (`planned`/`active`/`complete`) reconhecíveis.

## Out of scope for this epic

- Quadro kanban de US — EPIC-13.
- Editor completo de US — EPIC-14.
- Múltiplos sprints ativos simultâneos na mesma versão — um sprint `active` por versão; demais `planned` ou `complete`.
- Onboarding wizard ou templates de projeto — polish futuro.

## Notes

Reutilizar padrões de navegação corrigidos no EPIC-10 (workspace vs auto-resume) adaptados à hierarquia agile.
