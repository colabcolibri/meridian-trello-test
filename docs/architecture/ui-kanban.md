# UI kanban

## Shell do app

- Sem landing page: rota inicial `/` renderiza workspace.
- Se existir `last_board_id` válido → redireciona para `/boards/:id`.
- Caso contrário → lista de quadros com ação "criar quadro".

## Layout do quadro

- Header: nome do quadro (editável), voltar para lista, ações de quadro.
- Área principal: colunas em flex row, `overflow-x: auto`, altura útil da janela.
- Coluna: título editável, lista de cartões, botão adicionar cartão, menu coluna.

## Cartão compacto

Exibir: título, chips de etiquetas (cor), badge de prioridade, data de vencimento (vermelho se vencido), barra ou fração do checklist (ex.: 2/5).

## Modal de detalhes

Overlay central ou painel lateral; campos: título, descrição, prioridade, etiquetas, vencimento, checklist, observações, datas read-only, ações arquivar/duplicar/excluir.

## Drag and drop

Biblioteca: `@dnd-kit/core` + `@dnd-kit/sortable`.

Padrão multi-container (v2 / US-0021):
- `onDragOver` atualiza `cardsByColumn` entre colunas durante o gesto.
- `useDroppable` por coluna para soltar em área vazia.
- Placeholder tracejado na origem; único `DragOverlay` com `CardCompact variant="overlay"`.
- `onDragEnd` persiste via `move_card` + `reorder_cards`; `onDragCancel` recarrega estado.

## Identidade visual Trello (v2)

Tokens em `src/app/trello-theme.css` (US-0022): cores, sombras, tipografia, gradiente de board.

Superfícies:
- Board: `.trello-board-shell` + header semi-transparente (US-0023).
- Colunas: fundo `#ebecf0`, menu ⋯, botão “Adicionar um cartão” (US-0023).
- Cartão compacto: faixas de label no topo, sombra hover (US-0024).
- Workspace e modal: grid de quadros + layout two-column no detalhe (US-0025).

## Responsividade

- Breakpoints: mobile não prioritário; notebook (≥1024px) e desktop (≥1280px) com colunas min-width ~280px.
- Evitar overflow horizontal no body; scroll apenas na faixa de colunas.
