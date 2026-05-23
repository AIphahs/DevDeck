mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
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
            commands::audio::read_audio_base64,
            commands::automation::register_shortcut,
            commands::automation::unregister_shortcut,
        ])
        .run(tauri::generate_context!())
        .expect("error while running devdeck");
}
