---
id: EPIC-18
title: Produto unificado — agile como único quadro
status: complete
versions: [v4]
profiles: [Usuário local]
outcome: "Usuário não precisa escolher entre kanban de tarefas e agile; projetos US são o produto."
---

# EPIC-18 — Produto unificado — agile como único quadro

## Capability

O app hoje mantém **dois produtos colados**: `/boards` com cards (priority, tags, checklist de tarefa) e `/projects` com user stories. Isso confunde o gestor ("qual quadro uso?") e reforça que US agile é feature secundária. A v3 até linkou entre eles, mas não resolve a identidade do produto.

Este épico torna **projetos agile** o caminho principal e único promovido: redirect de `/` já aponta para projects; `/boards` vira legado acessível só por link explícito "modo tarefas (legado)" ou settings, com banner de depreciação. Documentação in-app e README alinhados. Opcional: ocultar item de menu boards. Dados v1 permanecem no SQLite — sem delete destrutivo — mas UX deixa claro que cartão = US, não tarefa.

## Expected outcome

Novo usuário abre app e só descobre fluxo projeto → sprint → US Meridian. Kanban tarefa existe mas não compete com US no mesmo nível de navegação.

## Out of scope for this epic

- Migrar dados cards → user_stories automaticamente.
- Remover tabelas boards/columns/cards do SQLite.

## Notes

Alinhar `docs/00_scope.md` em US separada ou decisão de log pós-v4.
