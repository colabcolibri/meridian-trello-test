import type { StorySummary } from "../../../domain/agileTypes";
import {
  DEFAULT_AS_ROLE,
  MOSCOW_CLASS,
  MOSCOW_LABELS,
  READY_BADGE_COLUMN,
  STATUS_CLASS,
} from "../../../domain/agileConstants";

function truncate(text: string | null | undefined, max: number): string {
  if (!text?.trim()) return "…";
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export function UsCardMeridian({
  story,
  onClick,
  variant = "default",
}: {
  story: StorySummary;
  onClick: () => void;
  variant?: "default" | "overlay";
}) {
  const showReadyHighlight =
    story.ready && story.workflow_column_name === READY_BADGE_COLUMN;
  const showReadyMuted = story.ready && story.workflow_column_name !== READY_BADGE_COLUMN;

  const asRole = story.as_role?.trim() || DEFAULT_AS_ROLE;
  const iWant = story.i_want?.trim() || "…";
  const soThat = story.so_that?.trim() || "…";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`us-card ${variant === "overlay" ? "us-card--overlay" : ""}`}
    >
      <div className="us-card__header">
        <span className="us-card__id">{story.id}</span>
        {story.version_id && (
          <span className="us-card__badge bg-[#091e420f] text-[var(--trello-text-secondary)]">
            {story.version_id}
          </span>
        )}
        {story.epic_id && (
          <span className="us-card__badge bg-indigo-50 text-indigo-800">{story.epic_id}</span>
        )}
        <span className={`us-card__badge ${MOSCOW_CLASS[story.moscow]}`}>
          {MOSCOW_LABELS[story.moscow]}
        </span>
        {story.ready && (
          <span
            className={`us-card__badge bg-emerald-50 text-emerald-800 ${
              showReadyMuted ? "us-card__ready--muted" : ""
            } ${showReadyHighlight ? "ring-1 ring-emerald-300" : ""}`}
          >
            ready
          </span>
        )}
        <span className={`us-card__status ${STATUS_CLASS[story.status]}`}>{story.status}</span>
      </div>

      <p className="us-card__preamble hidden min-[1024px]:block">
        <strong>As</strong> {truncate(asRole, 40)}, <strong>I want</strong> {truncate(iWant, 80)},{" "}
        <strong>so that</strong> {truncate(soThat, 80)}
      </p>

      <p className="us-card__preamble min-[1024px]:hidden">
        <strong>I want</strong> {truncate(iWant, 100)}
      </p>

      {story.why?.trim() && (
        <div className="us-card__why">
          <div className="us-card__section-label">Why</div>
          <p className="line-clamp-2">{story.why.trim()}</p>
        </div>
      )}

      {story.done_when?.trim() && (
        <div className="us-card__done-when">
          <div className="us-card__section-label">Done when</div>
          <p className="line-clamp-2">{story.done_when.trim()}</p>
        </div>
      )}

      {(story.acceptance_preview.length > 0 || story.acceptance_total > 0) && (
        <div className="us-card__acceptance">
          <div className="us-card__section-label">
            Acceptance {story.acceptance_total > 0 && `(${story.acceptance_done}/${story.acceptance_total})`}
          </div>
          <ul>
            {story.acceptance_preview.map((item) => (
              <li key={item.id} className={item.checked ? "is-done" : ""}>
                <span aria-hidden>{item.checked ? "☑" : "☐"}</span>
                <span className="line-clamp-2">{item.text || "—"}</span>
              </li>
            ))}
            {story.acceptance_total > story.acceptance_preview.length && (
              <li className="text-[var(--trello-text-muted)]">
                +{story.acceptance_total - story.acceptance_preview.length} criterion(s)
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="us-card__meta">
        {story.depends_on_count > 0 && <span>{story.depends_on_count} dependency(ies)</span>}
        {story.blocked && <span className="us-card__blocked">blocked</span>}
      </div>
    </button>
  );
}
