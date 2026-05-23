import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gitStatus, gitLog, gitBranches, gitRun } from "@/services/tauri/git";
import { pickFolder } from "@/services/tauri/dialog";
import { useT } from "@/hooks/useT";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitBranch, RefreshCw, Download, Upload, RotateCcw,
  FileCode, FolderOpen, AlertCircle, Loader2, CheckCircle2, XCircle,
} from "lucide-react";

interface ActionResult {
  sub: string;
  output: string;
  ok: boolean;
}

export function GitPage() {
  const [inputPath, setInputPath] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const qc = useQueryClient();
  const t = useT();
  const repoPathRef = useRef(repoPath);
  repoPathRef.current = repoPath;

  const statusQ = useQuery({
    queryKey: ["git-status", repoPath],
    queryFn: () => gitStatus(repoPath),
    enabled: !!repoPath,
    retry: false,
    staleTime: 10_000,
  });
  const logQ = useQuery({
    queryKey: ["git-log", repoPath],
    queryFn: () => gitLog(repoPath),
    enabled: !!repoPath,
    retry: false,
    staleTime: 10_000,
  });
  const branchQ = useQuery({
    queryKey: ["git-branches", repoPath],
    queryFn: () => gitBranches(repoPath),
    enabled: !!repoPath,
    retry: false,
    staleTime: 10_000,
  });

  const runAction = useMutation({
    mutationFn: (sub: string) => gitRun(repoPathRef.current, sub),
    onSuccess: ({ output, exitCode }, sub) => {
      const path = repoPathRef.current;
      setActionResult({ sub, output, ok: exitCode === 0 });
      qc.invalidateQueries({ queryKey: ["git-status", path] });
      qc.invalidateQueries({ queryKey: ["git-log", path] });
      qc.invalidateQueries({ queryKey: ["git-branches", path] });
    },
    onError: (err, sub) => {
      setActionResult({ sub, output: String(err), ok: false });
    },
  });

  const load = () => {
    if (inputPath.trim()) { setRepoPath(inputPath.trim()); setActionResult(null); }
  };

  const isLoading = statusQ.isLoading || logQ.isLoading;
  const error = statusQ.error ?? logQ.error ?? branchQ.error;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-card shrink-0">
        <Input
          value={inputPath}
          onChange={(e) => setInputPath(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder={t.git.placeholder}
          className="flex-1 h-8 text-sm font-mono"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 shrink-0"
          title={t.git.browse}
          onClick={async () => {
            const folder = await pickFolder();
            if (folder) { setInputPath(folder); setRepoPath(folder); setActionResult(null); }
          }}
        >
          <FolderOpen className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" onClick={load} className="h-8 shrink-0">
          {t.git.open}
        </Button>
        {repoPath && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => qc.invalidateQueries({ queryKey: ["git-status", repoPath] })}
            className="h-8 w-8 p-0 shrink-0"
            title="Actualiser"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* No repo selected */}
      {!repoPath && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <GitBranch className="h-10 w-10 mx-auto opacity-30" />
            <p className="text-sm">{t.git.noRepo}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {repoPath && error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{String(error)}</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {repoPath && isLoading && !error && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {/* Content */}
      {repoPath && statusQ.data && !isLoading && !error && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Branch bar */}
          <div className="flex items-center gap-3 px-6 py-2 border-b border-border bg-muted/30 text-sm">
            <GitBranch className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-mono font-medium">{statusQ.data.branch}</span>
            {statusQ.data.ahead > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Upload className="h-2.5 w-2.5" /> {statusQ.data.ahead}
              </Badge>
            )}
            {statusQ.data.behind > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Download className="h-2.5 w-2.5" /> {statusQ.data.behind}
              </Badge>
            )}
            <div className="flex-1" />
            <Button
              size="sm" variant="ghost" className="h-7 text-xs gap-1"
              onClick={() => runAction.mutate("fetch")}
              disabled={runAction.isPending}
            >
              <Download className="h-3 w-3" /> {t.git.fetch}
            </Button>
            <Button
              size="sm" variant="ghost" className="h-7 text-xs gap-1"
              onClick={() => runAction.mutate("pull")}
              disabled={runAction.isPending}
            >
              <RotateCcw className="h-3 w-3" /> {t.git.pull}
            </Button>
            <Button
              size="sm" variant="ghost" className="h-7 text-xs gap-1"
              onClick={() => runAction.mutate("push")}
              disabled={runAction.isPending}
            >
              <Upload className="h-3 w-3" /> {t.git.push}
            </Button>
          </div>

          <Tabs defaultValue="status" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="mx-6 mt-3 w-fit shrink-0">
              <TabsTrigger value="status" className="text-xs">{t.git.status}
                Statut
                {(statusQ.data.staged.length + statusQ.data.unstaged.length + statusQ.data.untracked.length) > 0 && (
                  <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-px">
                    {statusQ.data.staged.length + statusQ.data.unstaged.length + statusQ.data.untracked.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="log" className="text-xs">{t.git.log}</TabsTrigger>
              <TabsTrigger value="branches" className="text-xs">{t.git.branches}</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="flex-1 overflow-hidden mt-0 px-6 pb-4">
              <ScrollArea className="h-full pt-3">
                {statusQ.data.staged.length + statusQ.data.unstaged.length + statusQ.data.untracked.length === 0 ? (
                  <p className="text-sm text-muted-foreground pt-4">{t.git.clean}</p>
                ) : (
                  <div className="space-y-4">
                    <FileSection title={t.git.staged} files={statusQ.data.staged} color="text-emerald-400" badge="staged" />
                    <FileSection title={t.git.unstaged} files={statusQ.data.unstaged} color="text-yellow-400" badge="modified" />
                    <FileSection title={t.git.untracked} files={statusQ.data.untracked} color="text-muted-foreground" badge="untracked" />
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="log" className="flex-1 overflow-hidden mt-0 px-6 pb-4">
              <ScrollArea className="h-full pt-3">
                <div className="space-y-1">
                  {(logQ.data ?? []).map((commit) => (
                    <div key={commit.hash} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                      <span className="font-mono text-xs text-primary shrink-0 mt-0.5">{commit.hash}</span>
                      <span className="flex-1 text-sm text-foreground leading-snug">{commit.message}</span>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{commit.author}</p>
                        <p className="text-xs text-muted-foreground/60">{commit.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="branches" className="flex-1 overflow-hidden mt-0 px-6 pb-4">
              <ScrollArea className="h-full pt-3">
                <div className="space-y-1">
                  {(branchQ.data ?? []).map((b) => (
                    <div
                      key={b.name}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                        b.isCurrent && "bg-primary/10"
                      )}
                    >
                      <GitBranch className={cn("h-3.5 w-3.5 shrink-0", b.isCurrent ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("font-mono", b.isCurrent && "text-primary font-medium")}>{b.name}</span>
                      {b.isCurrent && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t.git.current}</Badge>}
                      {b.isRemote && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t.git.remote}</Badge>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Action result */}
          {actionResult && (
            <div className={cn(
              "mx-6 mb-4 rounded-lg border p-3 space-y-1.5",
              actionResult.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
            )}>
              <div className="flex items-center gap-2">
                {actionResult.ok
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                <span className={cn("text-xs font-medium font-mono", actionResult.ok ? "text-emerald-400" : "text-red-400")}>
                  git {actionResult.sub}
                </span>
              </div>
              {actionResult.output && (
                <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap pl-5">{actionResult.output}</pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FileSection({
  title, files, color, badge,
}: {
  title: string;
  files: string[];
  color: string;
  badge: string;
}) {
  if (files.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
        {title} ({files.length})
      </p>
      <div className="space-y-0.5">
        {files.map((f) => (
          <div key={f} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent/30 group">
            <FileCode className={cn("h-3.5 w-3.5 shrink-0", color)} />
            <span className="font-mono text-xs text-foreground flex-1 truncate">{f}</span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 opacity-0 group-hover:opacity-100 transition-opacity", color)}>
              {badge}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
