---
id: EPIC-17
title: Modal e criação schema v2 Meridian
status: complete
versions: [v4]
profiles: [Usuário local]
outcome: "Criar e editar US segue ordem Intent → Plan → Boundaries; Record read-only."
---

# EPIC-17 — Modal e criação schema v2 Meridian

## Capability

O modal v3 agrupa campos mas ainda parece formulário de tarefa expandido: seções Plan/Boundaries/Record não seguem ordem e contrato do template; criar US no board pede só **título** — equivalente a card title no Trello, não `/create-us`. Refinar uma story exige abrir modal e adivinhar o que falta; não há Boundaries editáveis nem distinção clara Record (implementação) vs Intent (produto).

Este épico entrega fluxo de **criação** com As/I want/so that + done_when obrigatórios, e **modal** com abas ou seções colapsáveis na ordem fixa do schema v2: Intent (Acceptance, Why, Where), Plan (Approach, Architecture refs resumo, Planned checklist), Boundaries (Out of scope, Notes), Record (read-only, espelho do que `/complete-us` preencheria no repo). Edição de acceptance e depends permanece; validação 🔶/✅ reforçada na UI.

## Expected outcome

Gestor cria US pelo board com preamble completo; edita Boundaries; Record aparece read-only. Fluxo equivalente mental a abrir `docs/us/US-XXXX.md` — não modal de cartão kanban v1.

## Out of scope for this epic

- Preencher Record automaticamente pós-código — permanece Meridian docs + `/complete-us`.
- Export Markdown 1:1 — futuro.

## Notes

Reutilizar shell modal v3 onde possível (DRY), mas layout novo `UsStoryModal`.
