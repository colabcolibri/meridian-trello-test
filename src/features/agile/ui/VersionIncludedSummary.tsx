import { useEffect, useState } from "react";
import type { VersionIncluded } from "../../../domain/agileTypes";
import { includedCopyForRuntime } from "../../../lib/browserDemoChrome";
import { versionService } from "../versionService";

export function VersionIncludedSummary({
  projectId,
  versionId,
}: {
  projectId: string;
  versionId: string | null;
}) {
  const [included, setIncluded] = useState<VersionIncluded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!versionId) {
      setIncluded(null);
      return;
    }
    void versionService
      .getIncluded(projectId, versionId)
      .then(setIncluded)
      .catch((err) => setError(String(err)));
  }, [projectId, versionId]);

  const copy = includedCopyForRuntime();

  if (!versionId) {
    return (
      <p className="text-sm text-[var(--trello-text-muted)]">
        {copy.selectVersion}
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!included) {
    return <p className="text-sm text-[var(--trello-text-muted)]">{copy.loading}</p>;
  }

  return (
    <div className="us-included-summary">
      <p className="us-included-summary__meta">
        {copy.meta(included.epics.length, included.sprint_count, included.story_count)}
      </p>
      {included.epics.length === 0 ? (
        <p className="text-sm text-[var(--trello-text-muted)]">
          {copy.noEpics}
        </p>
      ) : (
        <ul className="us-included-summary__list">
          {included.epics.map((e) => (
            <li key={e.id}>
              <span className="font-semibold">{e.id}</span>
              <span className="text-[var(--trello-text-secondary)]"> — {e.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
