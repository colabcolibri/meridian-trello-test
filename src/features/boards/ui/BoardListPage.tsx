import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { validateName } from "../../../domain/validators";
import type { Board } from "../../../domain/types";
import { boardService } from "../boardService";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

const BOARD_GRADIENTS = [
  "linear-gradient(135deg, #0079bf, #5067c5)",
  "linear-gradient(135deg, #d29034, #b04632)",
  "linear-gradient(135deg, #519839, #4bbf6b)",
  "linear-gradient(135deg, #89609e, #cd5a91)",
  "linear-gradient(135deg, #4bbf6b, #00aecc)",
];

function boardGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % BOARD_GRADIENTS.length;
  return BOARD_GRADIENTS[hash];
}

export function BoardListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const showWorkspace =
    (location.state as { showWorkspace?: boolean } | null)?.showWorkspace === true;
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    const list = await boardService.list();
    setBoards(list);
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      try {
        if (!showWorkspace) {
          const lastId = await boardService.getLastBoardId();
          if (lastId) {
            try {
              await boardService.get(lastId);
              navigate(`/boards/${lastId}`, { replace: true });
              return;
            } catch {
              await boardService.setLastBoardId(null);
            }
          }
        }
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load boards");
        setLoading(false);
      }
    })();
  }, [navigate, showWorkspace]);

  const createBoard = async () => {
    const err = validateName(newName);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const board = await boardService.create(newName.trim());
    setNewName("");
    setShowCreate(false);
    await boardService.setLastBoardId(board.id);
    navigate(`/boards/${board.id}`);
  };

  const saveRename = async (id: string) => {
    const err = validateName(editName);
    if (err) {
      setError(err);
      return;
    }
    await boardService.update(id, editName.trim());
    setEditingId(null);
    await load();
  };

  if (loading) {
    return (
      <main className="trello-workspace flex min-h-screen items-center justify-center text-[var(--trello-text-secondary)]">
        Loading workspace…
      </main>
    );
  }

  return (
    <main className="trello-workspace min-h-screen px-4 py-8 md:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-bold text-[var(--trello-text-primary)]">Your boards</h1>
        <p className="mt-1 text-sm text-[var(--trello-text-secondary)]">
          Local Kanban — organize tasks offline
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => (
            <div key={board.id} className="group relative">
              {editingId === board.id ? (
                <div className="trello-board-tile p-3">
                  <input
                    className="w-full rounded border border-[#091e4233] px-2 py-1.5 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void saveRename(board.id)}
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="trello-btn-primary px-2 py-1 text-xs"
                      onClick={() => void saveRename(board.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="trello-btn-ghost px-2 py-1 text-xs"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to={`/boards/${board.id}`}
                    className="block overflow-hidden rounded-lg shadow-sm transition hover:shadow-md"
                    onClick={() => void boardService.setLastBoardId(board.id)}
                  >
                    <div
                      className="h-24 w-full"
                      style={{ background: boardGradient(board.id) }}
                    />
                    <div className="trello-board-tile px-3 py-2">
                      <p className="truncate text-sm font-semibold text-[var(--trello-text-primary)]">
                        {board.name}
                      </p>
                    </div>
                  </Link>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      className="rounded bg-black/40 px-2 py-0.5 text-xs text-white hover:bg-black/55"
                      onClick={() => {
                        setEditingId(board.id);
                        setEditName(board.name);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="rounded bg-black/40 px-2 py-0.5 text-xs text-white hover:bg-black/55"
                      onClick={() => setDeleteId(board.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {showCreate ? (
            <div className="trello-board-tile p-3">
              <input
                className="w-full rounded border border-[#091e4233] px-2 py-1.5 text-sm"
                placeholder="Board name"
                value={newName}
                autoFocus
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void createBoard();
                  if (e.key === "Escape") {
                    setShowCreate(false);
                    setNewName("");
                  }
                }}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="trello-btn-primary px-3 py-1.5 text-sm"
                  onClick={() => void createBoard()}
                >
                  Create board
                </button>
                <button
                  type="button"
                  className="trello-btn-ghost px-2 py-1.5 text-sm"
                  onClick={() => {
                    setShowCreate(false);
                    setNewName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="flex h-[7.5rem] items-center justify-center rounded-lg bg-[#091e420f] text-sm font-medium text-[var(--trello-text-secondary)] transition hover:bg-[#091e421a] hover:text-[var(--trello-text-primary)]"
              onClick={() => setShowCreate(true)}
            >
              Create new board
            </button>
          )}
        </div>

        {boards.length === 0 && !showCreate && (
          <p className="mt-6 text-center text-sm text-[var(--trello-text-muted)]">
            No boards yet. Click &quot;Create new board&quot; to get started.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete board"
        message="Lists and cards in this board will be permanently removed."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await boardService.delete(deleteId);
          setDeleteId(null);
          await load();
        }}
      />
    </main>
  );
}
