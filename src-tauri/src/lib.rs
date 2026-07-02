mod commands;
mod db;
mod models;
mod util;

use commands::agile::{
    epics::{create_epic, delete_epic, list_epics, update_epic},
    projects::{
        create_project, delete_project, get_last_project_id, get_project, list_projects,
        set_last_project_id, update_project,
    },
    sprints::{
        create_sprint, delete_sprint, get_last_sprint_id, list_sprints, set_last_sprint_id,
        update_sprint,
    },
    stories::{
        create_story, delete_story, get_story, list_stories, move_story, reorder_stories,
        set_story_acceptance, set_story_dependencies, update_story,
    },
    versions::{create_version, delete_version, list_versions, update_version},
    workflow::list_workflow_columns,
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
            list_projects,
            get_project,
            create_project,
            update_project,
            delete_project,
            get_last_project_id,
            set_last_project_id,
            list_versions,
            create_version,
            update_version,
            delete_version,
            list_epics,
            create_epic,
            update_epic,
            delete_epic,
            list_sprints,
            create_sprint,
            update_sprint,
            delete_sprint,
            get_last_sprint_id,
            set_last_sprint_id,
            list_workflow_columns,
            list_stories,
            get_story,
            create_story,
            update_story,
            delete_story,
            set_story_acceptance,
            set_story_dependencies,
            move_story,
            reorder_stories,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
