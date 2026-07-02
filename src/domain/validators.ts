export function validateName(name: string): string | null {
  if (!name.trim()) return "Name cannot be empty";
  return null;
}

export function validateTitle(title: string): string | null {
  if (!title.trim()) return "Title cannot be empty";
  return null;
}
