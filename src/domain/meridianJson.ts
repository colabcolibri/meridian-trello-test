import type { ChecklistItem } from "./agileTypes";

export function parseStringList(json: string | null | undefined): string[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    return json
      .split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

export function stringifyStringList(items: string[]): string | null {
  const cleaned = items.map((s) => s.trim()).filter(Boolean);
  return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
}

export function parseChecklist(json: string | null | undefined): ChecklistItem[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (typeof item === "string") return { label: item, done: false };
      const obj = item as { label?: string; done?: boolean };
      return { label: obj.label ?? "", done: !!obj.done };
    });
  } catch {
    return [];
  }
}

export function stringifyChecklist(items: ChecklistItem[]): string | null {
  const cleaned = items.filter((item) => item.label.trim());
  return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
}

export function parseRetrospective(json: string | null | undefined): {
  worked: string;
  improve: string;
  decisions: string;
} {
  if (!json?.trim()) {
    return { worked: "", improve: "", decisions: "" };
  }
  try {
    const parsed = JSON.parse(json) as {
      worked?: string;
      improve?: string;
      decisions?: string;
    };
    return {
      worked: parsed.worked ?? "",
      improve: parsed.improve ?? "",
      decisions: parsed.decisions ?? "",
    };
  } catch {
    return { worked: json, improve: "", decisions: "" };
  }
}

export function stringifyRetrospective(fields: {
  worked: string;
  improve: string;
  decisions: string;
}): string | null {
  const payload = {
    worked: fields.worked.trim(),
    improve: fields.improve.trim(),
    decisions: fields.decisions.trim(),
  };
  if (!payload.worked && !payload.improve && !payload.decisions) return null;
  return JSON.stringify(payload);
}
