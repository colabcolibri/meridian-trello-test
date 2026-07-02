# Kanban local

Aplicativo desktop local de gestão de atividades inspirado no Trello — simples, sem login, sem colaboração em tempo real e com dados persistidos em SQLite no computador do usuário.

## Documentos de fase

| Doc | Status | Descrição |
| --- | ------ | --------- |
| [00_scope](00_scope.md) | approved | Escopo do produto |
| [01_tech_stack](01_tech_stack.md) | approved | Stack técnica |
| [02_security](02_security.md) | approved | Segurança local |
| [03_user_types](03_user_types.md) | approved | Perfis de usuário |
| [04_principles](04_principles.md) | approved | Princípios de código |
| [05_architecture](05_architecture.md) | approved | Arquitetura e gate |
| [11_decisions](11_decisions.md) | draft | Regras do log de decisões |

## Como trabalhar

1. Aprove docs na ordem de dependência: foundation → principles → architecture → detail.
2. Construa o backlog em `docs/epics/`, `docs/versions/` e `docs/sprints/`.
3. Crie US somente após `05_architecture` aprovado e epic/version existentes.
4. Regenere o board após mudanças em US: `/sync-board`.
5. Antes de implementar: `/refine-us US-XXXX` → `/implement-us US-XXXX`.

## Backlog atual

- Versão: [v1](versions/v1.md)
- Épicos: EPIC-01 … EPIC-07 em `docs/epics/`
- Sprint ativo: nenhum (v1-S1 planejado)
