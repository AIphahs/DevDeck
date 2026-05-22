import { create } from "zustand";
import { generateId } from "@/utils/format";

export type OutputStatus = "running" | "success" | "error";

export interface OutputEntry {
  id: string;
  label: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  status: OutputStatus;
  timestamp: number;
}

interface OutputState {
  entries: OutputEntry[];
  isOpen: boolean;
  addEntry: (entry: Omit<OutputEntry, "id" | "timestamp">) => string;
  updateEntry: (id: string, updates: Partial<OutputEntry>) => void;
  clearEntries: () => void;
  setOpen: (open: boolean) => void;
}

export const useOutputStore = create<OutputState>()((set) => ({
  entries: [],
  isOpen: false,

  addEntry: (entry) => {
    const id = generateId();
    set((s) => ({
      entries: [{ ...entry, id, timestamp: Date.now() }, ...s.entries].slice(0, 50),
      isOpen: true,
    }));
    return id;
  },

  updateEntry: (id, updates) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),

  clearEntries: () => set({ entries: [] }),
  setOpen: (isOpen) => set({ isOpen }),
}));
