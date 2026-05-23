import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, Upload, Download, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useWidgetStore } from "@/store/widgetStore";
import { gitStatus } from "@/services/tauri/git";
import type { Widget } from "@/types";

interface Props {
  widget: Widget;
  isEditing?: boolean;
}

export function GitStatusWidget({ widget, isEditing }: Props) {
  const updateWidget = useWidgetStore((s) => s.updateWidget);
  const repoPath = (widget.config.repoPath as string) ?? "";
  const [input, setInput] = useState(repoPath);

  function saveRepo() {
    const p = input.trim();
    if (p) updateWidget(widget.id, { config: { ...widget.config, repoPath: p } });
  }

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["git-widget", repoPath, widget.id],
    queryFn: () => gitStatus(repoPath),
    enabled: !!repoPath,
    refetchInterval: 30_000,
    retry: false,
    staleTime: 10_000,
  });

  if (!repoPath || isEditing) {
    return (
      <div className="flex flex-col gap-2 h-full justify-center">
        <div className="flex items-center gap-1.5 mb-1">
          <GitBranch className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Dépôt Git</span>
        </div>
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveRepo()}
            placeholder="C:\Projects\mon-projet"
            className="h-7 text-xs font-mono flex-1"
          />
          <Button size="sm" className="h-7 shrink-0 px-2 text-xs" onClick={saveRepo}>
            OK
          </Button>
        </div>
        {repoPath && <p className="text-[10px] text-muted-foreground truncate">Actuel : {repoPath}</p>}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <p className="text-[10px]">Dépôt non trouvé</p>
      </div>
    );
  }

  const changed = data.staged.length + data.unstaged.length + data.untracked.length;

  return (
    <div className="flex flex-col h-full justify-between gap-1.5">
      {/* Branch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <GitBranch className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-mono text-sm font-medium truncate">{data.branch}</span>
        </div>
        <button
          onClick={() => refetch()}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
        </button>
      </div>

      {/* Ahead / Behind */}
      {(data.ahead > 0 || data.behind > 0) && (
        <div className="flex items-center gap-2 text-[10px]">
          {data.ahead > 0 && (
            <span className="flex items-center gap-0.5 text-emerald-400">
              <Upload className="h-3 w-3" />{data.ahead}
            </span>
          )}
          {data.behind > 0 && (
            <span className="flex items-center gap-0.5 text-amber-400">
              <Download className="h-3 w-3" />{data.behind}
            </span>
          )}
        </div>
      )}

      {/* Changed files */}
      {changed === 0 ? (
        <p className="text-[10px] text-emerald-400">Propre ✓</p>
      ) : (
        <div className="flex items-center gap-2 text-[10px]">
          {data.staged.length > 0 && (
            <span className="text-emerald-400">{data.staged.length} indexé{data.staged.length > 1 ? "s" : ""}</span>
          )}
          {data.unstaged.length > 0 && (
            <span className="text-amber-400">{data.unstaged.length} modifié{data.unstaged.length > 1 ? "s" : ""}</span>
          )}
          {data.untracked.length > 0 && (
            <span className="text-muted-foreground">{data.untracked.length} non suivi{data.untracked.length > 1 ? "s" : ""}</span>
          )}
        </div>
      )}
    </div>
  );
}
