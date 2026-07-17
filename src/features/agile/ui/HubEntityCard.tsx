import type { ReactNode } from "react";

export function HubEntityCard({
  active,
  onSelect,
  onEdit,
  editAriaLabel,
  editText,
  children,
  layout = "row",
}: {
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  editAriaLabel: string;
  editText: string;
  children: ReactNode;
  layout?: "row" | "stack";
}) {
  return (
    <div className={`hub-card hub-card--${layout} ${active ? "hub-card--active" : ""}`}>
      <button type="button" className="hub-card__body" onClick={onSelect}>
        {children}
      </button>
      <button
        type="button"
        className="hub-card__edit"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        aria-label={editAriaLabel}
      >
        {editText}
      </button>
    </div>
  );
}
