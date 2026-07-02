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
  const hasMeta =
    card.tags.length > 0 ||
    card.priority ||
    card.due_date ||
    card.checklist_total > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`trello-card w-full text-left ${
        isOverlay ? "trello-card-overlay cursor-grabbing" : "cursor-pointer"
      } ${isOverlay ? "p-3" : "p-2.5"}`}
    >
      {card.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white"
              style={{ backgroundColor: tag.color }}
              title={tag.name}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm leading-snug text-[var(--trello-text-primary)]">{card.title}</p>

      {hasMeta && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-[#091e4214] pt-2">
          {card.due_date && (
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${
                overdue
                  ? "bg-red-100 text-red-800"
                  : "bg-[#091e4214] text-[var(--trello-text-secondary)]"
              }`}
              title={overdue ? "Overdue" : "Due date"}
            >
              <span aria-hidden>📅</span>
              {formatDueDate(card.due_date)}
            </span>
          )}
          {card.priority && (
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[card.priority] ?? ""}`}
            >
              <span aria-hidden>⚑</span>
              {PRIORITY_LABELS[card.priority] ?? card.priority}
            </span>
          )}
          {card.checklist_total > 0 && (
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${
                card.checklist_done === card.checklist_total
                  ? "bg-green-100 text-green-800"
                  : "bg-[#091e4214] text-[var(--trello-text-secondary)]"
              }`}
            >
              <span aria-hidden>☑</span>
              {card.checklist_done}/{card.checklist_total}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
