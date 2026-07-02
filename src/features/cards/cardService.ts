import type { Card, CardDetail, CardSummary } from "../../domain/types";
import { tauriInvoke } from "../../lib/tauriInvoke";

export const cardService = {
  list: (columnId: string) =>
    tauriInvoke<CardSummary[]>("list_cards", { columnId, includeArchived: false }),
  get: (id: string) => tauriInvoke<CardDetail>("get_card", { id }),
  create: (columnId: string, title: string) =>
    tauriInvoke<Card>("create_card", { input: { column_id: columnId, title } }),
  update: (payload: {
    id: string;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: string;
    notes?: string;
  }) => tauriInvoke<Card>("update_card", { input: payload }),
  move: (id: string, columnId: string, orderIndex: number) =>
    tauriInvoke<Card>("move_card", {
      input: { id, column_id: columnId, order_index: orderIndex },
    }),
  moveToColumn: (id: string, columnId: string) =>
    tauriInvoke<Card>("move_card_to_column", { id, columnId }),
  reorder: (columnId: string, orderedIds: string[]) =>
    tauriInvoke<CardSummary[]>("reorder_cards", {
      input: { column_id: columnId, ordered_ids: orderedIds },
    }),
  duplicate: (id: string) => tauriInvoke<Card>("duplicate_card", { id }),
  archive: (id: string, archived: boolean) =>
    tauriInvoke<Card>("archive_card", { input: { id, archived } }),
  delete: (id: string) => tauriInvoke<void>("delete_card", { id }),
};
