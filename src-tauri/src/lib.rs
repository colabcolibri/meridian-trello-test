mod commands;
mod db;
mod models;
mod util;

use commands::{
    boards::{create_board, delete_board, get_board, get_last_board_id, list_boards, set_last_board_id, update_board},
    cards::{
        archive_card, create_card, delete_card, duplicate_card, get_card, list_cards, move_card,
        move_card_to_column, reorder_cards, update_card,
    },
    checklist::{
        delete_checklist_item, list_checklist_items, reorder_checklist_items, upsert_checklist_item,
    },
    columns::{
        create_column, delete_column, list_columns, move_column_down, move_column_up, reorder_columns,
        update_column,
    },
    tags::{create_tag, list_tags, set_card_tags},
};

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data directory");
            let db_path = app_data_dir.join("kanban.db");
            let connection = db::init(&db_path).expect("failed to initialize database");
            app.manage(db::DbState(std::sync::Mutex::new(connection)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_boards,
            create_board,
            update_board,
            delete_board,
            get_board,
            get_last_board_id,
            set_last_board_id,
            list_columns,
            create_column,
            update_column,
            reorder_columns,
            delete_column,
            move_column_up,
            move_column_down,
            list_cards,
            get_card,
            create_card,
            update_card,
            move_card,
            reorder_cards,
            duplicate_card,
            archive_card,
            delete_card,
            move_card_to_column,
            list_tags,
            create_tag,
            set_card_tags,
            list_checklist_items,
            upsert_checklist_item,
            delete_checklist_item,
            reorder_checklist_items,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
