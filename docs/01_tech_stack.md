---
title: Stack técnica
status: approved
version: 1.0
updated: 2026-07-02
depends_on: [00_scope]
blocks: [05_architecture]
---

# Stack técnica

## Frontend

| Tecnologia | Uso |
| ---------- | --- |
| Vite | Bundler e dev server |
| React 19 | UI declarativa |
| TypeScript | Tipagem estática |
| CSS modules ou Tailwind | Estilos (decisão na US de scaffold) |

## Desktop e persistência

| Tecnologia | Uso |
| ---------- | --- |
| Tauri 2 | Shell desktop multiplataforma (macOS, Windows, Linux) |
| SQLite | Banco local via plugin Tauri SQL ou rusqlite no backend Rust |
| Migrations SQL | Versionamento de schema com timestamp `YYYYMMDDHHMMSS` |

## Alternativa descartada (v1)

Aplicação web local com backend Node.js (Fastify/Express) foi considerada, mas Tauri foi escolhida por empacotar frontend + SQLite em um único binário, simplificar instalação e eliminar servidor separado.

## Ferramentas de desenvolvimento

- pnpm como gerenciador de pacotes (lockfile único).
- ESLint + Prettier para qualidade de código.
- Vitest para testes unitários onde aplicável.

## Build e distribuição

- `pnpm tauri dev` — desenvolvimento.
- `pnpm tauri build` — binário instalável local.
- README na raiz com pré-requisitos (Node, pnpm, Rust toolchain).
