import type { Column } from "../../domain/types";
import { tauriInvoke } from "../../lib/tauriInvoke";

export const columnService = {
  list: (boardId: string) => tauriInvoke<Column[]>("list_columns", { boardId }),
  create: (boardId: string, name: string) =>
    tauriInvoke<Column>("create_column", { input: { board_id: boardId, name } }),
  update: (id: string, name: string) =>
    tauriInvoke<Column>("update_column", { input: { id, name } }),
  delete: (id: string) => tauriInvoke<void>("delete_column", { id }),
  moveUp: (id: string) => tauriInvoke<Column[]>("move_column_up", { id }),
  moveDown: (id: string) => tauriInvoke<Column[]>("move_column_down", { id }),
  reorder: (boardId: string, orderedIds: string[]) =>
    tauriInvoke<Column[]>("reorder_columns", {
      input: { board_id: boardId, ordered_ids: orderedIds },
    }),
};
