import type { ChecklistItem } from "../../domain/types";
import { tauriInvoke } from "../../lib/tauriInvoke";

export const checklistService = {
  list: (cardId: string) =>
    tauriInvoke<ChecklistItem[]>("list_checklist_items", { cardId }),
  upsert: (item: {
    id?: string;
    card_id: string;
    text: string;
    completed: boolean;
    order_index: number;
  }) => tauriInvoke<ChecklistItem>("upsert_checklist_item", { input: item }),
  delete: (id: string) => tauriInvoke<void>("delete_checklist_item", { id }),
};
