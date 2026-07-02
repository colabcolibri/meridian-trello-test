import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { StoryFilters } from "../../../domain/agileTypes";

interface AgileBoardFilterState {
  versionId: string | null;
  epicId: string | null;
  sprintId: string | null;
  setVersionId: (id: string | null) => void;
  setEpicId: (id: string | null) => void;
  setSprintId: (id: string | null) => void;
  filters: StoryFilters;
}

const AgileBoardFilterContext = createContext<AgileBoardFilterState | null>(null);

export function AgileBoardFilterProvider({
  initialSprintId,
  children,
}: {
  initialSprintId?: string | null;
  children: ReactNode;
}) {
  const [versionId, setVersionId] = useState<string | null>(null);
  const [epicId, setEpicId] = useState<string | null>(null);
  const [sprintId, setSprintId] = useState<string | null>(initialSprintId ?? null);

  const value = useMemo(
    () => ({
      versionId,
      epicId,
      sprintId,
      setVersionId,
      setEpicId,
      setSprintId,
      filters: {
        versionId: versionId || undefined,
        epicId: epicId || undefined,
        sprintId: sprintId || undefined,
      },
    }),
    [versionId, epicId, sprintId],
  );

  return (
    <AgileBoardFilterContext.Provider value={value}>{children}</AgileBoardFilterContext.Provider>
  );
}

export function useAgileBoardFilters() {
  const ctx = useContext(AgileBoardFilterContext);
  if (!ctx) throw new Error("useAgileBoardFilters must be used within AgileBoardFilterProvider");
  return ctx;
}
