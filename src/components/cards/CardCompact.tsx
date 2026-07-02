import { PRIORITY_COLORS, PRIORITY_LABELS } from "../../domain/constants";
import { formatDueDate, isOverdue } from "../../domain/dates";
import type { CardSummary } from "../../domain/types";

interface CardCompactProps {
  card: CardSummary;
  onClick: () => void;
  variant?: "default" | "overlay";
}

export function CardCompact({ card, onClick, variant = "default" }: CardCompactProps) {
  const overdue = isOverdue(card.due_date);
  const isOverlay = variant === "overlay";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`trello-card w-full text-left ${
        isOverlay ? "trello-card-overlay cursor-grabbing" : "cursor-pointer"
      } ${isOverlay ? "p-3" : "p-2 pb-2"}`}
    >
      {card.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="trello-label-strip"
              style={{ backgroundColor: tag.color }}
              title={tag.name}
            />
          ))}
        </div>
      )}

      <p className="px-0.5 text-sm leading-snug text-[var(--trello-text-primary)]">
        {card.title}
      </p>

      {(card.priority || card.due_date || card.checklist_total > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 px-0.5 text-xs text-[var(--trello-text-muted)]">
          {card.priority && (
            <span
              className={`rounded px-1.5 py-0.5 font-medium ${PRIORITY_COLORS[card.priority] ?? ""}`}
            >
              {PRIORITY_LABELS[card.priority] ?? card.priority}
            </span>
          )}
          {card.due_date && (
            <span
              className={`rounded px-1.5 py-0.5 ${
                overdue
                  ? "bg-red-100 font-medium text-red-700"
                  : "bg-[#091e420f] text-[var(--trello-text-secondary)]"
              }`}
            >
              {formatDueDate(card.due_date)}
            </span>
          )}
          {card.checklist_total > 0 && (
            <span className="flex items-center gap-1">
              <span aria-hidden>☑</span>
              {card.checklist_done}/{card.checklist_total}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
