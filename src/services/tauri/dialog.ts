import { open } from "@tauri-apps/plugin-dialog";

const AUDIO_FILTERS = [{ name: "Audio", extensions: ["mp3", "wav", "ogg", "flac", "aac", "m4a"] }];

export async function pickAudioFile(): Promise<string | null> {
  const result = await open({ filters: AUDIO_FILTERS, multiple: false, directory: false });
  if (!result) return null;
  return Array.isArray(result) ? result[0] : result;
}

export async function pickFolder(): Promise<string | null> {
  const result = await open({ directory: true, multiple: false });
  if (!result) return null;
  return Array.isArray(result) ? result[0] : result;
}
