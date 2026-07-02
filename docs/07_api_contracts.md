---
title: Contratos de API
status: approved
version: 1.0
updated: 2026-07-02
depends_on: [05_architecture]
blocks: []
---

# Contratos de API (Tauri commands)

Comunicação UI ↔ backend via `invoke` — não há HTTP REST na v1.

## Boards

| Command | Input | Output |
| ------- | ----- | ------ |
| `list_boards` | — | `Board[]` |
| `create_board` | `{ name }` | `Board` |
| `update_board` | `{ id, name }` | `Board` |
| `delete_board` | `{ id }` | `void` |
| `get_last_board_id` | — | `string \| null` |
| `set_last_board_id` | `{ board_id }` | `void` |

## Columns

| Command | Input | Output |
| ------- | ----- | ------ |
| `list_columns` | `{ board_id }` | `Column[]` |
| `create_column` | `{ board_id, name }` | `Column` |
| `update_column` | `{ id, name }` | `Column` |
| `reorder_columns` | `{ board_id, ordered_ids }` | `Column[]` |
| `delete_column` | `{ id }` | `void` |

## Cards

| Command | Input | Output |
| ------- | ----- | ------ |
| `list_cards` | `{ column_id, include_archived? }` | `CardSummary[]` |
| `get_card` | `{ id }` | `CardDetail` |
| `create_card` | `{ column_id, title }` | `Card` |
| `update_card` | `{ id, ...fields }` | `Card` |
| `move_card` | `{ id, column_id, order_index }` | `Card` |
| `reorder_cards` | `{ column_id, ordered_ids }` | `Card[]` |
| `duplicate_card` | `{ id }` | `Card` |
| `archive_card` | `{ id, archived }` | `Card` |
| `delete_card` | `{ id }` | `void` |

## Tags e checklist

| Command | Input | Output |
| ------- | ----- | ------ |
| `list_tags` | `{ board_id }` | `Tag[]` |
| `create_tag` | `{ board_id, name, color }` | `Tag` |
| `set_card_tags` | `{ card_id, tag_ids }` | `Tag[]` |
| `list_checklist_items` | `{ card_id }` | `ChecklistItem[]` |
| `upsert_checklist_item` | `{ ... }` | `ChecklistItem` |
| `delete_checklist_item` | `{ id }` | `void` |
| `reorder_checklist_items` | `{ card_id, ordered_ids }` | `ChecklistItem[]` |

Tipos TypeScript espelham estas estruturas em `src/domain/types.ts`.
