import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Epic, Project, Sprint, Version } from "../../../domain/agileTypes";
import { projectService } from "../projectService";
import { versionService } from "../versionService";
import { epicService } from "../epicService";
import { sprintService } from "../sprintService";
import { CreateVersionDialog } from "./CreateVersionDialog";
import { CreateEpicDialog } from "./CreateEpicDialog";
import { CreateSprintDialog } from "./CreateSprintDialog";
import { EditVersionDialog } from "./EditVersionDialog";
import { EditEpicDialog } from "./EditEpicDialog";
import { EditSprintDialog } from "./EditSprintDialog";
import { VersionIncludedSummary } from "./VersionIncludedSummary";

export function ProjectHubPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [epics, setEpics] = useState<{ id: string; title: string }[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [showCreateEpic, setShowCreateEpic] = useState(false);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [editVersion, setEditVersion] = useState<Version | null>(null);
  const [editEpic, setEditEpic] = useState<Epic | null>(null);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    const [proj, vers] = await Promise.all([
      projectService.get(projectId),
      versionService.list(projectId),
    ]);
    setProject(proj);
    setVersions(vers);
    await projectService.setLastProjectId(projectId);

    if (!selectedVersionId && vers.length > 0) {
      const active = vers.find((v) => v.status === "active") ?? vers[vers.length - 1];
      setSelectedVersionId(active.id);
    }
  }, [projectId, selectedVersionId]);

  const loadVersionContext = useCallback(async () => {
    if (!projectId || !selectedVersionId) {
      setEpics([]);
      setSprints([]);
      return;
    }
    const [eps, sprs] = await Promise.all([
      epicService.listForVersion(projectId, selectedVersionId),
      sprintService.list(projectId, selectedVersionId),
    ]);
    setEpics(eps);
    setSprints(sprs);
  }, [projectId, selectedVersionId]);

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load project"),
    );
  }, [load]);

  useEffect(() => {
    void loadVersionContext().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load version context"),
    );
  }, [loadVersionContext]);

  const selectedVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId) ?? null,
    [versions, selectedVersionId],
  );

  const selectedEpic = useMemo(
    () => epics.find((e) => e.id === selectedEpicId) ?? null,
    [epics, selectedEpicId],
  );

  const selectedSprint = useMemo(
    () => sprints.find((s) => s.id === selectedSprintId) ?? null,
    [sprints, selectedSprintId],
  );

  const refresh = () => {
    void load();
    void loadVersionContext();
  };

  const openSprintBoard = async (sprintId: string) => {
    await sprintService.setLastSprintId(projectId, sprintId);
    navigate(`/projects/${projectId}/sprints/${sprintId}`);
  };

  const openEditEpic = async (epicId: string) => {
    const all = await epicService.list(projectId);
    const full = all.find((e) => e.id === epicId);
    if (full) setEditEpic(full);
  };

  if (!project) {
    return (
      <main className="trello-workspace flex min-h-screen items-center justify-center">
        Carregando projeto…
      </main>
    );
  }

  const breadcrumb = [
    project.name,
    selectedVersion?.id,
    selectedEpic?.id,
    selectedSprint?.id,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <main className="trello-workspace min-h-screen px-4 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/projects"
          state={{ showWorkspace: true }}
          className="text-sm font-medium text-[var(--trello-accent)] hover:underline"
        >
          ← Projetos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[var(--trello-text-primary)]">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-[var(--trello-text-secondary)]">{project.description}</p>
        )}
        {breadcrumb && (
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--trello-text-muted)]">
            {breadcrumb}
          </p>
        )}

        {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="hub-layout mt-8">
          <section className="hub-panel">
            <header className="hub-panel__header">
              <h2 className="hub-panel__title">Versões</h2>
              <button
                type="button"
                className="trello-btn-primary text-xs px-2 py-1"
                onClick={() => setShowCreateVersion(true)}
              >
                ＋ Nova
              </button>
            </header>
            <ul className="hub-panel__list">
              {versions.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    className={`hub-panel__item ${selectedVersionId === v.id ? "hub-panel__item--active" : ""}`}
                    onClick={() => {
                      setSelectedVersionId(v.id);
                      setSelectedEpicId(null);
                      setSelectedSprintId(null);
                    }}
                  >
                    <span className="font-semibold">{v.id}</span>
                    <span className="hub-panel__item-sub">{v.title}</span>
                    <span className="hub-panel__badge">{v.status}</span>
                  </button>
                  {selectedVersionId === v.id && (
                    <button
                      type="button"
                      className="hub-panel__edit-link"
                      onClick={() => setEditVersion(v)}
                    >
                      Editar versão
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="hub-panel">
            <header className="hub-panel__header">
              <h2 className="hub-panel__title">Épicos</h2>
              <button
                type="button"
                className="trello-btn-primary text-xs px-2 py-1 disabled:opacity-50"
                disabled={!selectedVersionId}
                onClick={() => setShowCreateEpic(true)}
              >
                ＋ Novo
              </button>
            </header>
            {!selectedVersionId ? (
              <p className="hub-panel__empty">Selecione uma versão.</p>
            ) : (
              <ul className="hub-panel__list">
                {epics.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className={`hub-panel__item ${selectedEpicId === e.id ? "hub-panel__item--active" : ""}`}
                      onClick={() => setSelectedEpicId(e.id)}
                    >
                      <span className="font-semibold">{e.id}</span>
                      <span className="hub-panel__item-sub">{e.title}</span>
                    </button>
                    <button
                      type="button"
                      className="hub-panel__edit-link"
                      onClick={() => void openEditEpic(e.id)}
                    >
                      Editar épico
                    </button>
                  </li>
                ))}
                {epics.length === 0 && (
                  <p className="hub-panel__empty">Nenhum épico vinculado a esta versão.</p>
                )}
              </ul>
            )}
          </section>

          <section className="hub-panel">
            <header className="hub-panel__header">
              <h2 className="hub-panel__title">Sprints</h2>
              <button
                type="button"
                className="trello-btn-primary text-xs px-2 py-1 disabled:opacity-50"
                disabled={!selectedVersionId}
                onClick={() => setShowCreateSprint(true)}
              >
                ＋ Novo
              </button>
            </header>
            {!selectedVersionId ? (
              <p className="hub-panel__empty">Selecione uma versão.</p>
            ) : (
              <ul className="hub-panel__list">
                {sprints.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`hub-panel__item ${selectedSprintId === s.id ? "hub-panel__item--active" : ""}`}
                      onClick={() => setSelectedSprintId(s.id)}
                    >
                      <span className="font-semibold">{s.id}</span>
                      <span className="hub-panel__item-sub">{s.title}</span>
                      <span className="hub-panel__badge">{s.status}</span>
                    </button>
                    <button
                      type="button"
                      className="hub-panel__edit-link"
                      onClick={() => setEditSprint(s)}
                    >
                      Editar sprint
                    </button>
                  </li>
                ))}
                {sprints.length === 0 && (
                  <p className="hub-panel__empty">Nenhum sprint nesta versão.</p>
                )}
              </ul>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-xl border border-[#091e4214] bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--trello-text-muted)]">
            Contexto da versão
          </h2>
          {selectedVersionId ? (
            <>
              <VersionIncludedSummary projectId={projectId} versionId={selectedVersionId} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="trello-btn-primary px-4 py-2 text-sm disabled:opacity-50"
                  disabled={!selectedSprintId}
                  onClick={() => selectedSprintId && void openSprintBoard(selectedSprintId)}
                >
                  Abrir quadro do sprint
                </button>
                <button
                  type="button"
                  className="rounded border border-[#091e4226] px-4 py-2 text-sm hover:bg-[#091e420f]"
                  onClick={() => navigate(`/projects/${projectId}/board`)}
                >
                  Quadro (todas as US)
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--trello-text-muted)]">Selecione uma versão para ver o escopo.</p>
          )}
        </section>
      </div>

      {showCreateVersion && (
        <CreateVersionDialog
          projectId={projectId}
          onClose={() => setShowCreateVersion(false)}
          onCreated={refresh}
        />
      )}
      {showCreateEpic && (
        <CreateEpicDialog
          projectId={projectId}
          onClose={() => setShowCreateEpic(false)}
          onCreated={refresh}
        />
      )}
      {showCreateSprint && (
        <CreateSprintDialog
          projectId={projectId}
          defaultVersionId={selectedVersionId}
          onClose={() => setShowCreateSprint(false)}
          onCreated={refresh}
        />
      )}
      {editVersion && (
        <EditVersionDialog
          projectId={projectId}
          version={editVersion}
          onClose={() => setEditVersion(null)}
          onSaved={refresh}
        />
      )}
      {editEpic && (
        <EditEpicDialog
          projectId={projectId}
          epic={editEpic}
          onClose={() => setEditEpic(null)}
          onSaved={refresh}
        />
      )}
      {editSprint && (
        <EditSprintDialog
          projectId={projectId}
          sprint={editSprint}
          onClose={() => setEditSprint(null)}
          onSaved={refresh}
        />
      )}
    </main>
  );
}
