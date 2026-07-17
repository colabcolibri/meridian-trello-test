import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Epic, Project, Sprint, StorySummary, Version } from "../../../domain/agileTypes";
import { projectService } from "../projectService";
import { versionService } from "../versionService";
import { epicService } from "../epicService";
import { sprintService } from "../sprintService";
import { storyService } from "../storyService";
import { CreateVersionDialog } from "./CreateVersionDialog";
import { CreateEpicDialog } from "./CreateEpicDialog";
import { CreateSprintDialog } from "./CreateSprintDialog";
import { EditVersionDialog } from "./EditVersionDialog";
import { EditEpicDialog } from "./EditEpicDialog";
import { EditSprintDialog } from "./EditSprintDialog";
import { hubCopyForRuntime, isBrowserDemo } from "../../../lib/browserDemoChrome";
import { VersionIncludedSummary } from "./VersionIncludedSummary";
import { HubEntityCard } from "./HubEntityCard";
import type { HubBoardNavigationState } from "../hubBoardNavigation";

export function ProjectHubPage() {
  const copy = hubCopyForRuntime();
  const demoChrome = isBrowserDemo();
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [epics, setEpics] = useState<{ id: string; title: string }[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [versionStories, setVersionStories] = useState<StorySummary[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  /** Optional epic filter — narrows visible sprints and board navigation. */
  const [epicFilterId, setEpicFilterId] = useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [showCreateEpic, setShowCreateEpic] = useState(false);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [editVersion, setEditVersion] = useState<Version | null>(null);
  const [editEpic, setEditEpic] = useState<Epic | null>(null);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [proj, vers] = await Promise.all([
        projectService.get(projectId),
        versionService.list(projectId),
      ]);
      setProject(proj);
      setVersions(vers);
      await projectService.setLastProjectId(projectId);
      setSelectedVersionId((prev) => {
        if (prev && vers.some((v) => v.id === prev)) return prev;
        if (vers.length === 0) return null;
        if (vers.length === 1) return vers[0].id;
        const active = vers.find((v) => v.status === "active") ?? vers[vers.length - 1];
        return active.id;
      });
    } catch (err) {
      setProject(null);
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadVersionContext = useCallback(async () => {
    if (!projectId || !selectedVersionId) {
      setEpics([]);
      setSprints([]);
      setVersionStories([]);
      setEpicFilterId(null);
      setSelectedSprintId(null);
      return;
    }
    const [eps, sprs, stories] = await Promise.all([
      epicService.listForVersion(projectId, selectedVersionId),
      sprintService.list(projectId, selectedVersionId),
      storyService.list(projectId, { versionId: selectedVersionId }),
    ]);
    setEpics(eps);
    setSprints(sprs);
    setVersionStories(stories);
    setEpicFilterId((prev) => (prev && eps.some((e) => e.id === prev) ? prev : null));
    setSelectedSprintId((prev) => {
      if (prev && sprs.some((s) => s.id === prev)) return prev;
      if (sprs.length === 1) return sprs[0].id;
      return null;
    });
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

  const epicFilter = useMemo(
    () => epics.find((e) => e.id === epicFilterId) ?? null,
    [epics, epicFilterId],
  );

  const boardNavState = useMemo((): HubBoardNavigationState => ({
    boardFilters: {
      versionId: selectedVersionId,
      epicId: epicFilterId,
    },
  }), [selectedVersionId, epicFilterId]);

  const refresh = () => {
    void load();
    void loadVersionContext();
  };

  const visibleSprints = useMemo(() => {
    if (!epicFilterId) return sprints;
    const sprintIds = new Set(
      versionStories
        .filter((st) => st.epic_id === epicFilterId && st.sprint_id)
        .map((st) => st.sprint_id as string),
    );
    return sprints.filter((s) => sprintIds.has(s.id));
  }, [sprints, versionStories, epicFilterId]);

  useEffect(() => {
    setSelectedSprintId((prev) => {
      if (prev && visibleSprints.some((s) => s.id === prev)) return prev;
      if (visibleSprints.length === 1) return visibleSprints[0].id;
      return null;
    });
  }, [epicFilterId, visibleSprints]);

  const selectedSprint = useMemo(
    () => visibleSprints.find((s) => s.id === selectedSprintId) ?? null,
    [visibleSprints, selectedSprintId],
  );

  const openSprintBoard = async (sprintId: string) => {
    await sprintService.setLastSprintId(projectId, sprintId);
    navigate(`/projects/${projectId}/sprints/${sprintId}`, { state: boardNavState });
  };

  const openEditEpic = async (epicId: string) => {
    const all = await epicService.list(projectId);
    const full = all.find((e) => e.id === epicId);
    if (full) setEditEpic(full);
  };

  if (loading) {
    return (
      <main className="trello-workspace flex min-h-screen items-center justify-center text-[var(--trello-text-secondary)]">
        {copy.loadingProject}
      </main>
    );
  }

  if (!project) {
    return (
      <main className="trello-workspace flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-semibold text-[var(--trello-text-primary)]">{copy.projectNotFound}</p>
        <p className="max-w-md text-sm text-[var(--trello-text-secondary)]">
          {error ?? copy.projectNotFoundHint}
        </p>
        <Link
          to="/projects"
          state={{ showWorkspace: true }}
          className="trello-btn-primary mt-2 px-4 py-2 text-sm"
        >
          {copy.backToProjects}
        </Link>
      </main>
    );
  }

  const statusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active" || s === "complete") return "hub-panel__badge hub-panel__badge--positive";
    if (s === "planned") return "hub-panel__badge hub-panel__badge--muted";
    return "hub-panel__badge";
  };

  const breadcrumb = [
    project.name,
    selectedVersion?.id,
    epicFilterId ?? undefined,
    selectedSprint?.id,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <main
      className={`trello-workspace project-workspace min-h-screen px-4 py-6 md:px-8 md:py-8 ${demoChrome ? "demo-hub-page" : ""}`}
    >
      <div className="project-workspace__inner mx-auto max-w-[90rem]">
        <header className="project-workspace__header">
          <div className="project-workspace__header-top">
            <Link
              to="/projects"
              state={{ showWorkspace: true }}
              className="project-workspace__back"
            >
              {copy.backProjects}
            </Link>
          </div>
          <h1 className="project-workspace__title">{project.name}</h1>
          {project.description && (
            <p className="project-workspace__desc">{project.description}</p>
          )}
          {breadcrumb && (
            <p className="project-workspace__trail" aria-label="Context">
              {breadcrumb.split(" / ").map((part, i) => (
                <span key={`${part}-${i}`}>
                  {i > 0 && <span className="project-workspace__trail-sep">/</span>}
                  <span className="project-workspace__trail-part">{part}</span>
                </span>
              ))}
            </p>
          )}
        </header>

        {error && <p className="project-workspace__error">{error}</p>}

        <div className="project-workspace__grid">
          <nav className="project-workspace__versions" aria-label={copy.versions}>
            <div className="project-workspace__panel-head">
              <h2 className="project-workspace__panel-title">{copy.versions}</h2>
              <button
                type="button"
                className="project-workspace__add-btn"
                onClick={() => setShowCreateVersion(true)}
              >
                {copy.addNewF}
              </button>
            </div>
            <ul className="project-workspace__version-list">
              {versions.map((v) => (
                <li key={v.id}>
                  <HubEntityCard
                    active={selectedVersionId === v.id}
                    layout="stack"
                    onSelect={() => {
                      setSelectedVersionId(v.id);
                      setEpicFilterId(null);
                      setSelectedSprintId(null);
                    }}
                    onEdit={() => setEditVersion(v)}
                    editAriaLabel={copy.editVersion}
                    editText={copy.editShort}
                  >
                    <span className="hub-card__id">{v.id}</span>
                    <span className="hub-card__title">{v.title}</span>
                    <span className={statusBadgeClass(v.status)}>{v.status}</span>
                  </HubEntityCard>
                </li>
              ))}
            </ul>
          </nav>

          <section className="project-workspace__main">
            <div className="project-workspace__panel-head">
              <h2 className="project-workspace__panel-title">{copy.sprints}</h2>
              <button
                type="button"
                className="project-workspace__add-btn"
                disabled={!selectedVersionId}
                onClick={() => setShowCreateSprint(true)}
              >
                {copy.addNewM}
              </button>
            </div>

            {!selectedVersionId ? (
              <p className="project-workspace__empty">{copy.selectVersion}</p>
            ) : (
              <>
                <div className="hub-epic-filter project-workspace__epic-bar">
                  <p className="hub-epic-filter__label">{copy.epicFilterLabel}</p>
                  <div className="hub-epic-filter__pills" role="group" aria-label={copy.epicFilterLabel}>
                    <button
                      type="button"
                      className={`hub-epic-filter__pill ${epicFilterId === null ? "hub-epic-filter__pill--active" : ""}`}
                      onClick={() => setEpicFilterId(null)}
                    >
                      {copy.epicFilterAll}
                    </button>
                    {epics.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        className={`hub-epic-filter__pill ${epicFilterId === e.id ? "hub-epic-filter__pill--active" : ""}`}
                        onClick={() => setEpicFilterId(e.id)}
                        title={e.title}
                      >
                        {e.id}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="hub-epic-filter__pill hub-epic-filter__pill--add"
                      onClick={() => setShowCreateEpic(true)}
                      aria-label={copy.addNewM}
                    >
                      ＋
                    </button>
                  </div>
                  <p className="hub-epic-filter__hint">{copy.epicFilterHint}</p>
                  {epics.length > 0 && (
                    <details className="project-workspace__epic-details">
                      <summary>{copy.manageEpics}</summary>
                      <ul className="hub-epic-filter__manage">
                        {epics.map((e) => (
                          <li key={e.id}>
                            <span className="hub-epic-filter__manage-id">{e.id}</span>
                            <span className="hub-epic-filter__manage-title">{e.title}</span>
                            <button
                              type="button"
                              className="hub-epic-filter__manage-edit"
                              onClick={() => void openEditEpic(e.id)}
                            >
                              {copy.editShort}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>

                <ul className="project-workspace__sprint-grid">
                  {visibleSprints.map((s) => (
                    <li key={s.id}>
                      <HubEntityCard
                        active={selectedSprintId === s.id}
                        layout="stack"
                        onSelect={() => setSelectedSprintId(s.id)}
                        onEdit={() => setEditSprint(s)}
                        editAriaLabel={copy.editSprint}
                        editText={copy.editShort}
                      >
                        <span className="hub-card__id">{s.id}</span>
                        <span className="hub-card__title">{s.title}</span>
                        <span className={statusBadgeClass(s.status)}>{s.status}</span>
                      </HubEntityCard>
                    </li>
                  ))}
                </ul>
                {sprints.length === 0 && (
                  <p className="project-workspace__empty">{copy.noSprints}</p>
                )}
                {sprints.length > 0 && epicFilterId && visibleSprints.length === 0 && (
                  <p className="project-workspace__empty">{copy.noSprintsForEpic(epicFilterId)}</p>
                )}
              </>
            )}
          </section>

          <aside className="project-workspace__aside hub-context-panel">
            <h2 className="hub-context-panel__title">{copy.versionContext}</h2>
            {selectedVersionId ? (
              <>
                <VersionIncludedSummary projectId={projectId} versionId={selectedVersionId} />
                {selectedSprint && (
                  <p className="hub-context-panel__selection text-sm text-[var(--trello-text-secondary)]">
                    <span className="font-semibold text-[var(--trello-text-primary)]">
                      {selectedSprint.id}
                    </span>
                    {epicFilter && (
                      <span className="text-[var(--trello-text-muted)]"> · {epicFilter.id}</span>
                    )}
                  </p>
                )}
                <div className="hub-context-panel__actions">
                  <button
                    type="button"
                    className="trello-btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-50"
                    disabled={!selectedSprintId}
                    onClick={() => selectedSprintId && void openSprintBoard(selectedSprintId)}
                  >
                    {copy.openSprintBoard}
                  </button>
                  <button
                    type="button"
                    className="hub-context-panel__secondary-btn w-full"
                    onClick={() =>
                      navigate(`/projects/${projectId}/board`, { state: boardNavState })
                    }
                  >
                    {copy.allStoriesBoard}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--trello-text-muted)]">{copy.selectVersionScope}</p>
            )}
          </aside>
        </div>
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
