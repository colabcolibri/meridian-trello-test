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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Project, StorySummary, WorkflowColumn } from "../../../domain/agileTypes";
import { IN_PROGRESS_COLUMN, READY_BADGE_COLUMN } from "../../../domain/agileConstants";
import { projectService } from "../projectService";
import { sprintService } from "../sprintService";
import { storyService } from "../storyService";
import { workflowService } from "../workflowService";
import { versionService } from "../versionService";
import { epicService } from "../epicService";
import { AgileBoardFilterBar } from "./AgileBoardFilterBar";
import { CreateUsDialog } from "./CreateUsDialog";
import { UsCardMeridian } from "./UsCardMeridian";
import { UsStoryModal } from "./UsStoryModal";
import {
  AgileBoardFilterProvider,
  useAgileBoardFilters,
} from "../context/AgileBoardFilterContext";

function SortableStory({
  story,
  onOpen,
}: {
  story: StorySummary;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: story.id, data: { type: "story", columnId: story.workflow_column_id } });

  const style = { transform: CSS.Transform.toString(transform), transition };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="trello-drag-placeholder" aria-hidden />;
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative rounded-lg" {...attributes}>
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...listeners}
        className="absolute right-1 top-1 z-10 cursor-grab rounded px-1 py-0.5 text-xs text-[var(--trello-text-muted)] opacity-0 transition hover:bg-[#091e4214] group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag story"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </button>
      <UsCardMeridian story={story} onClick={() => onOpen(story.id)} />
    </div>
  );
}

function WorkflowColumnPanel({
  column,
  stories,
  onOpenStory,
  onRequestCreate,
}: {
  column: WorkflowColumn;
  stories: StorySummary[];
  onOpenStory: (id: string) => void;
  onRequestCreate: (columnId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  const isBacklog = column.name === "Backlog";

  return (
    <div
      className={`kanban-column trello-column flex shrink-0 flex-col p-2 ${isOver ? "is-drop-target" : ""}`}
    >
      <h2 className="mb-2 px-1 text-sm font-semibold text-[var(--trello-text-primary)]">
        {column.name}
        <span className="ml-1.5 font-normal text-[var(--trello-text-muted)]">{stories.length}</span>
      </h2>
      <SortableContext items={stories.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex min-h-[8px] flex-1 flex-col gap-2 overflow-y-auto pb-1">
          {stories.map((story) => (
            <SortableStory key={story.id} story={story} onOpen={onOpenStory} />
          ))}
        </div>
      </SortableContext>
      {isBacklog && (
        <div className="mt-1 px-0.5">
          <button
            type="button"
            className="us-add-card-btn"
            onClick={() => onRequestCreate(column.id)}
          >
            ＋ New user story
          </button>
        </div>
      )}
    </div>
  );
}

function AgileBoardInner() {
  const { projectId = "", sprintId: routeSprintId = "" } = useParams();
  const { filters, setSprintId } = useAgileBoardFilters();
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<WorkflowColumn[]>([]);
  const [storiesByColumn, setStoriesByColumn] = useState<Record<string, StorySummary[]>>({});
  const [allStories, setAllStories] = useState<StorySummary[]>([]);
  const [versions, setVersions] = useState<Awaited<ReturnType<typeof versionService.list>>>([]);
  const [epics, setEpics] = useState<Awaited<ReturnType<typeof epicService.list>>>([]);
  const [sprints, setSprints] = useState<Awaited<ReturnType<typeof sprintService.list>>>([]);
  const [activeStory, setActiveStory] = useState<StorySummary | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [moveNotice, setMoveNotice] = useState<string | null>(null);
  const dragStartColumnRef = useRef<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columnById = useMemo(() => {
    const map: Record<string, WorkflowColumn> = {};
    for (const col of columns) map[col.id] = col;
    return map;
  }, [columns]);

  useEffect(() => {
    if (routeSprintId) setSprintId(routeSprintId);
  }, [routeSprintId, setSprintId]);

  const loadAll = useCallback(async () => {
    if (!projectId) return;
    const [proj, cols, vers, eps, sprs, stories] = await Promise.all([
      projectService.get(projectId),
      workflowService.listColumns(projectId),
      versionService.list(projectId),
      epicService.list(projectId),
      sprintService.list(projectId),
      storyService.list(projectId, filters),
    ]);
    setProject(proj);
    setColumns(cols);
    setVersions(vers);
    setEpics(eps);
    setSprints(sprs);
    setAllStories(stories);
    const grouped: Record<string, StorySummary[]> = {};
    for (const col of cols) grouped[col.id] = [];
    for (const story of stories) {
      if (!grouped[story.workflow_column_id]) grouped[story.workflow_column_id] = [];
      grouped[story.workflow_column_id].push(story);
    }
    for (const colId of Object.keys(grouped)) {
      grouped[colId].sort((a, b) => a.order_index - b.order_index);
    }
    setStoriesByColumn(grouped);
    await projectService.setLastProjectId(projectId);
    if (routeSprintId) await sprintService.setLastSprintId(projectId, routeSprintId);
  }, [projectId, filters, routeSprintId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const findColumnOfStory = useCallback(
    (storyId: string) => {
      for (const [colId, stories] of Object.entries(storiesByColumn)) {
        if (stories.some((s) => s.id === storyId)) return colId;
      }
      return null;
    },
    [storiesByColumn],
  );

  const resolveOverColumn = useCallback(
    (overId: string, over: DragOverEvent["over"]) => {
      const data = over?.data.current;
      if (data?.type === "column") return data.columnId as string;
      if (data?.type === "story") return data.columnId as string;
      if (columns.some((c) => c.id === overId)) return overId;
      return findColumnOfStory(overId);
    },
    [columns, findColumnOfStory],
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeColumn = findColumnOfStory(activeId);
    const overColumn = resolveOverColumn(overId, over);
    if (!activeColumn || !overColumn) return;

    setStoriesByColumn((prev) => {
      const source = [...(prev[activeColumn] ?? [])];
      const activeIndex = source.findIndex((s) => s.id === activeId);
      if (activeIndex === -1) return prev;

      if (activeColumn === overColumn) {
        const overIndex = source.findIndex((s) => s.id === overId);
        if (overIndex === -1 || activeIndex === overIndex) return prev;
        return { ...prev, [activeColumn]: arrayMove(source, activeIndex, overIndex) };
      }

      const target = [...(prev[overColumn] ?? [])];
      const [moved] = source.splice(activeIndex, 1);
      let insertIndex = target.findIndex((s) => s.id === overId);
      if (insertIndex === -1) insertIndex = target.length;
      target.splice(insertIndex, 0, { ...moved, workflow_column_id: overColumn });
      return { ...prev, [activeColumn]: source, [overColumn]: target };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStory(null);
    if (!over) {
      dragStartColumnRef.current = null;
      await loadAll();
      return;
    }

    const activeId = String(active.id);
    const endColumn = findColumnOfStory(activeId);
    const startColumn = dragStartColumnRef.current;
    dragStartColumnRef.current = null;
    if (!endColumn) {
      await loadAll();
      return;
    }

    const endStories = storiesByColumn[endColumn] ?? [];
    const storyIndex = endStories.findIndex((s) => s.id === activeId);
    if (storyIndex === -1) {
      await loadAll();
      return;
    }

    const movedStory = endStories[storyIndex];
    const targetColumn = columnById[endColumn];
    if (
      targetColumn?.name === IN_PROGRESS_COLUMN &&
      !movedStory.ready &&
      startColumn !== endColumn
    ) {
      setMoveNotice(
        `${movedStory.id} moved to ${IN_PROGRESS_COLUMN} without ready — mark ready in the ${READY_BADGE_COLUMN} column before implementation.`,
      );
    }

    try {
      await storyService.move(projectId, activeId, endColumn, storyIndex);
      await storyService.reorder(
        projectId,
        endColumn,
        endStories.map((s) => s.id),
      );
      if (startColumn && startColumn !== endColumn) {
        const startStories = storiesByColumn[startColumn] ?? [];
        if (startStories.length > 0) {
          await storyService.reorder(
            projectId,
            startColumn,
            startStories.map((s) => s.id),
          );
        }
      }
      await loadAll();
    } catch {
      await loadAll();
    }
  };

  const filteredCount = useMemo(() => allStories.length, [allStories]);

  if (!project) {
    return (
      <main className="trello-board-shell flex min-h-screen items-center justify-center text-white/90">
        Loading board…
      </main>
    );
  }

  return (
    <div className="trello-board-shell flex min-h-screen flex-col">
      <header className="trello-board-header flex flex-wrap items-center gap-3 px-4 py-3 md:px-5">
        <Link to={`/projects/${projectId}`} className="text-sm font-medium">
          ← {project.name}
        </Link>
        <h1 className="text-base font-semibold md:text-lg">
          Meridian story board{routeSprintId ? ` · ${routeSprintId}` : ""}
        </h1>
        {columns.some((c) => c.name === "Backlog") && (
          <button
            type="button"
            className="ml-auto rounded-md bg-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/30"
            onClick={() => {
              const backlog = columns.find((c) => c.name === "Backlog");
              if (backlog) setCreateColumnId(backlog.id);
            }}
          >
            ＋ New user story
          </button>
        )}
      </header>

      {moveNotice && (
        <div className="mx-4 mb-2 flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 md:mx-5">
          <span>{moveNotice}</span>
          <button type="button" className="shrink-0 text-amber-700" onClick={() => setMoveNotice(null)}>
            ✕
          </button>
        </div>
      )}

      <AgileBoardFilterBar
        versions={versions}
        epics={epics}
        sprints={sprints}
        storyCount={filteredCount}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => {
          const col = findColumnOfStory(String(active.id));
          dragStartColumnRef.current = col;
          if (col) {
            const story = storiesByColumn[col]?.find((s) => s.id === active.id);
            if (story) setActiveStory(story);
          }
        }}
        onDragOver={handleDragOver}
        onDragEnd={(e) => void handleDragEnd(e)}
        onDragCancel={() => {
          setActiveStory(null);
          dragStartColumnRef.current = null;
          void loadAll();
        }}
      >
        <div className="kanban-scroll flex flex-1 gap-3 overflow-x-auto overflow-y-hidden px-4 pb-4 pt-2 md:px-5">
          {columns.map((column) => (
            <WorkflowColumnPanel
              key={column.id}
              column={column}
              stories={storiesByColumn[column.id] ?? []}
              onOpenStory={setSelectedStoryId}
              onRequestCreate={setCreateColumnId}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
          {activeStory ? (
            <div className="w-[256px]">
              <UsCardMeridian story={activeStory} onClick={() => {}} variant="overlay" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {createColumnId && (
        <CreateUsDialog
          projectId={projectId}
          workflowColumnId={createColumnId}
          defaultVersionId={filters.versionId}
          defaultEpicId={filters.epicId}
          defaultSprintId={filters.sprintId ?? routeSprintId ?? null}
          onClose={() => setCreateColumnId(null)}
          onCreated={() => void loadAll()}
        />
      )}

      {selectedStoryId && (
        <UsStoryModal
          projectId={projectId}
          storyId={selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
          onChanged={() => void loadAll()}
        />
      )}
    </div>
  );
}

export function AgileBoardView() {
  const { sprintId } = useParams();
  return (
    <AgileBoardFilterProvider initialSprintId={sprintId ?? null}>
      <AgileBoardInner />
    </AgileBoardFilterProvider>
  );
}
