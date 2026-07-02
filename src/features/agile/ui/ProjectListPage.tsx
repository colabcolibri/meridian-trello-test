import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { validateName } from "../../../domain/validators";
import type { Project } from "../../../domain/agileTypes";
import { projectService } from "../projectService";
import { sprintService } from "../sprintService";

const GRADIENTS = [
  "linear-gradient(135deg, #0079bf, #5067c5)",
  "linear-gradient(135deg, #89609e, #cd5a91)",
  "linear-gradient(135deg, #519839, #4bbf6b)",
  "linear-gradient(135deg, #d29034, #b04632)",
];

function gradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % GRADIENTS.length;
  return GRADIENTS[hash];
}

export function ProjectListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const showWorkspace =
    (location.state as { showWorkspace?: boolean } | null)?.showWorkspace === true;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const list = await projectService.list();
    setProjects(list);
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      try {
        if (!showWorkspace) {
          const lastId = await projectService.getLastProjectId();
          if (lastId) {
            try {
              await projectService.get(lastId);
              const lastSprint = await sprintService.getLastSprintId(lastId);
              if (lastSprint) {
                navigate(`/projects/${lastId}/sprints/${lastSprint}`, { replace: true });
                return;
              }
              navigate(`/projects/${lastId}`, { replace: true });
              return;
            } catch {
              await projectService.setLastProjectId(null);
            }
          }
        }
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
        setLoading(false);
      }
    })();
  }, [navigate, showWorkspace]);

  const createProject = async () => {
    const err = validateName(newName);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const project = await projectService.create(newName.trim());
    setNewName("");
    setShowCreate(false);
    await projectService.setLastProjectId(project.id);
    navigate(`/projects/${project.id}`);
  };

  if (loading) {
    return (
      <main className="trello-workspace flex min-h-screen items-center justify-center text-[var(--trello-text-secondary)]">
        Loading projects…
      </main>
    );
  }

  return (
    <main className="trello-workspace min-h-screen px-4 py-8 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--trello-text-primary)]">Agile projects</h1>
            <p className="mt-1 text-sm text-[var(--trello-text-secondary)]">
              Manage versions, epics, sprints and Meridian user stories
            </p>
          </div>
        </div>

        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group block overflow-hidden rounded-xl shadow-md transition hover:shadow-lg"
              style={{ background: gradient(project.id) }}
            >
              <div className="flex h-28 flex-col justify-end p-4 text-white">
                <h2 className="truncate text-lg font-semibold">{project.name}</h2>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-white/85">{project.description}</p>
                )}
              </div>
            </Link>
          ))}

          {showCreate ? (
            <div className="rounded-xl border border-[#091e4226] bg-white p-4 shadow-sm">
              <input
                className="mb-3 w-full rounded border px-3 py-2 text-sm"
                placeholder="Project name"
                value={newName}
                autoFocus
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void createProject()}
              />
              <div className="flex gap-2">
                <button type="button" className="trello-btn-primary px-3 py-1.5 text-sm" onClick={() => void createProject()}>
                  Create
                </button>
                <button type="button" className="text-sm text-[var(--trello-text-muted)]" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-[#091e4226] bg-white/60 text-sm font-medium text-[var(--trello-text-secondary)] hover:bg-white"
              onClick={() => setShowCreate(true)}
            >
              ＋ New project
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
