---
id: EPIC-19
title: Hierarquia relacional agile e UX de produto
status: active
versions: [v5]
profiles: [Usuário local]
outcome: "Gestor gerencia release agile com relações no SQLite e navegação clara — sem IDs digitados ou listas JSON duplicadas."
---

# EPIC-19 — Hierarquia relacional agile e UX de produto

## Capability

Hoje o gestor abre o hub do projeto e encontra três abas (Versions, Epics, Sprints) com listas editáveis por blur inline, enquanto o wizard de versão exige digitar "EPIC-XX" na seção Included e o épico grava versões em JSON paralelo. Isso duplica a mesma relação em dois sentidos, permite IDs inexistentes e não reflete o modelo mental Meridian (versão contém sprints; épico pertence a versões; US pertence a épico, versão e sprint). A navegação para o quadro depende de dois selects soltos sem contexto de épico.

Este épico introduz a tabela `version_epics`, deriva "Included" da versão a partir dos vínculos reais, mantém "Explicitly out" como texto livre, e substitui o painel plano por drill-down hierárquico com wizards de criação e **edição** completos para versão, épico e sprint. Formulários de US passam a filtrar épico e sprint pela versão e validar coerência antes de persistir.

## Expected outcome

O gestor configura um release sem nunca colar ou digitar um id de épico na versão; ao abrir uma versão vê épicos e sprints ligados; edita qualquer entidade em wizard Meridian; abre o quadro a partir do sprint na árvore; e ao criar US só vê opções válidas para a versão escolhida. O épico fica `complete` quando Must US v5 estão ✅ e ninguém depende de `included_json` ou `version_ids_json` no fluxo de escrita.

## Out of scope for this epic

- Export/import Markdown docs ↔ SQLite — fica para épico futuro de sync.
- Permissões multi-usuário ou auditoria de alterações — app local single-user.
- Redesign visual completo do cartão US (já entregue v4) — só badges de hierarquia se necessário para navegação.

## Notes

Branch git `agile` como linha principal é convenção de equipe; não bloqueia entrega funcional deste épico.
