---
title: Escopo
status: approved
version: 1.0
updated: 2026-07-02
depends_on: []
blocks: [01_tech_stack, 03_user_types]
---

# Escopo — Kanban local

## Problema

Profissionais e pessoas organizadas precisam de um quadro kanban para tarefas do dia a dia, mas ferramentas como Trello exigem conta, internet e sincronização na nuvem. Para uso individual no próprio computador, falta uma opção minimalista, rápida e estável que abra direto no ambiente de trabalho.

## Usuários

Usuário individual que usa o computador pessoal ou corporativo para organizar projetos, áreas de trabalho ou fluxos pessoais — sem necessidade de compartilhar quadros ou colaborar em tempo real.

## In scope (v1)

- Aplicativo local desktop com dados em SQLite.
- Quadros (projetos/áreas), colunas editáveis e cartões de tarefa.
- CRUD completo de quadros, colunas e cartões.
- Drag and drop para mover e ordenar cartões.
- Cartões com título, descrição, prioridade, etiquetas, vencimento, checklist, observações, arquivamento e datas de criação/atualização.
- Visual compacto na coluna e modal de detalhes ao clicar.
- Primeira tela = workspace (lista de quadros ou último quadro usado).
- Interface limpa, colunas lado a lado com rolagem horizontal, responsiva para notebook/desktop.
- Instruções de instalação, desenvolvimento e build local.

## Out of scope (v1)

- Autenticação, usuários, permissões e multi-tenant.
- Colaboração em tempo real ou sincronização online.
- Landing page ou marketing site.
- Histórico colaborativo de comentários.
- Integrações externas (calendário, e-mail, webhooks).
- Mobile nativo (apenas layout responsivo em desktop/notebook).
- Temas avançados, plugins ou marketplace.

## Assumptions

- Um único usuário por instalação; banco SQLite local no perfil do app.
- Stack: Vite + React + TypeScript no frontend; Tauri no desktop com SQLite embutido.
- Nomes de colunas padrão sugeridos na criação do quadro, mas totalmente editáveis.
- Status do cartão é inferido pela coluna onde está — sem campo de status separado.

## Constraints

- Deve funcionar offline após instalado.
- Instalação e execução devem ser simples para desenvolvedor e usuário final.
- Persistência automática — sem botão "salvar" explícito para operações normais.

## Known risks

- Complexidade do drag and drop com persistência de ordem pode atrasar entrega se não for isolada em US dedicada.
- Tauri exige toolchain Rust no ambiente de desenvolvimento — documentar claramente no README.

## Open questions

- Nenhuma bloqueante para v1; refinamento de animações e atalhos de teclado fica para versões futuras.
