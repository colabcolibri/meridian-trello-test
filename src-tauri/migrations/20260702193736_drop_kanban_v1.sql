-- Remove kanban v1 task boards (product is agile US Meridian only)

DROP TABLE IF EXISTS checklist_items;
DROP TABLE IF EXISTS card_tags;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS columns;
DROP TABLE IF EXISTS boards;

DELETE FROM app_preferences WHERE key = 'last_board_id';
