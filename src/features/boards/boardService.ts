import type { Board } from "../../domain/types";
import { tauriInvoke } from "../../lib/tauriInvoke";

export const boardService = {
  list: () => tauriInvoke<Board[]>("list_boards"),
  get: (id: string) => tauriInvoke<Board>("get_board", { id }),
  create: (name: string) => tauriInvoke<Board>("create_board", { input: { name } }),
  update: (id: string, name: string) =>
    tauriInvoke<Board>("update_board", { input: { id, name } }),
  delete: (id: string) => tauriInvoke<void>("delete_board", { id }),
  getLastBoardId: () => tauriInvoke<string | null>("get_last_board_id"),
  setLastBoardId: (boardId: string | null) =>
    tauriInvoke<void>("set_last_board_id", {
      input: { board_id: boardId },
    }),
};
