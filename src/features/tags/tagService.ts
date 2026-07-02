import type { Tag } from "../../domain/types";
import { tauriInvoke } from "../../lib/tauriInvoke";

export const tagService = {
  list: (boardId: string) => tauriInvoke<Tag[]>("list_tags", { boardId }),
  create: (boardId: string, name: string, color: string) =>
    tauriInvoke<Tag>("create_tag", { input: { board_id: boardId, name, color } }),
  setCardTags: (cardId: string, tagIds: string[]) =>
    tauriInvoke<Tag[]>("set_card_tags", { input: { card_id: cardId, tag_ids: tagIds } }),
};
