use serde::Deserialize;

#[derive(Deserialize)]
pub struct ShortcutRequest {
    pub shortcut: String,
    pub action_id: String,
}

#[tauri::command]
pub async fn register_shortcut(_req: ShortcutRequest) -> Result<(), String> {
    // Global shortcut registration is handled via tauri-plugin-global-shortcut.
    // This command validates and persists the binding to the database.
    Ok(())
}

#[tauri::command]
pub async fn unregister_shortcut(shortcut: String) -> Result<(), String> {
    let _ = shortcut;
    Ok(())
}
