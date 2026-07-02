import { useEffect, useMemo, useState } from "react";
import type { Epic, Sprint, Version } from "../../../domain/agileTypes";
import { epicService } from "../epicService";
import { sprintService } from "../sprintService";
import { versionService } from "../versionService";

export function useStoryRelationOptions(projectId: string, versionId: string) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [epics, setEpics] = useState<Pick<Epic, "id" | "title">[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const vers = await versionService.list(projectId);
        if (cancelled) return;
        setVersions(vers);
        if (!versionId) {
          setEpics([]);
          setSprints([]);
          return;
        }
        const [eps, sprs] = await Promise.all([
          epicService.listForVersion(projectId, versionId),
          sprintService.list(projectId, versionId),
        ]);
        if (cancelled) return;
        setEpics(eps);
        setSprints(sprs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, versionId]);

  const sprintVersionMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sprints) map.set(s.id, s.version_id);
    return map;
  }, [sprints]);

  const epicVersionIds = useMemo(
    () => (versionId ? epics.map(() => versionId) : []),
    [epics, versionId],
  );

  return { versions, epics, sprints, epicVersionIds, sprintVersionMap, loading };
}
