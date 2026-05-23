import { open } from "@tauri-apps/plugin-dialog";

const AUDIO_FILTERS = [{ name: "Audio", extensions: ["mp3", "wav", "ogg", "flac", "aac", "m4a"] }];

/** Opens a native file picker filtered to audio files. Returns the path or null if cancelled. */
export async function pickAudioFile(): Promise<string | null> {
  const result = await open({ filters: AUDIO_FILTERS, multiple: false, directory: false });
  if (!result) return null;
  return Array.isArray(result) ? result[0] : result;
}
