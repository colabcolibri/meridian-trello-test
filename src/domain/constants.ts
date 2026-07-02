export const TAG_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Gray", value: "#64748b" },
] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-200 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export const DEFAULT_COLUMN_NAMES = [
  "To Do",
  "In Progress",
  "Waiting",
  "Done",
];
