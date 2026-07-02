---
title: Ambientes
status: approved
version: 1.0
updated: 2026-07-02
depends_on: [01_tech_stack]
blocks: []
---

# Ambientes

## Desenvolvimento local

| Requisito | Versão mínima |
| --------- | -------------- |
| Node.js | 20 LTS |
| pnpm | 9+ |
| Rust | stable (via rustup) |
| Tauri CLI | via devDependency |

Comandos:

```bash
pnpm install
pnpm tauri dev
```

Banco de dev: mesmo path de app data ou variável `KANBAN_DB_PATH` para override em testes (documentar na US-0001).

## Produção / build local

```bash
pnpm tauri build
```

Artefato: instalador/bundle nativo por SO em `src-tauri/target/release/bundle/`.

## CI (futuro)

Fora do escopo v1; quando existir, rodar `pnpm lint`, `pnpm test`, `pnpm tauri build` em runner com Rust.

## Variáveis de ambiente

Nenhuma obrigatória na v1. Opcional `.env.example` vazio para extensões futuras.
