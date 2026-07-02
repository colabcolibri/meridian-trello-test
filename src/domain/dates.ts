export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const due = new Date(`${dueDate}T23:59:59`);
  const now = new Date();
  return due.getTime() < now.getTime();
}

export function formatDueDate(dueDate: string | null | undefined): string {
  if (!dueDate) return "";
  const [y, m, d] = dueDate.split("-");
  return `${m}/${d}/${y}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}
