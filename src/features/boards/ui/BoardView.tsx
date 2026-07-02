import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CardCompact } from "../../../components/cards/CardCompact";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { validateTitle } from "../../../domain/validators";
import type { Board, CardSummary, Column } from "../../../domain/types";
import { boardService } from "../boardService";
import { columnService } from "../../columns/columnService";
import { cardService } from "../../cards/cardService";
import { CardDetailModal } from "../../cards/ui/CardDetailModal";

function SortableCard({
  card,
  onOpen,
}: {
  card: CardSummary;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { type: "card", columnId: card.column_id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="trello-drag-placeholder" aria-hidden />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-lg"
      {...attributes}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...listeners}
        className="absolute right-1 top-1 z-10 cursor-grab rounded px-1 py-0.5 text-xs text-[var(--trello-text-muted)] opacity-0 transition hover:bg-[#091e4214] group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag card"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </button>
      <CardCompact card={card} onClick={() => onOpen(card.id)} />
    </div>
  );
}

function ColumnPanel({
  column,
  cards,
  onOpenCard,
  onAddCard,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  column: Column;
  cards: CardSummary[];
  onOpenCard: (id: string) => void;
  onAddCard: (columnId: string, title: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [menuOpen, setMenuOpen] = useState(false);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  useEffect(() => setName(column.name), [column.name]);

  const submitCard = () => {
    if (!title.trim()) return;
    onAddCard(column.id, title.trim());
    setTitle("");
    setShowAdd(false);
  };

  return (
    <div
      className={`kanban-column trello-column flex shrink-0 flex-col p-2 ${
        isOver ? "is-drop-target" : ""
      }`}
      data-column-id={column.id}
    >
      <div className="mb-2 flex items-center gap-1 px-1">
        {editing ? (
          <input
            className="flex-1 rounded border border-[#091e4233] bg-white px-2 py-1 text-sm font-semibold text-[var(--trello-text-primary)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() && name !== column.name) onRename(column.id, name.trim());
              setEditing(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            autoFocus
          />
        ) : (
          <h2
            className="flex-1 cursor-pointer truncate px-1 text-sm font-semibold text-[var(--trello-text-primary)]"
            onClick={() => setEditing(true)}
          >
            {column.name}
            <span className="ml-1.5 font-normal text-[var(--trello-text-muted)]">
              {cards.length}
            </span>
          </h2>
        )}
        <div className="relative">
          <button
            type="button"
            className="trello-btn-ghost px-2 py-1 text-base leading-none"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="List menu"
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-[#091e4214] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[#091e420f]"
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[#091e420f]"
                  onClick={() => {
                    onMoveUp(column.id);
                    setMenuOpen(false);
                  }}
                >
                  Move left
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[#091e420f]"
                  onClick={() => {
                    onMoveDown(column.id);
                    setMenuOpen(false);
                  }}
                >
                  Move right
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    onDelete(column.id);
                    setMenuOpen(false);
                  }}
                >
                  Delete list
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setDroppableRef}
          className="flex min-h-[8px] flex-1 flex-col gap-2 overflow-y-auto px-0.5 pb-1"
        >
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} onOpen={onOpenCard} />
          ))}
        </div>
      </SortableContext>

      <div className="mt-1 px-0.5">
        {showAdd ? (
          <div className="rounded-lg bg-white p-2 shadow-sm">
            <textarea
              className="w-full resize-none rounded border border-[#091e4233] px-2 py-1.5 text-sm text-[var(--trello-text-primary)] outline-none focus:border-[var(--trello-accent)]"
              placeholder="Enter a title for this card…"
              rows={2}
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitCard();
                }
                if (e.key === "Escape") {
                  setShowAdd(false);
                  setTitle("");
                }
              }}
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                className="trello-btn-primary px-3 py-1.5 text-sm"
                onClick={submitCard}
              >
                Add card
              </button>
              <button
                type="button"
                className="p-1.5 text-xl leading-none text-[var(--trello-text-muted)] hover:text-[var(--trello-text-primary)]"
                onClick={() => {
                  setShowAdd(false);
                  setTitle("");
                }}
                aria-label="Cancel"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="trello-add-card-btn"
            onClick={() => setShowAdd(true)}
          >
            ＋ Add a card
          </button>
        )}
      </div>
    </div>
  );
}

export function BoardView() {
  const { boardId = "" } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cardsByColumn, setCardsByColumn] = useState<Record<string, CardSummary[]>>({});
  const [activeCard, setActiveCard] = useState<CardSummary | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const dragStartColumnRef = useRef<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const loadAll = useCallback(async () => {
    if (!boardId) return;
    const [b, cols] = await Promise.all([
      boardService.get(boardId),
      columnService.list(boardId),
    ]);
    setBoard(b);
    setColumns(cols);
    await boardService.setLastBoardId(boardId);
    const entries = await Promise.all(
      cols.map(async (col) => [col.id, await cardService.list(col.id)] as const),
    );
    setCardsByColumn(Object.fromEntries(entries));
  }, [boardId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const findColumnOfCard = useCallback(
    (cardId: string) => {
      for (const [colId, cards] of Object.entries(cardsByColumn)) {
        if (cards.some((c) => c.id === cardId)) return colId;
      }
      return null;
    },
    [cardsByColumn],
  );

  const resolveOverColumn = useCallback(
    (overId: string, over: DragOverEvent["over"]) => {
      const data = over?.data.current;
      if (data?.type === "column") return data.columnId as string;
      if (data?.type === "card") return data.columnId as string;
      if (columns.some((c) => c.id === overId)) return overId;
      return findColumnOfCard(overId);
    },
    [columns, findColumnOfCard],
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeColumn = findColumnOfCard(activeId);
    const overColumn = resolveOverColumn(overId, over);

    if (!activeColumn || !overColumn) return;

    setCardsByColumn((prev) => {
      const sourceCards = [...(prev[activeColumn] ?? [])];
      const activeIndex = sourceCards.findIndex((c) => c.id === activeId);
      if (activeIndex === -1) return prev;

      if (activeColumn === overColumn) {
        const overIndex = sourceCards.findIndex((c) => c.id === overId);
        if (overIndex === -1 || activeIndex === overIndex) return prev;
        return {
          ...prev,
          [activeColumn]: arrayMove(sourceCards, activeIndex, overIndex),
        };
      }

      const targetCards = [...(prev[overColumn] ?? [])];
      const [moved] = sourceCards.splice(activeIndex, 1);
      let insertIndex = targetCards.findIndex((c) => c.id === overId);
      if (insertIndex === -1) insertIndex = targetCards.length;
      targetCards.splice(insertIndex, 0, { ...moved, column_id: overColumn });

      return {
        ...prev,
        [activeColumn]: sourceCards,
        [overColumn]: targetCards,
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) {
      dragStartColumnRef.current = null;
      await loadAll();
      return;
    }

    const activeId = String(active.id);
    const endColumn = findColumnOfCard(activeId);
    const startColumn = dragStartColumnRef.current;
    dragStartColumnRef.current = null;

    if (!endColumn) {
      await loadAll();
      return;
    }

    const endCards = cardsByColumn[endColumn] ?? [];
    const cardIndex = endCards.findIndex((c) => c.id === activeId);
    if (cardIndex === -1) {
      await loadAll();
      return;
    }

    const endOrderedIds = endCards.map((c) => c.id);

    try {
      if (startColumn && startColumn !== endColumn) {
        await cardService.move(activeId, endColumn, cardIndex);
        await cardService.reorder(endColumn, endOrderedIds);
        const startCards = cardsByColumn[startColumn] ?? [];
        if (startCards.length > 0) {
          await cardService.reorder(
            startColumn,
            startCards.map((c) => c.id),
          );
        }
      } else {
        await cardService.reorder(endColumn, endOrderedIds);
      }
    } catch {
      await loadAll();
    }
  };

  if (!board) {
    return (
      <main className="trello-board-shell flex min-h-screen items-center justify-center text-white/90">
        Loading board…
      </main>
    );
  }

  return (
    <div className="trello-board-shell flex min-h-screen flex-col">
      <header className="trello-board-header flex flex-wrap items-center gap-3 px-4 py-3 md:px-5">
        <Link to="/" state={{ showWorkspace: true }} className="text-sm font-medium">
          ← Boards
        </Link>
        <h1 className="text-base font-semibold md:text-lg">{board.name}</h1>
        <div className="ml-auto flex items-center gap-2">
          {showAddColumn ? (
            <div className="flex items-center gap-2">
              <input
                className="rounded border-0 px-2 py-1.5 text-sm text-[var(--trello-text-primary)] shadow-sm"
                placeholder="List name"
                value={newColumnName}
                autoFocus
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newColumnName.trim()) {
                    void columnService.create(boardId, newColumnName.trim()).then(() => {
                      setNewColumnName("");
                      setShowAddColumn(false);
                      void loadAll();
                    });
                  }
                  if (e.key === "Escape") {
                    setShowAddColumn(false);
                    setNewColumnName("");
                  }
                }}
              />
              <button
                type="button"
                className="trello-btn-primary px-3 py-1.5 text-sm"
                onClick={() => {
                  if (!newColumnName.trim()) return;
                  void columnService.create(boardId, newColumnName.trim()).then(() => {
                    setNewColumnName("");
                    setShowAddColumn(false);
                    void loadAll();
                  });
                }}
              >
                Add
              </button>
              <button
                type="button"
                className="text-white/80 hover:text-white"
                onClick={() => {
                  setShowAddColumn(false);
                  setNewColumnName("");
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="rounded bg-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/30"
              onClick={() => setShowAddColumn(true)}
            >
              ＋ Add another list
            </button>
          )}
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => {
          const col = findColumnOfCard(String(active.id));
          dragStartColumnRef.current = col;
          if (col) {
            const card = cardsByColumn[col]?.find((c) => c.id === active.id);
            if (card) setActiveCard(card);
          }
        }}
        onDragOver={handleDragOver}
        onDragEnd={(e) => void handleDragEnd(e)}
        onDragCancel={() => {
          setActiveCard(null);
          dragStartColumnRef.current = null;
          void loadAll();
        }}
      >
        <div className="kanban-scroll flex flex-1 gap-3 overflow-x-auto overflow-y-hidden px-4 pb-4 pt-2 md:px-5">
          {columns.map((column) => (
            <ColumnPanel
              key={column.id}
              column={column}
              cards={cardsByColumn[column.id] ?? []}
              onOpenCard={setSelectedCardId}
              onAddCard={async (colId, title) => {
                if (validateTitle(title)) return;
                await cardService.create(colId, title);
                await loadAll();
              }}
              onRename={async (id, name) => {
                await columnService.update(id, name);
                await loadAll();
              }}
              onDelete={(id) => setDeleteColumnId(id)}
              onMoveUp={async (id) => {
                await columnService.moveUp(id);
                await loadAll();
              }}
              onMoveDown={async (id) => {
                await columnService.moveDown(id);
                await loadAll();
              }}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
          {activeCard ? (
            <div className="w-[256px]">
              <CardCompact card={activeCard} onClick={() => {}} variant="overlay" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedCardId && (
        <CardDetailModal
          cardId={selectedCardId}
          boardId={boardId}
          columnOptions={columns.map((c) => ({ id: c.id, name: c.name }))}
          onClose={() => setSelectedCardId(null)}
          onChanged={() => void loadAll()}
        />
      )}

      <ConfirmDialog
        open={!!deleteColumnId}
        title="Delete list"
        message="Cards in this list will also be deleted."
        confirmLabel="Delete"
        onCancel={() => setDeleteColumnId(null)}
        onConfirm={async () => {
          if (!deleteColumnId) return;
          await columnService.delete(deleteColumnId);
          setDeleteColumnId(null);
          await loadAll();
        }}
      />
    </div>
  );
}
