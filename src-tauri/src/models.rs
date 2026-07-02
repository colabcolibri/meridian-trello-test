use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Board {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Column {
    pub id: String,
    pub board_id: String,
    pub name: String,
    pub order_index: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub board_id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChecklistItem {
    pub id: String,
    pub card_id: String,
    pub text: String,
    pub completed: bool,
    pub order_index: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    pub id: String,
    pub column_id: String,
    pub title: String,
    pub description: Option<String>,
    pub priority: Option<String>,
    pub due_date: Option<String>,
    pub notes: Option<String>,
    pub archived: bool,
    pub order_index: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardSummary {
    pub id: String,
    pub column_id: String,
    pub title: String,
    pub priority: Option<String>,
    pub due_date: Option<String>,
    pub archived: bool,
    pub order_index: i64,
    pub checklist_done: i64,
    pub checklist_total: i64,
    pub tags: Vec<Tag>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardDetail {
    pub card: Card,
    pub tags: Vec<Tag>,
    pub checklist: Vec<ChecklistItem>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBoardInput {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBoardInput {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct SetLastBoardInput {
    pub board_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateColumnInput {
    pub board_id: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateColumnInput {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct ReorderColumnsInput {
    pub board_id: String,
    pub ordered_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCardInput {
    pub column_id: String,
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCardInput {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub priority: Option<String>,
    pub due_date: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct MoveCardInput {
    pub id: String,
    pub column_id: String,
    pub order_index: i64,
}

#[derive(Debug, Deserialize)]
pub struct ReorderCardsInput {
    pub column_id: String,
    pub ordered_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct ArchiveCardInput {
    pub id: String,
    pub archived: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagInput {
    pub board_id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Deserialize)]
pub struct SetCardTagsInput {
    pub card_id: String,
    pub tag_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpsertChecklistItemInput {
    pub id: Option<String>,
    pub card_id: String,
    pub text: String,
    pub completed: bool,
    pub order_index: i64,
}

#[derive(Debug, Deserialize)]
pub struct ReorderChecklistInput {
    pub card_id: String,
    pub ordered_ids: Vec<String>,
}
