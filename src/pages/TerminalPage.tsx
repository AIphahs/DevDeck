import { useCallback, useEffect, useRef, useState, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useTerminalStore, ShellType, TerminalSession, TerminalLine } from "@/store/terminalStore";
import { executeCommand } from "@/services/tauri/shell";
import { cn } from "@/utils/cn";
import { Plus, X, Trash2, ChevronRight, ChevronDown } from "lucide-react";

const SHELLS: { value: ShellType; label: string }[] = [
  { value: "powershell", label: "PowerShell" },
  { value: "cmd", label: "CMD" },
  { value: "bash", label: "Bash" },
];

const CWD_REGEX = /##CWD##(.+?)##/;

function wrapCommand(shell: ShellType, cwd: string, cmd: string): string {
  switch (shell) {
    case "powershell":
      return `Set-Location '${cwd.replace(/'/g, "''")}'; ${cmd}; Write-Host "##CWD##$(Get-Location)##"`;
    case "bash":
      return `cd "${cwd}" && ${cmd}; echo "##CWD##$(pwd)##"`;
    case "cmd":
      return `cd /d "${cwd}" && ${cmd} && echo ##CWD##%CD%##`;
  }
}

export function TerminalPage() {
  const { sessions, activeId, addSession, removeSession, setActive } = useTerminalStore();
  const [shellMenuOpen, setShellMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessions.length === 0) addSession("powershell");
  }, []);

  useEffect(() => {
    if (!shellMenuOpen) return;
    function onClose(e: MouseEvent) {
      const target = e.target as Node;
      const inBtn = addBtnRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inBtn && !inMenu) setShellMenuOpen(false);
    }
    document.addEventListener("mousedown", onClose);
    return () => document.removeEventListener("mousedown", onClose);
  }, [shellMenuOpen]);

  const MENU_WIDTH = 130;

  function toggleShellMenu() {
    if (!shellMenuOpen && addBtnRef.current) {
      const r = addBtnRef.current.getBoundingClientRect();
      const left = Math.min(r.left, window.innerWidth - MENU_WIDTH - 8);
      setMenuPos({ top: r.bottom + 4, left });
      setShellMenuOpen(true);
    } else {
      setShellMenuOpen(false);
    }
  }

  const active = sessions.find((s) => s.id === activeId);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-sm">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-0.5 px-2 pt-2 flex-1 overflow-x-auto">
          {sessions.map((sess) => (
            <button
              key={sess.id}
              onClick={() => setActive(sess.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-xs rounded-t border border-b-0 shrink-0 transition-colors font-mono",
                sess.id === activeId
                  ? "bg-[#0d0d0d] border-border text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
              )}
            >
              <span>{sess.name}</span>
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); removeSession(sess.id); }}
                className="rounded p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-2.5 w-2.5" />
              </span>
            </button>
          ))}
        </div>

        {/* New session button — outside overflow container so portal aligns correctly */}
        <button
          ref={addBtnRef}
          onClick={toggleShellMenu}
          className="flex items-center gap-0.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mr-1"
          title="Nouvelle session"
        >
          <Plus className="h-3 w-3" />
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Shell picker portal — rendered at body level to escape all stacking contexts */}
      {shellMenuOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
          className="min-w-[130px] rounded-md border border-border bg-card shadow-xl py-1"
        >
          {SHELLS.map((s) => (
            <button
              key={s.value}
              onClick={() => { addSession(s.value); setShellMenuOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>,
        document.body
      )}

      {active ? (
        <TerminalBody key={active.id} session={active} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Aucune session — cliquez sur + pour en créer une.
        </div>
      )}
    </div>
  );
}

function TerminalBody({ session }: { session: TerminalSession }) {
  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session.lines.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [session.id]);

  // Resolve actual CWD when session starts
  useEffect(() => {
    if (session.lines.length !== 0 || session.isRunning) return;
    const { setWorkingDir, appendLine } = useTerminalStore.getState();
    const initCmd = session.shell === "powershell" ? "(Get-Location).Path" : "pwd";
    executeCommand({ shell: session.shell, command: initCmd })
      .then((r) => {
        const dir = r.stdout.trim();
        if (dir) setWorkingDir(session.id, dir);
        appendLine(session.id, {
          type: "info",
          content: `DevDeck Terminal [${session.shell}]  —  Ctrl+L pour effacer`,
        });
      })
      .catch(() => {
        appendLine(session.id, { type: "info", content: `DevDeck Terminal [${session.shell}]` });
      });
  }, [session.id]);

  const run = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      const { appendLine, setRunning, pushCmd, setWorkingDir, clearLines, sessions } =
        useTerminalStore.getState();
      const cur = sessions.find((s) => s.id === session.id);
      if (!cur) return;

      pushCmd(session.id, cmd);
      setHistIdx(-1);

      if (cmd === "clear" || cmd === "cls") {
        clearLines(session.id);
        return;
      }

      appendLine(session.id, { type: "command", content: `${cur.workingDir}> ${cmd}` });
      setRunning(session.id, true);

      try {
        const wrapped = wrapCommand(cur.shell, cur.workingDir, cmd);
        const result = await executeCommand({ shell: cur.shell, command: wrapped });

        let stdout = result.stdout;
        const cwdMatch = stdout.match(CWD_REGEX);
        if (cwdMatch) {
          setWorkingDir(session.id, cwdMatch[1].trim());
          stdout = stdout.replace(/##CWD##.+?##\r?\n?/, "").trimEnd();
        }

        if (stdout.trim()) appendLine(session.id, { type: "stdout", content: stdout });
        if (result.stderr.trim())
          appendLine(session.id, { type: "stderr", content: result.stderr.trimEnd() });
        if (result.exitCode !== 0 && !result.stderr.trim())
          appendLine(session.id, { type: "info", content: `[exit ${result.exitCode}]` });
      } catch (err) {
        appendLine(session.id, { type: "stderr", content: String(err) });
      } finally {
        setRunning(session.id, false);
      }
    },
    [session.id]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !session.isRunning) {
      const cmd = input;
      setInput("");
      run(cmd);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, session.cmdHistory.length - 1);
      setHistIdx(next);
      if (next >= 0) setInput(session.cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : (session.cmdHistory[next] ?? ""));
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      useTerminalStore.getState().clearLines(session.id);
    }
  };

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden font-mono cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={outputRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-px">
        {session.lines.map((line) => (
          <TerminalOutputLine key={line.id} line={line} />
        ))}
        {session.isRunning && (
          <span className="text-primary/60 animate-pulse text-xs">▌</span>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border/40 px-4 py-2 bg-[#111] shrink-0">
        <span className="text-primary text-xs shrink-0 max-w-[220px] truncate">
          {session.workingDir}
        </span>
        <ChevronRight className="h-3 w-3 text-primary/70 shrink-0" />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={session.isRunning}
          className="flex-1 bg-transparent outline-none text-[#e8e8e8] placeholder:text-muted-foreground/40 text-sm"
          placeholder={session.isRunning ? "En cours…" : ""}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
        />
        <button
          onClick={() => useTerminalStore.getState().clearLines(session.id)}
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          title="Effacer (Ctrl+L)"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function TerminalOutputLine({ line }: { line: TerminalLine }) {
  return (
    <pre
      className={cn(
        "whitespace-pre-wrap break-all leading-relaxed text-sm",
        line.type === "command" && "text-primary font-medium",
        line.type === "stdout" && "text-[#d4d4d4]",
        line.type === "stderr" && "text-red-400",
        line.type === "info" && "text-muted-foreground text-xs"
      )}
    >
      {line.content}
    </pre>
  );
}
