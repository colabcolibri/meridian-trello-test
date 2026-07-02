export interface Board {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  order_index: number;
}

export interface Tag {
  id: string;
  board_id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  card_id: string;
  text: string;
  completed: boolean;
  order_index: number;
}

export interface Card {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: string | null;
  due_date: string | null;
  notes: string | null;
  archived: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CardSummary {
  id: string;
  column_id: string;
  title: string;
  priority: string | null;
  due_date: string | null;
  archived: boolean;
  order_index: number;
  checklist_done: number;
  checklist_total: number;
  tags: Tag[];
}

export interface CardDetail {
  card: Card;
  tags: Tag[];
  checklist: ChecklistItem[];
}

export type Priority = "low" | "medium" | "high" | "";
