import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Epic, Project, Sprint, Version } from "../../../domain/agileTypes";
import { projectService } from "../projectService";
import { versionService } from "../versionService";
import { epicService } from "../epicService";
import { sprintService } from "../sprintService";
import { ProductCrudPanel } from "./ProductCrudPanel";

export function ProjectHubPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    const [proj, vers, eps, sprs] = await Promise.all([
      projectService.get(projectId),
      versionService.list(projectId),
      epicService.list(projectId),
      sprintService.list(projectId),
    ]);
    setProject(proj);
    setVersions(vers);
    setEpics(eps);
    setSprints(sprs);
    await projectService.setLastProjectId(projectId);

    if (!selectedVersionId && vers.length > 0) {
      const active = vers.find((v) => v.status === "active") ?? vers[vers.length - 1];
      setSelectedVersionId(active.id);
    }
  }, [projectId, selectedVersionId]);

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load project"),
    );
  }, [load]);

  const versionSprints = selectedVersionId
    ? sprints.filter((s) => s.version_id === selectedVersionId)
    : sprints;

  const openSprintBoard = async (sprintId: string) => {
    await sprintService.setLastSprintId(projectId, sprintId);
    navigate(`/projects/${projectId}/sprints/${sprintId}`);
  };

  if (!project) {
    return (
      <main className="trello-workspace flex min-h-screen items-center justify-center">
        Loading project…
      </main>
    );
  }

  return (
    <main className="trello-workspace min-h-screen px-4 py-8 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/projects"
          state={{ showWorkspace: true }}
          className="text-sm font-medium text-[var(--trello-accent)] hover:underline"
        >
          ← Projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[var(--trello-text-primary)]">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-[var(--trello-text-secondary)]">{project.description}</p>
        )}

        {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--trello-text-muted)]">
            Navigation
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#091e4214] bg-white p-4">
              <label className="mb-2 block text-sm font-medium">Version</label>
              <select
                className="w-full rounded border px-2 py-1.5 text-sm"
                value={selectedVersionId ?? ""}
                onChange={(e) => {
                  setSelectedVersionId(e.target.value || null);
                  setSelectedSprintId(null);
                }}
              >
                <option value="">Select…</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} — {v.title} ({v.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-[#091e4214] bg-white p-4">
              <label className="mb-2 block text-sm font-medium">Sprint</label>
              <select
                className="w-full rounded border px-2 py-1.5 text-sm"
                value={selectedSprintId ?? ""}
                onChange={(e) => setSelectedSprintId(e.target.value || null)}
                disabled={!selectedVersionId}
              >
                <option value="">Select…</option>
                {versionSprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.title} ({s.status})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="trello-btn-primary mt-3 w-full px-3 py-2 text-sm disabled:opacity-50"
                disabled={!selectedSprintId}
                onClick={() => selectedSprintId && void openSprintBoard(selectedSprintId)}
              >
                Open agile board
              </button>
              <button
                type="button"
                className="mt-2 w-full rounded border border-[#091e4226] px-3 py-2 text-sm hover:bg-[#091e420f]"
                onClick={() => navigate(`/projects/${projectId}/board`)}
              >
                Board (all project stories)
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--trello-text-muted)]">
            Product metadata
          </h2>
          <ProductCrudPanel
            projectId={projectId}
            versions={versions}
            epics={epics}
            sprints={sprints}
            onChanged={() => void load()}
          />
        </section>
      </div>
    </main>
  );
}
