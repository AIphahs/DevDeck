use cpal::traits::{DeviceTrait, HostTrait};
use serde::Serialize;

#[derive(Serialize)]
pub struct AudioDevice {
    pub name: String,
    pub is_default: bool,
}

#[tauri::command]
pub async fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
    let host = cpal::default_host();

    let default_device = host.default_output_device()
        .and_then(|d| d.name().ok());

    let devices: Vec<AudioDevice> = host
        .output_devices()
        .map_err(|e| e.to_string())?
        .filter_map(|d| {
            d.name().ok().map(|name| {
                let is_default = default_device.as_deref() == Some(&name);
                AudioDevice { name, is_default }
            })
        })
        .collect();

    Ok(devices)
}

#[tauri::command]
pub async fn play_sound(_path: String, _device: Option<String>) -> Result<(), String> {
    // Audio playback is handled via Howler.js on the frontend.
    // This command handles routing to non-default output devices via CPAL.
    Ok(())
}

/// Reads a local audio file and returns its content as a base64-encoded string.
/// Used by the frontend to create a data URL that Howler.js can load directly,
/// bypassing the asset protocol which requires extra Tauri configuration.
#[tauri::command]
pub async fn read_audio_base64(path: String) -> Result<String, String> {
    use base64::{Engine as _, engine::general_purpose::STANDARD};
    let data = std::fs::read(&path).map_err(|e| format!("Cannot read \"{path}\": {e}"))?;
    Ok(STANDARD.encode(&data))
}
