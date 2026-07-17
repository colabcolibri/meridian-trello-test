import type { Epic, Sprint, Version } from "../../../domain/agileTypes";
import { useAgileBoardFilters } from "../context/AgileBoardFilterContext";

export function AgileBoardFilterBar({
  versions,
  epics,
  sprints,
  storyCount,
}: {
  versions: Version[];
  epics: Epic[];
  sprints: Sprint[];
  storyCount: number;
}) {
  const { versionId, epicId, sprintId, setVersionId, setEpicId, setSprintId } =
    useAgileBoardFilters();

  const filteredSprints = versionId
    ? sprints.filter((s) => s.version_id === versionId)
    : sprints;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-white/20 px-4 py-2 md:px-5">
      <span className="text-xs font-medium text-white/80">{storyCount} stories</span>
      <select
        className="rounded border-0 bg-white/90 px-2 py-1 text-xs text-[var(--trello-text-primary)]"
        value={versionId ?? ""}
        onChange={(e) => setVersionId(e.target.value || null)}
        aria-label="Filter version"
      >
        <option value="">All versions</option>
        {versions.map((v) => (
          <option key={v.id} value={v.id}>
            {v.id} — {v.title}
          </option>
        ))}
      </select>
      <select
        className="rounded border-0 bg-white/90 px-2 py-1 text-xs text-[var(--trello-text-primary)]"
        value={epicId ?? ""}
        onChange={(e) => setEpicId(e.target.value || null)}
        aria-label="Filter epic"
      >
        <option value="">All epics</option>
        {epics.map((e) => (
          <option key={e.id} value={e.id}>
            {e.id} — {e.title}
          </option>
        ))}
      </select>
      <select
        className="rounded border-0 bg-white/90 px-2 py-1 text-xs text-[var(--trello-text-primary)]"
        value={sprintId ?? ""}
        onChange={(e) => setSprintId(e.target.value || null)}
        aria-label="Filter sprint"
      >
        <option value="">All sprints</option>
        {filteredSprints.map((s) => (
          <option key={s.id} value={s.id}>
            {s.id} — {s.title}
          </option>
        ))}
      </select>
    </div>
  );
}
