import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/utils/format";
import type { SoundClip } from "@/types";

interface SoundState {
  clips: SoundClip[];
  masterVolume: number;
  addClip: (clip: Omit<SoundClip, "id" | "createdAt">) => string;
  updateClip: (id: string, updates: Partial<SoundClip>) => void;
  removeClip: (id: string) => void;
  setMasterVolume: (v: number) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      clips: [],
      masterVolume: 0.8,
      addClip: (clip) => {
        const id = generateId();
        set((s) => ({
          clips: [...s.clips, { ...clip, id, createdAt: new Date().toISOString() }],
        }));
        return id;
      },
      updateClip: (id, updates) =>
        set((s) => ({ clips: s.clips.map((c) => (c.id === id ? { ...c, ...updates } : c)) })),
      removeClip: (id) =>
        set((s) => ({ clips: s.clips.filter((c) => c.id !== id) })),
      setMasterVolume: (v) => set({ masterVolume: v }),
    }),
    { name: "devdeck-sounds" }
  )
);
