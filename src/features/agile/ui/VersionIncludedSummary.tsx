import { useEffect, useState } from "react";
import type { VersionIncluded } from "../../../domain/agileTypes";
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

  if (!versionId) {
    return (
      <p className="text-sm text-[var(--trello-text-muted)]">
        Selecione uma versão para ver o escopo incluído (derivado do banco).
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!included) {
    return <p className="text-sm text-[var(--trello-text-muted)]">Carregando…</p>;
  }

  return (
    <div className="us-included-summary">
      <p className="us-included-summary__meta">
        {included.epics.length} épico(s) · {included.sprint_count} sprint(s) ·{" "}
        {included.story_count} US
      </p>
      {included.epics.length === 0 ? (
        <p className="text-sm text-[var(--trello-text-muted)]">
          Nenhum épico vinculado ainda — vincule na criação/edição do épico.
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
