import type { Moscow, StoryStatus } from "./agileTypes";

export const MOSCOW_LABELS: Record<Moscow, string> = {
  Must: "Must",
  Should: "Should",
  Could: "Could",
  Wont: "Won't",
};

export const MOSCOW_CLASS: Record<Moscow, string> = {
  Must: "bg-red-100 text-red-800",
  Should: "bg-amber-100 text-amber-900",
  Could: "bg-sky-100 text-sky-900",
  Wont: "bg-neutral-100 text-neutral-600",
};

export const STATUS_CLASS: Record<StoryStatus, string> = {
  "❌": "text-neutral-600",
  "🔶": "text-amber-600",
  "✅": "text-emerald-600",
};

export const VERSION_STATUS_OPTIONS = ["planned", "active", "complete"] as const;
export const SPRINT_STATUS_OPTIONS = ["planned", "active", "complete"] as const;
export const EPIC_STATUS_OPTIONS = ["active", "complete", "paused"] as const;
export const MOSCOW_OPTIONS = ["Must", "Should", "Could", "Wont"] as const;
export const STORY_STATUS_OPTIONS = ["❌", "🔶", "✅"] as const;

export const DEFAULT_AS_ROLE = "Local user";

/** Column where the ready badge is visually highlighted (US-0055). */
export const READY_BADGE_COLUMN = "Ready";

/** Column that triggers a warning when a not-ready story is moved here (US-0055). */
export const IN_PROGRESS_COLUMN = "In progress";
