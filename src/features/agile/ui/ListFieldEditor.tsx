import type { ChecklistItem } from "../../../domain/agileTypes";

export function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel = "＋ Add item",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const update = (index: number, value: string) => {
    onChange(items.map((row, i) => (i === index ? value : row)));
  };
  const remove = (index: number) => {
    onChange(items.length <= 1 ? [""] : items.filter((_, i) => i !== index));
  };
  const add = () => onChange([...items, ""]);

  return (
    <div className="us-list-editor">
      {items.map((row, index) => (
        <div key={index} className="us-list-editor__row">
          <span className="us-list-editor__bullet">•</span>
          <input
            type="text"
            className="us-control us-control--input"
            value={row}
            placeholder={placeholder}
            onChange={(e) => update(index, e.target.value)}
          />
          <button
            type="button"
            className="us-btn-ghost shrink-0 px-2"
            onClick={() => remove(index)}
            aria-label="Remove item"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="us-btn-link" onClick={add}>
        {addLabel}
      </button>
    </div>
  );
}

export function ChecklistEditor({
  items,
  onChange,
  placeholder,
  addLabel = "＋ Add item",
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const update = (index: number, patch: Partial<ChecklistItem>) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const remove = (index: number) => {
    onChange(items.length <= 1 ? [{ label: "", done: false }] : items.filter((_, i) => i !== index));
  };
  const add = () => onChange([...items, { label: "", done: false }]);

  return (
    <div className="us-list-editor">
      {items.map((row, index) => (
        <div key={index} className="us-list-editor__row us-list-editor__row--check">
          <input
            type="checkbox"
            checked={row.done}
            onChange={(e) => update(index, { done: e.target.checked })}
            aria-label={`Mark item ${index + 1}`}
          />
          <input
            type="text"
            className="us-control us-control--input"
            value={row.label}
            placeholder={placeholder}
            onChange={(e) => update(index, { label: e.target.value })}
          />
          <button
            type="button"
            className="us-btn-ghost shrink-0 px-2"
            onClick={() => remove(index)}
            aria-label="Remove item"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="us-btn-link" onClick={add}>
        {addLabel}
      </button>
    </div>
  );
}

export function AcceptanceEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <StringListEditor
      items={items}
      onChange={onChange}
      placeholder="Verifiable criterion (demo, file, command)…"
      addLabel="＋ Add criterion"
    />
  );
}
