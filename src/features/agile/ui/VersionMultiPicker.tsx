import type { Version } from "../../../domain/agileTypes";
import { UsField } from "./UsFormFields";

export function VersionMultiPicker({
  versions,
  selectedIds,
  onToggle,
  required,
}: {
  versions: Version[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  required?: boolean;
}) {
  return (
    <UsField
      label="Versões"
      required={required}
      hint="Versões onde este épico será entregue."
    >
      <div className="us-version-picker">
        {versions.length === 0 && (
          <p className="text-sm text-[var(--trello-text-muted)]">Crie uma versão primeiro.</p>
        )}
        {versions.map((v) => (
          <label key={v.id} className="us-version-picker__item">
            <input
              type="checkbox"
              checked={selectedIds.includes(v.id)}
              onChange={() => onToggle(v.id)}
            />
            <span>
              {v.id} — {v.title}
            </span>
          </label>
        ))}
      </div>
    </UsField>
  );
}
