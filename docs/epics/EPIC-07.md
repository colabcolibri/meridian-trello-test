---
id: EPIC-07
title: Entrega, build e documentação
status: active
versions: [v1]
profiles: [Usuário local]
outcome: "README permite instalar dependências, rodar dev e gerar build local utilizável."
---

# EPIC-07 — Entrega, build e documentação

## Capability

Código sem instruções deixa o produto inutilizável fora da máquina do autor. Tauri exige Node, pnpm e Rust — usuários e revisores precisam de um caminho claro desde clone até binário instalável.

Este épico consolida README na raiz, scripts npm documentados (`dev`, `build`, `lint`, `test`), notas sobre localização do SQLite, pré-requisitos por SO e verificação manual do fluxo feliz descrito no escopo. Objetivo: qualquer dev segue o doc e obtém app funcional.

## Expected outcome

README testado: clone → install → tauri dev → criar quadro/coluna/cartão → tauri build produz artefato. Gestor marca EPIC-07 complete quando US de documentação ✅ e go-live checklist de v1 parcialmente atendido na doc.

## Out of scope for this epic

- CI/CD pipeline — v2.
- Publicação em app stores — out of scope v1.

## Notes

Pode ser executado em paralelo ao final dos outros épicos; US depende de app minimamente funcional.
