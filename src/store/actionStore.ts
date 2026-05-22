import { create } from "zustand";

interface ActionState {
  runningActionIds: Set<string>;
  setRunning: (id: string, running: boolean) => void;
}

export const useActionStore = create<ActionState>()((set) => ({
  runningActionIds: new Set(),
  setRunning: (id, running) =>
    set((s) => {
      const next = new Set(s.runningActionIds);
      running ? next.add(id) : next.delete(id);
      return { runningActionIds: next };
    }),
}));
