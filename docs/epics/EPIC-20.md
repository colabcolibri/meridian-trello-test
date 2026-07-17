---
id: EPIC-20
title: Demo web Meridian agile local-only
status: active
versions: [v6]
profiles: [Usuário local]
outcome: "Qualquer pessoa testa a UI agile no browser com dados que não saem do dispositivo."
---

# EPIC-20 — Demo web Meridian agile local-only

## Capability

Interessados no Meridian precisam clonar o repo e rodar Tauri para ver o produto agile — barreira alta para demo rápida em talks ou links no README. Este épico adiciona um **adaptador browser** que implementa os commands usados pela UI em TypeScript, persistindo em `localStorage`, e publica o build estático no GitHub Pages ao subir a branch `agile`.

O visitante preenche versões, épicos, sprints e US como no desktop; recarregar a página mantém o estado **neste navegador**; limpar storage ou outro device começa vazio. Nenhum dado trafega para backend.

## Expected outcome

Link Pages no README abre app funcional com banner demo; desktop Tauri continua SoT para uso sério com SQLite.

## Out of scope for this epic

- Backend hospedado ou wasm Rust no browser.
- Feature parity com scripts Meridian no repo.

## Notes

`tauriInvoke` roteia: Tauri → Rust; browser → store local.
