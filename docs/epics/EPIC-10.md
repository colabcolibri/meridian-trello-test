---
id: EPIC-10
title: Navegação e polish UX dos cartões
status: active
versions: [v2]
profiles: [Usuário local]
outcome: "Usuário navega entre workspace e quadro sem loops; cartões mostram metadados e modal é utilizável."
---

# EPIC-10 — Navegação e polish UX dos cartões

## Capability

Dogfood pós-v2-S2 expôs fricções que impedem uso fluido: o link "Back to Boards" redireciona imediatamente ao último quadro porque a lista reutiliza a lógica de auto-resume; cartões na coluna não comunicam tags, prazos e checklist de forma legível; o modal de detalhe ficou visualmente pesado e competia com o gesto de drag no card inteiro.

Este épico corrige navegação workspace vs resume, enriquece o compacto com badges legíveis, refina o modal estilo Trello e separa handle de drag do clique para abrir — sem novas features de produto.

## Expected outcome

Gestor valida: "← Boards" mostra grid de quadros; cartão com label/prazo/checklist exibe badges na face; modal branco limpo abre ao clicar; arraste usa handle lateral.

## Out of scope for this epic

- i18n framework ou segundo idioma dinâmico.
- Anexos, comentários, atividade no cartão.
- Nova versão v3.

## Notes

Continua v2; sprint v2-S3 agrupa US-0027 a US-0030.
