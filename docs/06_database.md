---
title: Banco de dados
status: approved
version: 1.0
updated: 2026-07-02
depends_on: [05_architecture]
blocks: []
---

# Banco de dados

## Engine

SQLite 3 — arquivo único no diretório de dados do Tauri (`app_data_dir/kanban.db`).

## Schema

Detalhamento completo em [architecture/data-model.md](architecture/data-model.md).

## Migrations

- Pasta: `src-tauri/migrations/`
- Convenção: `YYYYMMDDHHMMSS_descricao.sql`
- Migration inicial `20260702173000_initial_schema.sql` criada na US-0002.

## Backup

Usuário pode copiar o arquivo `.db` manualmente. Export/import JSON fica fora do escopo v1.

## Índices

Índices em `board_id`, `column_id`, `card_id` para listagens kanban frequentes.
