mod commands;
mod db;
mod seeds;
mod sync;

use db::AppState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()
                .expect("failed to resolve app data dir");
            let mut conn = db::init_db(&app_data_dir)
                .expect("failed to initialize sqlite");

            if let Err(e) = seeds::seed_reference_data(&mut conn, app.handle().clone()) {
                eprintln!("Failed to seed data: {}", e);
            }

            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            sync::sync_personnages,
            sync::pull_personnages,
            sync::sync_ref_items,
            sync::publish_ref_items,
            sync::check_remote_db_version,
            commands::get_local_db_version,
            commands::update_local_db_version,
            commands::get_local_items_count,
            commands::get_ref_items,
            commands::get_all_personnages,
            commands::get_personnage,
            commands::create_personnage,
            commands::delete_personnage,
            commands::import_personnage,
            commands::save_personnage_local,
            commands::get_personnage_versions,
            commands::restore_personnage_version,
            commands::get_game_rules,
            commands::get_competences,
            commands::create_ref_equipement,
            commands::update_ref_equipement,
            commands::delete_ref_equipement,
            commands::get_docs_list,
            commands::open_doc
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
