---
id: EPIC-04
title: Cartões — núcleo e visual compacto
status: active
versions: [v1]
profiles: [Usuário local]
outcome: "Usuário cria cartões com título, vê resumo compacto na coluna e executa mover, reordenar, duplicar, arquivar e excluir."
---

# EPIC-04 — Cartões — núcleo e visual compacto

## Capability

Colunas vazias não entregam valor — cartões são as tarefas. O usuário precisa adicionar rapidamente um item com título obrigatório, enxergar o essencial na coluna (etiquetas, prioridade, prazo, progresso de checklist quando existirem) e reorganizar trabalho entre estágios antes mesmo do drag and drop completo.

Este épico cobre CRUD essencial do cartão na visão de coluna: criar, editar título inline ou via ação rápida, mover entre colunas por menu/controles, reordenar dentro da coluna, duplicar, arquivar e excluir. Visual compacto segue spec — sem abrir modal para tarefas simples.

## Expected outcome

Usuário adiciona cartões em qualquer coluna, vê chips de metadados no card compacto quando preenchidos (detalhes completos vêm no EPIC-05), move cartões entre colunas com persistência, e arquiva ou duplica sem perder dados. Must US ✅.

## Out of scope for this epic

- Modal com todos os campos editáveis — EPIC-05.
- Drag and drop — EPIC-06 (mover via UI alternativa aqui).

## Notes

Card compacto deve degradar graciosamente quando tags/checklist ainda não existem.
