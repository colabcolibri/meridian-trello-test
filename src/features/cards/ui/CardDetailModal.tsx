import { useCallback, useEffect, useState } from "react";
import { TAG_COLORS, PRIORITY_LABELS } from "../../../domain/constants";
import { formatDateTime, toDateInputValue } from "../../../domain/dates";
import { validateTitle } from "../../../domain/validators";
import type { CardDetail, ChecklistItem, Tag } from "../../../domain/types";
import { cardService } from "../cardService";
import { checklistService } from "../checklistService";
import { tagService } from "../../tags/tagService";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

interface CardDetailModalProps {
  cardId: string;
  boardId: string;
  columnOptions: { id: string; name: string }[];
  onClose: () => void;
  onChanged: () => void;
}

function SidebarField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-semibold text-[var(--trello-text-secondary)]">{label}</p>
      {children}
    </div>
  );
}

export function CardDetailModal({
  cardId,
  boardId,
  columnOptions,
  onClose,
  onChanged,
}: CardDetailModalProps) {
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [boardTags, setBoardTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showNewLabel, setShowNewLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<string>(TAG_COLORS[0].value);
  const [labelError, setLabelError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [d, tags] = await Promise.all([
        cardService.get(cardId),
        tagService.list(boardId),
      ]);
      if (!d?.card) {
        throw new Error("Invalid server response: card missing.");
      }
      setDetail(d);
      setBoardTags(tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load card");
      setDetail(null);
    }
  }, [cardId, boardId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const patch = async (fields: Parameters<typeof cardService.update>[0]) => {
    if (!detail) return;
    const updated = await cardService.update(fields);
    setDetail({ ...detail, card: updated });
    onChanged();
  };

  const toggleTag = async (tagId: string) => {
    if (!detail) return;
    const current = detail.tags.map((t) => t.id);
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    const tags = await tagService.setCardTags(cardId, next);
    setDetail({ ...detail, tags });
    onChanged();
  };

  const addTag = async () => {
    const name = newLabelName.trim();
    if (!name) {
      setLabelError("Label name cannot be empty");
      return;
    }
    setLabelError(null);
    try {
      const created = await tagService.create(boardId, name, newLabelColor);
      const currentIds = detail?.tags.map((t) => t.id) ?? [];
      const cardTags = await tagService.setCardTags(cardId, [...currentIds, created.id]);
      const allBoardTags = await tagService.list(boardId);
      setBoardTags(allBoardTags);
      if (detail) {
        setDetail({ ...detail, tags: cardTags });
      }
      setNewLabelName("");
      setShowNewLabel(false);
      onChanged();
    } catch (err) {
      setLabelError(err instanceof Error ? err.message : "Failed to create label");
    }
  };

  const saveChecklistItem = async (item: ChecklistItem) => {
    await checklistService.upsert({
      id: item.id,
      card_id: cardId,
      text: item.text,
      completed: item.completed,
      order_index: item.order_index,
    });
    await load();
    onChanged();
  };

  if (!detail) {
    return (
      <div className="trello-modal-overlay fixed inset-0 z-40 flex items-center justify-center">
        <div className="trello-modal max-w-md bg-white px-6 py-5 text-sm">
          {error ? (
            <>
              <p className="font-medium text-red-600">{error}</p>
              <button
                type="button"
                className="trello-btn-primary mt-4 px-4 py-2 text-sm"
                onClick={onClose}
              >
                Close
              </button>
            </>
          ) : (
            <p className="text-[var(--trello-text-secondary)]">Loading…</p>
          )}
        </div>
      </div>
    );
  }

  const { card, tags, checklist } = detail;
  const doneCount = checklist.filter((i) => i.completed).length;

  return (
    <>
      <div className="trello-modal-overlay fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:py-10">
        <div
          className="trello-modal my-2 w-full max-w-[768px] overflow-hidden rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative border-b border-[#091e4214] px-6 py-4 pr-14">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-md p-2 text-[var(--trello-text-muted)] hover:bg-[#091e4214]"
              aria-label="Close"
            >
              ✕
            </button>
            <p className="text-xs font-medium text-[var(--trello-text-muted)]">
              in list{" "}
              <span className="font-semibold text-[var(--trello-text-secondary)]">
                {columnOptions.find((c) => c.id === card.column_id)?.name ?? "—"}
              </span>
            </p>
            <input
              className="mt-2 w-full bg-transparent text-xl font-semibold leading-tight text-[var(--trello-text-primary)] outline-none placeholder:text-[var(--trello-text-muted)]"
              placeholder="Card title"
              value={card.title}
              onChange={(e) =>
                setDetail({ ...detail, card: { ...card, title: e.target.value } })
              }
              onBlur={() => {
                const err = validateTitle(card.title);
                if (err) {
                  setError(err);
                  return;
                }
                setError(null);
                void patch({ id: card.id, title: card.title });
              }}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="grid md:grid-cols-[minmax(0,1fr)_200px]">
            <div className="space-y-6 p-6">
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--trello-text-primary)]">
                  <span className="text-[var(--trello-text-muted)]" aria-hidden>
                    ☰
                  </span>
                  Description
                </h3>
                <textarea
                  className="w-full rounded-lg border border-[#091e4221] bg-[#fafbfc] p-3 text-sm text-[var(--trello-text-primary)] shadow-inner outline-none focus:border-[var(--trello-accent)] focus:bg-white"
                  rows={4}
                  placeholder="Add a more detailed description…"
                  value={card.description ?? ""}
                  onChange={(e) =>
                    setDetail({
                      ...detail,
                      card: { ...card, description: e.target.value },
                    })
                  }
                  onBlur={() =>
                    void patch({ id: card.id, description: card.description ?? "" })
                  }
                />
              </section>

              {tags.length > 0 && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Labels</h3>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-2 text-sm font-semibold">
                  Checklist
                  {checklist.length > 0 && (
                    <span className="ml-2 font-normal text-[var(--trello-text-muted)]">
                      {Math.round((doneCount / checklist.length) * 100)}%
                    </span>
                  )}
                </h3>
                {checklist.length > 0 && (
                  <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#091e4214]">
                    <div
                      className="h-full rounded-full bg-[var(--trello-accent)] transition-all"
                      style={{
                        width: `${checklist.length ? (doneCount / checklist.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                )}
                <ul className="space-y-2">
                  {checklist.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded"
                        checked={item.completed}
                        onChange={(e) =>
                          void saveChecklistItem({
                            ...item,
                            completed: e.target.checked,
                          })
                        }
                      />
                      <input
                        className="flex-1 rounded border border-transparent bg-white px-2 py-1.5 text-sm shadow-sm outline-none focus:border-[var(--trello-accent)]"
                        value={item.text}
                        onChange={(e) =>
                          setDetail({
                            ...detail,
                            checklist: checklist.map((c) =>
                              c.id === item.id ? { ...c, text: e.target.value } : c,
                            ),
                          })
                        }
                        onBlur={() => void saveChecklistItem(item)}
                      />
                      <button
                        type="button"
                        className="text-xs text-[var(--trello-text-muted)] hover:text-red-600"
                        onClick={async () => {
                          await checklistService.delete(item.id);
                          await load();
                          onChanged();
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="trello-btn-ghost mt-2 px-2 py-1.5 text-sm"
                  onClick={async () => {
                    await checklistService.upsert({
                      card_id: cardId,
                      text: "New item",
                      completed: false,
                      order_index: checklist.length,
                    });
                    await load();
                    onChanged();
                  }}
                >
                  Add an item
                </button>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold">Notes</h3>
                <textarea
                  className="w-full rounded-lg border border-[#091e4221] bg-white p-3 text-sm shadow-sm outline-none focus:border-[var(--trello-accent)]"
                  rows={3}
                  value={card.notes ?? ""}
                  onChange={(e) =>
                    setDetail({ ...detail, card: { ...card, notes: e.target.value } })
                  }
                  onBlur={() => void patch({ id: card.id, notes: card.notes ?? "" })}
                />
              </section>
            </div>

            <aside className="border-t border-[#091e4214] bg-[#f4f5f7] p-4 md:border-l md:border-t-0">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--trello-text-secondary)]">
                Add to card
              </p>

              <SidebarField label="List">
                <select
                  className="trello-modal-field w-full"
                  value={card.column_id}
                  onChange={(e) => {
                    void cardService.moveToColumn(card.id, e.target.value).then(() => {
                      onChanged();
                      onClose();
                    });
                  }}
                >
                  {columnOptions.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </SidebarField>

              <SidebarField label="Priority">
                <select
                  className="trello-modal-field w-full"
                  value={card.priority ?? ""}
                  onChange={(e) => {
                    const priority = e.target.value;
                    setDetail({ ...detail, card: { ...card, priority } });
                    void patch({ id: card.id, priority });
                  }}
                >
                  <option value="">None</option>
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </SidebarField>

              <SidebarField label="Due date">
                <input
                  type="date"
                  className="trello-modal-field w-full"
                  value={toDateInputValue(card.due_date)}
                  onChange={(e) => {
                    const due_date = e.target.value;
                    setDetail({ ...detail, card: { ...card, due_date } });
                    void patch({ id: card.id, due_date });
                  }}
                />
              </SidebarField>

              <SidebarField label="Labels">
                <div className="flex flex-wrap gap-1">
                  {boardTags.map((tag) => {
                    const active = tags.some((t) => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => void toggleTag(tag.id)}
                        className={`rounded px-2 py-1 text-xs font-medium text-white ${active ? "ring-2 ring-[var(--trello-text-primary)] ring-offset-1" : "opacity-40"}`}
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
                {showNewLabel ? (
                  <div className="mt-2 space-y-2 rounded-lg border border-[#091e4221] bg-white p-2">
                    <input
                      className="trello-modal-field w-full"
                      placeholder="Label name"
                      value={newLabelName}
                      autoFocus
                      onChange={(e) => setNewLabelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void addTag();
                        if (e.key === "Escape") {
                          setShowNewLabel(false);
                          setNewLabelName("");
                          setLabelError(null);
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {TAG_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          title={c.name}
                          className={`h-6 w-8 rounded ${newLabelColor === c.value ? "ring-2 ring-[var(--trello-text-primary)] ring-offset-1" : ""}`}
                          style={{ backgroundColor: c.value }}
                          onClick={() => setNewLabelColor(c.value)}
                        />
                      ))}
                    </div>
                    {labelError && (
                      <p className="text-xs text-red-600">{labelError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="trello-btn-primary px-3 py-1.5 text-xs"
                        onClick={() => void addTag()}
                      >
                        Add label
                      </button>
                      <button
                        type="button"
                        className="trello-btn-ghost px-2 py-1.5 text-xs"
                        onClick={() => {
                          setShowNewLabel(false);
                          setNewLabelName("");
                          setLabelError(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowNewLabel(true)}
                    className="trello-btn-ghost mt-2 w-full px-2 py-1.5 text-left text-sm"
                  >
                    ＋ New label
                  </button>
                )}
              </SidebarField>

              <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-[var(--trello-text-secondary)]">
                Actions
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  className="trello-modal-action"
                  onClick={() =>
                    void cardService.duplicate(card.id).then(() => {
                      onChanged();
                      onClose();
                    })
                  }
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="trello-modal-action"
                  onClick={() =>
                    void cardService.archive(card.id, true).then(() => {
                      onChanged();
                      onClose();
                    })
                  }
                >
                  Archive
                </button>
                <button
                  type="button"
                  className="trello-modal-action text-red-700 hover:bg-red-50"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </button>
              </div>

              <div className="mt-6 space-y-1 text-[10px] text-[var(--trello-text-muted)]">
                <p>Created {formatDateTime(card.created_at)}</p>
                <p>Updated {formatDateTime(card.updated_at)}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete card"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          void cardService.delete(card.id).then(() => {
            onChanged();
            onClose();
          });
        }}
      />
    </>
  );
}
