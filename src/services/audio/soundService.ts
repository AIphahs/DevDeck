import { Howl, Howler } from "howler";
import { convertFileSrc } from "@tauri-apps/api/core";

// Active Howl instances keyed by clip ID
const instances = new Map<string, Howl>();

function toSrc(filePath: string): string {
  // Convert local file path to Tauri asset URL
  try {
    return convertFileSrc(filePath);
  } catch {
    // Fallback for non-Tauri environments (e.g. browser preview)
    return filePath;
  }
}

export function setMasterVolume(volume: number) {
  Howler.volume(Math.max(0, Math.min(1, volume)));
}

export function playClip(id: string, filePath: string, volume = 1, loop = false): void {
  // Stop any existing instance for this clip
  stopClip(id);

  const howl = new Howl({
    src: [toSrc(filePath)],
    volume: Math.max(0, Math.min(1, volume)),
    loop,
    onend: () => {
      if (!loop) instances.delete(id);
    },
    onloaderror: (_id, err) => {
      console.warn(`[SoundService] Failed to load "${filePath}":`, err);
      instances.delete(id);
    },
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
  for (const id of instances.keys()) stopClip(id);
}

export function isPlaying(id: string): boolean {
  return instances.get(id)?.playing() ?? false;
}

export function toggleClip(id: string, filePath: string, volume = 1, loop = false): void {
  if (isPlaying(id)) {
    stopClip(id);
  } else {
    playClip(id, filePath, volume, loop);
  }
}
