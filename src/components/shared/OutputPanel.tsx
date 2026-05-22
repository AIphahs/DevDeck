import { useOutputStore } from "@/store/outputStore";
import { cn } from "@/utils/cn";
import { X, ChevronDown, ChevronUp, CheckCircle2, XCircle, Loader2, Trash2 } from "lucide-react";

export function OutputPanel() {
  const { entries, isOpen, setOpen, clearEntries } = useOutputStore();

  if (entries.length === 0) return null;

  const latest = entries[0];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[480px] rounded-xl border bg-card shadow-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2 cursor-pointer select-none hover:bg-accent/50 transition-colors"
        onClick={() => setOpen(!isOpen)}
      >
        <StatusIcon status={latest.status} />
        <span className="flex-1 truncate text-sm font-medium">{latest.label}</span>
        <span className={cn(
          "text-xs font-mono px-1.5 py-0.5 rounded",
          latest.status === "success" && "bg-emerald-500/20 text-emerald-400",
          latest.status === "error" && "bg-red-500/20 text-red-400",
          latest.status === "running" && "bg-primary/20 text-primary",
        )}>
          {latest.status === "running" ? "running" : `exit ${latest.exitCode}`}
        </span>
        {entries.length > 1 && (
          <span className="text-xs text-muted-foreground">{entries.length} runs</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); clearEntries(); }} className="text-muted-foreground hover:text-foreground">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
      </div>

      {/* Output */}
      {isOpen && (
        <div className="border-t border-border">
          {/* Command */}
          <div className="bg-muted/50 px-4 py-1.5 font-mono text-xs text-muted-foreground truncate">
            $ {latest.command}
          </div>

          {/* stdout */}
          {latest.stdout && (
            <pre className="max-h-48 overflow-y-auto px-4 py-2 font-mono text-xs text-foreground whitespace-pre-wrap break-all">
              {latest.stdout}
            </pre>
          )}

          {/* stderr */}
          {latest.stderr && (
            <pre className="max-h-32 overflow-y-auto px-4 py-2 font-mono text-xs text-red-400 whitespace-pre-wrap break-all bg-red-500/5">
              {latest.stderr}
            </pre>
          )}

          {latest.status === "running" && !latest.stdout && !latest.stderr && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Executing…
            </div>
          )}

          {/* History */}
          {entries.length > 1 && (
            <div className="border-t border-border px-4 py-1.5">
              <p className="text-xs text-muted-foreground mb-1">Previous runs</p>
              {entries.slice(1, 4).map((e) => (
                <div key={e.id} className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground">
                  <StatusIcon status={e.status} className="h-3 w-3" />
                  <span className="truncate flex-1">{e.label}</span>
                  <span className="font-mono">exit {e.exitCode}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status, className }: { status: string; className?: string }) {
  const cls = cn("h-4 w-4 shrink-0", className);
  if (status === "success") return <CheckCircle2 className={cn(cls, "text-emerald-400")} />;
  if (status === "error") return <XCircle className={cn(cls, "text-red-400")} />;
  return <Loader2 className={cn(cls, "animate-spin text-primary")} />;
}
