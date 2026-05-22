mod commands;
mod monitoring;
mod security;
mod audio;
mod automation;
mod database;
mod plugins;

use tauri::Manager;
use tracing::info;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("devdeck=debug".parse().unwrap()),
        )
        .init();

    info!("Starting DevDeck v{}", env!("CARGO_PKG_VERSION"));

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            info!("DevDeck setup complete");
            let _app_handle = app.handle().clone();

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::system::get_system_info,
            commands::system::get_processes,
            commands::shell::execute_command,
            commands::shell::execute_script,
            commands::audio::get_audio_devices,
            commands::audio::play_sound,
            commands::automation::register_shortcut,
            commands::automation::unregister_shortcut,
        ])
        .run(tauri::generate_context!())
        .expect("error while running devdeck");
}
