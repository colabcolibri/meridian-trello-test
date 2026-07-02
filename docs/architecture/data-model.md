# Modelo de dados — SQLite

## Tabelas

### boards

```sql
CREATE TABLE boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### columns

```sql
CREATE TABLE columns (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  UNIQUE(board_id, order_index)
);
CREATE INDEX idx_columns_board ON columns(board_id);
```

### cards

```sql
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK(priority IN ('low','medium','high') OR priority IS NULL),
  due_date TEXT,
  notes TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_cards_column ON cards(column_id);
CREATE INDEX idx_cards_archived ON cards(archived);
```

### tags

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);
```

### card_tags

```sql
CREATE TABLE card_tags (
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, tag_id)
);
```

### checklist_items

```sql
CREATE TABLE checklist_items (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL
);
CREATE INDEX idx_checklist_card ON checklist_items(card_id);
```

### app_preferences

```sql
CREATE TABLE app_preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- last_board_id armazenado aqui
```

## Ordenação

Reordenar colunas ou cartões recalcula `order_index` em transação única para evitar gaps inconsistentes.

## Migrations

Pasta `src-tauri/migrations/` — prefixo `YYYYMMDDHHMMSS`. US de schema cria migration inicial consolidada.
