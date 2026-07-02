---
id: EPIC-09
title: Identidade visual estilo Trello
status: active
versions: [v2]
profiles: [Usuário local]
outcome: "Interface kanban reconhecível como Trello: fundo, colunas, cartões e modais coerentes e profissionais."
---

# EPIC-09 — Identidade visual estilo Trello

## Capability

O MVP v1 priorizou funcionalidade sobre estética: colunas cinza genéricas, header branco sem personalidade, cartões sem hover states refinados e modal utilitário. O perfil Usuário local em `03_user_types.md` explicitamente espera interface intuitiva **estilo Trello** — hoje o produto parece wireframe técnico, não ferramenta de confiança diária.

Este épico introduz design tokens (tipografia, cores de board, sombras, raios), traduz o layout kanban para o padrão Trello (fundo texturizado ou gradiente, colunas semi-transparentes, botão “Adicionar cartão”, labels coloridas nos cards) e alinha lista de quadros e modal de detalhe ao mesmo sistema — sem copiar assets proprietários, mas replicando hierarquia visual e densidade informacional.

## Expected outcome

Gestor ou usuário abre um quadro e reconhece imediatamente paralelo com Trello: board escuro/colorido, colunas legíveis, cartões com sombra e hover, modal limpo com sidebar de metadados. Layout responsivo em notebook (≥1024px) sem overflow horizontal no body.

## Out of scope for this epic

- Ilustrações de capa de board customizáveis por usuário — v3+.
- Atalhos de teclado avançados e power-user features.
- Correção DnD — EPIC-08 (embora US-0024 integre feedback visual de arraste após DnD estável).

## Notes

Referência de UX: Trello web (layout, não marca). Documentar tokens em `docs/architecture/ui-kanban.md` ao refinar US.
