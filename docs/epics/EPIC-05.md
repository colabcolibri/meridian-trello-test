---
id: EPIC-05
title: Detalhes do cartão e metadados
status: active
versions: [v1]
profiles: [Usuário local]
outcome: "Modal de cartão permite editar descrição, prioridade, etiquetas, checklist, vencimento e observações com indicador de atraso."
---

# EPIC-05 — Detalhes do cartão e metadados

## Capability

Tarefas reais precisam de contexto: descrição, prioridade, etiquetas coloridas, prazo, checklist e notas pessoais. O compacto na coluna resume; o trabalho profundo acontece ao clicar no cartão. Hoje o produto só teria título — insuficiente para substituir Trello local.

Este épico entrega o modal (ou painel) de detalhes com todos os campos editáveis da spec, persistência automática, gestão de tags por quadro, checklist com toggle de concluído, data de vencimento com destaque visual quando vencida, campo de observações sem histórico colaborativo, e exibição de created_at/updated_at.

## Expected outcome

Clicar em um cartão abre visão completa; usuário edita qualquer campo, adiciona etiquetas e itens de checklist, define prazo e vê indicador vermelho se vencido; fecha modal e compacto reflete mudanças. Must US ✅.

## Out of scope for this epic

- Comentários com thread ou menções — fora do escopo v1.
- Anexos de arquivo — versão futura.

## Notes

Tags são por board_id; cores pré-definidas ou seletor simples na v1.
