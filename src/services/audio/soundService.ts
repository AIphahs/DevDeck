import { Howl, Howler } from "howler";
import { invoke } from "@tauri-apps/api/core";

// Active Howl instances keyed by clip ID
const instances = new Map<string, Howl>();

// Cached data URLs keyed by file path to avoid re-reading on every play
const dataUrlCache = new Map<string, string>();

const MIME: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  aac: "audio/aac",
  m4a: "audio/mp4",
};

async function toDataUrl(filePath: string): Promise<string> {
  if (dataUrlCache.has(filePath)) return dataUrlCache.get(filePath)!;

  const ext = filePath.split(".").pop()?.toLowerCase() ?? "mp3";
  const mime = MIME[ext] ?? "audio/mpeg";

  // Read file via Rust command — works without asset protocol configuration
  const b64 = await invoke<string>("read_audio_base64", { path: filePath });
  const url = `data:${mime};base64,${b64}`;
  dataUrlCache.set(filePath, url);
  return url;
}

export function setMasterVolume(volume: number) {
  Howler.volume(Math.max(0, Math.min(1, volume)));
}

export async function playClip(id: string, filePath: string, volume = 1, loop = false): Promise<void> {
  stopClip(id);

  let src: string;
  try {
    src = await toDataUrl(filePath);
  } catch (err) {
    console.warn(`[SoundService] Cannot load "${filePath}":`, err);
    return;
  }

  const howl = new Howl({
    src: [src],
    format: [filePath.split(".").pop()?.toLowerCase() ?? "mp3"],
    volume: Math.max(0, Math.min(1, volume)),
    loop,
    onend: () => { if (!loop) instances.delete(id); },
  });

  instances.set(id, howl);
  howl.play();
}

export function stopClip(id: string): void {
  const howl = instances.get(id);
  if (howl) {
    howl.stop();
    howl.unload();
    instances.delete(id);
  }
}

export function stopAll(): void {
  for (const id of [...instances.keys()]) stopClip(id);
}

export function isPlaying(id: string): boolean {
  return instances.get(id)?.playing() ?? false;
}

export async function toggleClip(id: string, filePath: string, volume = 1, loop = false): Promise<void> {
  if (isPlaying(id)) {
    stopClip(id);
  } else {
    await playClip(id, filePath, volume, loop);
  }
}

export function clearCache(filePath?: string) {
  if (filePath) dataUrlCache.delete(filePath);
  else dataUrlCache.clear();
}
