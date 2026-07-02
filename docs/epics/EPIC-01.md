---
id: EPIC-01
title: Fundação técnica e persistência SQLite
status: active
versions: [v1]
profiles: [Usuário local]
outcome: "Projeto Tauri+Vite+React compila, SQLite inicializado com schema completo e commands expõem CRUD básico testável."
---

# EPIC-01 — Fundação técnica e persistência SQLite

## Capability

Hoje não existe código de produto — apenas o kit Meridian. Antes de qualquer tela kanban, o time precisa de um scaffold confiável que empacote React com Tauri, inicialize o banco SQLite no diretório de dados do app e exponha uma camada de persistência tipada para quadros, colunas, cartões, etiquetas e checklist.

Este épico entrega o monorepo frontend+Rust funcional: migrations versionadas, commands Tauri alinhados a `07_api_contracts.md` e tipos de domínio compartilhados. Após ele, features de UI podem invocar operações reais sem mock — e recarregar o app mantém dados gravados.

## Expected outcome

Desenvolvedor roda `pnpm tauri dev`, app abre janela vazia ou shell mínimo, e commands como `list_boards` / `create_board` funcionam contra SQLite real. Schema cobre todas as entidades do escopo. Épico completo quando US de scaffold, migration e camada de dados estiverem ✅.

## Out of scope for this epic

- Layout kanban e componentes visuais — EPIC-02 em diante.
- Drag and drop — EPIC-06.
- README de entrega final — EPIC-07 (README mínimo de dev pode aparecer na US-0001).

## Notes

Decisão Tauri registrada em `docs/decisions/2026-07-02.json`.
