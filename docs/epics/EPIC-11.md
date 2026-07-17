---
id: EPIC-11
title: Persistência agile Meridian no SQLite
status: complete
versions: [v3]
profiles: [Usuário local]
outcome: "Projeto, versão, épico, sprint, US e critérios de aceite persistem no SQLite com commands Tauri tipados."
---

# EPIC-11 — Persistência agile Meridian no SQLite

## Capability

Hoje o app persiste quadros, colunas e cartões de tarefa — modelo adequado para to-do, mas insuficiente para gestão de produto software. Épicos, releases, sprints e user stories com Intent/Plan exigem entidades relacionadas, IDs estáveis (US-XXXX, EPIC-XX), dependências entre stories, status simbólico (❌/🔶/✅), flag `ready` e checklist de aceite versionável. Tentar mapear isso em cartões genéricos gera campos soltos na descrição e impossibilita filtros confiáveis.

Este épico introduz o schema agile no SQLite (migration dedicada), tipos de domínio espelhando o contrato Meridian, e commands Rust para CRUD transacional de projetos, versões, épicos, sprints, user stories e itens de aceite. A UI ainda não muda de forma visível além do que US posteriores consumirem — aqui o foco é fundação de dados e API estável.

## Expected outcome

Desenvolvedor invoca commands via Tauri (ou teste integrado) e consegue criar um projeto com versão v1, épico EPIC-01, sprint v1-S1, US-0001 com três critérios de aceite e `depends_on` para outra US — tudo persistido após restart do app. Gestor reconhece paridade conceitual com `docs/us/*.md` sem depender de arquivos Markdown no runtime do app.

## Out of scope for this epic

- Telas React ou substituição do board Trello — EPIC-12 e EPIC-13.
- Import/export de Markdown Meridian — versão futura.
- Migração automática dos quadros kanban v1 existentes para projetos agile — pode ser US opcional pós-v3; não bloqueia schema.
- Validação completa do protocolo Meridian (validate_meridian.py) dentro do app — fora do escopo; apenas shape de dados compatível.

## Notes

Migration segue convenção `YYYYMMDDHHMMSS` em `src-tauri/migrations/`. Referência de campos: `.agent/references/templates/us-template.md` e `scrum-meridian-map.md`.
