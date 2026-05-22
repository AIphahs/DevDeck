import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/utils/format";
import type { ShortcutBinding } from "@/types";

interface ShortcutState {
  bindings: ShortcutBinding[];
  addBinding: (binding: Omit<ShortcutBinding, "id">) => string;
  updateBinding: (id: string, updates: Partial<ShortcutBinding>) => void;
  removeBinding: (id: string) => void;
}

export const useShortcutStore = create<ShortcutState>()(
  persist(
    (set) => ({
      bindings: [],
      addBinding: (binding) => {
        const id = generateId();
        set((s) => ({ bindings: [...s.bindings, { ...binding, id }] }));
        return id;
      },
      updateBinding: (id, updates) =>
        set((s) => ({
          bindings: s.bindings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      removeBinding: (id) =>
        set((s) => ({ bindings: s.bindings.filter((b) => b.id !== id) })),
    }),
    { name: "devdeck-shortcuts" }
  )
);
