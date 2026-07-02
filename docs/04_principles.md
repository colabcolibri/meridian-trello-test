---
title: Princípios de código
status: approved
version: 1.0
updated: 2026-07-02
depends_on: [00_scope]
blocks: [05_architecture]
---

# Princípios de código

## DRY (don't repeat yourself)

| Tipo de lógica | Onde vive |
| -------------- | --------- |
| Regras de domínio (validação de título, ordem, arquivamento) | `src/domain/` |
| Acesso a SQLite e migrations | `src-tauri/src/db/` + commands Tauri |
| Estado e orquestração de features | `src/features/{boards,columns,cards}/` |
| Componentes visuais reutilizáveis | `src/components/` |
| Constantes (prioridades, limites de string) | `src/domain/constants.ts` |

Uma única função de ordenação por `order` index; uma única camada de persistência — features não executam SQL direto.

## Single responsibility (SRP)

| Camada | Responsabilidade |
| ------ | ---------------- |
| **domain** | Entidades, validações, tipos puros — sem React, sem Tauri |
| **features** | Hooks e serviços que combinam domain + commands |
| **components** | UI presentacional; recebe props/callbacks |
| **app** | Rotas, layout shell, providers globais |
| **src-tauri** | Commands, migrations, path do banco |

Cada US altera preferencialmente uma camada principal; US que misturam schema + UI + DnD devem ser divididas.

## Definition of done (equipe)

- Acceptance da US verificável manualmente ou por teste automatizado indicado no Plan.
- Sem erros de lint/typecheck nos arquivos tocados.
- Persistência reflete a ação do usuário após recarregar o app (quando aplicável).
- Record preenchido no fechamento da US.

## Convenções obrigatórias

- TypeScript strict; sem `any` deliberado.
- Nomes em inglês no código; UI em português do Brasil.
- Migrations SQL: um arquivo por mudança, nome `YYYYMMDDHHMMSS_descricao.sql`.
- Commits e PRs fora do escopo das US individuais — seguir pedido do gestor.
