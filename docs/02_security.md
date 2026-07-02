---
title: Segurança
status: approved
version: 1.0
updated: 2026-07-02
depends_on: [00_scope]
blocks: [05_architecture]
---

# Segurança — app local single-user

## Modelo de ameaça

Aplicação offline, sem rede, sem autenticação. O principal risco é acesso físico ao computador e corrupção/perda do arquivo SQLite.

## Autenticação e autorização

- _n/a_ — sem usuários, sessões ou permissões.

## Dados sensíveis

- Dados ficam no disco local do usuário (diretório de dados do Tauri).
- Não coletar telemetria nem enviar dados para serviços externos na v1.
- `.env` e credenciais não aplicáveis; manter `.gitignore` protegendo secrets caso surjam integrações futuras.

## Entrada do usuário

- Sanitizar HTML em descrições e observações se renderizadas como rich text; v1 usa texto plano.
- Validar tamanho máximo de strings no domínio antes de persistir (título obrigatório, demais opcionais).

## SQLite

- Usar prepared statements / ORM tipado — nunca concatenar SQL com input do usuário.
- Backup/export manual fica fora do escopo v1; documentar localização do arquivo `.db` no README.

## Dependências

- Revisar CVEs em dependências npm e crates Rust antes de release.
- Lockfiles commitados (pnpm-lock.yaml, Cargo.lock).

## Checklist v1

- [ ] Nenhuma porta de rede aberta em produção.
- [ ] Caminho do banco restrito ao app data dir do Tauri.
- [ ] Sem secrets no repositório.
