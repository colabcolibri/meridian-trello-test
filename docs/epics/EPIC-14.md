---
id: EPIC-14
title: Editor de user story estilo Meridian
status: complete
versions: [v3]
profiles: [Usuário local]
outcome: "Modal de US permite ler e editar Intent e Plan mínimo com checklist de aceite persistido."
---

# EPIC-14 — Editor de user story estilo Meridian

## Capability

User stories só valem se o gestor conseguir **refinar e fechar** com critérios observáveis — no Meridian isso vive em seções Intent (Acceptance, Why, Where) e Plan (Architecture refs, Planned). No app, o modal de cartão v2 edita título, descrição e checklist de tarefa; não há lugar para narrativa Why/Where, `done_when`, MoSCoW, `depends_on` ou lista de acceptance com checkbox independente do status da US.

Este épico adapta o modal para o contrato Meridian simplificado: visualização estruturada em abas ou seções colapsáveis; edição de campos editáveis pelo gestor (não agente); checklist de aceite com toggle `[ ]`/`[x]`; campos `ready` e status ❌/🔶/✅ com regra 🔶 exige `Missing:` em acceptance — espelhando P0 do protocolo. Record permanece read-only até implementação fechar a US (futuro polish).

## Expected outcome

Gestor abre US-0001 no modal, lê Why e Where em prosa, marca dois critérios de aceite como cumpridos, define `ready: true`, salva, e vê badges atualizados no cartão do quadro. Tentativa de marcar ✅ sem todos os critérios exibe aviso alinhado à governança Meridian.

## Out of scope for this epic

- Preenchimento automático de Record pós-implementação — fluxo `/complete-us` permanece no repositório docs.
- Agentes ou refine automático por IA dentro do modal.
- Edição de épicos/versões no mesmo modal — telas EPIC-12.
- Export Markdown 1:1 com frontmatter YAML — versão futura.

## Notes

Template de referência: `.agent/references/templates/us-template.md`. Seções Record e Boundaries podem ser read-only ou colapsadas na v3.
