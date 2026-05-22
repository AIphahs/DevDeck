import { create } from "zustand";
import { generateId } from "@/utils/format";

export type ShellType = "powershell" | "bash" | "cmd";
export type LineType = "command" | "stdout" | "stderr" | "info";

export interface TerminalLine {
  id: string;
  type: LineType;
  content: string;
}

export interface TerminalSession {
  id: string;
  name: string;
  shell: ShellType;
  workingDir: string;
  lines: TerminalLine[];
  cmdHistory: string[];
  isRunning: boolean;
}

interface TerminalState {
  sessions: TerminalSession[];
  activeId: string | null;
  addSession: (shell?: ShellType) => string;
  removeSession: (id: string) => void;
  setActive: (id: string) => void;
  appendLine: (id: string, line: Omit<TerminalLine, "id">) => void;
  setRunning: (id: string, v: boolean) => void;
  pushCmd: (id: string, cmd: string) => void;
  setWorkingDir: (id: string, dir: string) => void;
  clearLines: (id: string) => void;
}

function makeSession(shell: ShellType, n: number): TerminalSession {
  return {
    id: generateId(),
    name: `Session ${n}`,
    shell,
    workingDir: "~",
    lines: [],
    cmdHistory: [],
    isRunning: false,
  };
}

export const useTerminalStore = create<TerminalState>()((set, get) => ({
  sessions: [],
  activeId: null,

  addSession: (shell = "powershell") => {
    const sess = makeSession(shell, get().sessions.length + 1);
    set((s) => ({ sessions: [...s.sessions, sess], activeId: sess.id }));
    return sess.id;
  },

  removeSession: (id) =>
    set((s) => {
      const sessions = s.sessions.filter((x) => x.id !== id);
      const activeId = s.activeId === id ? (sessions.at(-1)?.id ?? null) : s.activeId;
      return { sessions, activeId };
    }),

  setActive: (id) => set({ activeId: id }),

  appendLine: (id, line) =>
    set((s) => ({
      sessions: s.sessions.map((x) =>
        x.id === id
          ? { ...x, lines: [...x.lines, { ...line, id: generateId() }].slice(-1000) }
          : x
      ),
    })),

  setRunning: (id, v) =>
    set((s) => ({
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, isRunning: v } : x)),
    })),

  pushCmd: (id, cmd) =>
    set((s) => ({
      sessions: s.sessions.map((x) =>
        x.id === id
          ? { ...x, cmdHistory: [cmd, ...x.cmdHistory.filter((c) => c !== cmd)].slice(0, 200) }
          : x
      ),
    })),

  setWorkingDir: (id, dir) =>
    set((s) => ({
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, workingDir: dir } : x)),
    })),

  clearLines: (id) =>
    set((s) => ({
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, lines: [] } : x)),
    })),
}));
