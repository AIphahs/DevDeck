import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dockerContainers, dockerImages, dockerAction, dockerLogs, DockerContainer } from "@/services/tauri/docker";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Container, RefreshCw, Play, Square, Trash2, FileText,
  AlertCircle, Loader2, Image as ImageIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DockerPage() {
  const qc = useQueryClient();
  const [logsModal, setLogsModal] = useState<{ name: string; content: string } | null>(null);

  const containersQ = useQuery({
    queryKey: ["docker-containers"],
    queryFn: dockerContainers,
    retry: false,
    refetchInterval: 8000,
  });
  const imagesQ = useQuery({
    queryKey: ["docker-images"],
    queryFn: dockerImages,
    retry: false,
  });

  const actionMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "start" | "stop" | "remove" }) =>
      dockerAction(id, action),
    onSettled: () => qc.invalidateQueries({ queryKey: ["docker-containers"] }),
  });

  const logsMut = useMutation({
    mutationFn: (container: DockerContainer) =>
      dockerLogs(container.id).then((content) => ({ name: container.name, content })),
    onSuccess: setLogsModal,
  });

  const isError = containersQ.isError;
  const errorMsg = containersQ.error ? String(containersQ.error) : "";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Container className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Docker</span>
          {containersQ.data && (
            <Badge variant="secondary" className="text-xs">
              {containersQ.data.filter((c) => c.state === "running").length} en cours
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["docker-containers"] });
            qc.invalidateQueries({ queryKey: ["docker-images"] });
          }}
          title="Actualiser"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", containersQ.isFetching && "animate-spin")} />
        </Button>
      </div>

      {/* Docker not available */}
      {isError && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto opacity-30" />
            <p className="text-sm font-medium">Docker non disponible</p>
            <p className="text-xs max-w-xs opacity-70">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {containersQ.isLoading && !isError && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {/* Content */}
      {containersQ.data && !isError && (
        <Tabs defaultValue="containers" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-6 mt-3 w-fit shrink-0">
            <TabsTrigger value="containers" className="text-xs">
              Conteneurs ({containersQ.data.length})
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs">
              Images ({imagesQ.data?.length ?? "…"})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="containers" className="flex-1 overflow-hidden mt-0 px-6 pb-4">
            <ScrollArea className="h-full pt-3">
              {containersQ.data.length === 0 ? (
                <p className="text-sm text-muted-foreground pt-4">Aucun conteneur.</p>
              ) : (
                <div className="space-y-2">
                  {containersQ.data.map((c) => (
                    <ContainerRow
                      key={c.id}
                      container={c}
                      onAction={(action) => actionMut.mutate({ id: c.id, action })}
                      onLogs={() => logsMut.mutate(c)}
                      isActing={actionMut.isPending}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="images" className="flex-1 overflow-hidden mt-0 px-6 pb-4">
            <ScrollArea className="h-full pt-3">
              {imagesQ.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm pt-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
                </div>
              ) : (imagesQ.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground pt-4">Aucune image.</p>
              ) : (
                <div className="space-y-1">
                  {(imagesQ.data ?? []).map((img) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 hover:border-border bg-card/50 transition-colors"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-sm text-foreground">{img.repository}</span>
                        <span className="text-muted-foreground">:{img.tag}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono shrink-0">{img.id.slice(0, 12)}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{img.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      {/* Logs dialog */}
      <Dialog open={!!logsModal} onOpenChange={(o) => { if (!o) setLogsModal(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono">{logsModal?.name} — logs</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] rounded-md border border-border bg-[#0d0d0d]">
            <pre className="p-4 font-mono text-xs text-[#d4d4d4] whitespace-pre-wrap break-all leading-relaxed">
              {logsModal?.content || "(aucune sortie)"}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const STATE_LABELS: Record<string, string> = {
  running: "en cours",
  exited: "arrêté",
  paused: "pausé",
  other: "inconnu",
};

function StateIndicator({ state }: { state: DockerContainer["state"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        state === "running" && "text-emerald-400",
        state === "exited" && "text-muted-foreground",
        state === "paused" && "text-yellow-400",
        state === "other" && "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          state === "running" && "bg-emerald-400",
          state === "exited" && "bg-muted-foreground",
          state === "paused" && "bg-yellow-400",
          state === "other" && "bg-muted-foreground"
        )}
      />
      {STATE_LABELS[state] ?? state}
    </span>
  );
}

function ContainerRow({
  container, onAction, onLogs, isActing,
}: {
  container: DockerContainer;
  onAction: (a: "start" | "stop" | "remove") => void;
  onLogs: () => void;
  isActing: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-border/50 hover:border-border bg-card/50 transition-colors">
      <Container className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium truncate">{container.name}</span>
          <StateIndicator state={container.state} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{container.image}</span>
          {container.ports && (
            <span className="text-xs text-muted-foreground/60 font-mono truncate">{container.ports}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm" variant="ghost" className="h-7 w-7 p-0" title="Journaux"
          onClick={onLogs} disabled={isActing}
        >
          <FileText className="h-3.5 w-3.5" />
        </Button>
        {container.state === "running" ? (
          <Button
            size="sm" variant="ghost" className="h-7 w-7 p-0 text-yellow-400 hover:text-yellow-300"
            title="Arrêter" onClick={() => onAction("stop")} disabled={isActing}
          >
            <Square className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300"
            title="Démarrer" onClick={() => onAction("start")} disabled={isActing}
          >
            <Play className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive"
          title="Supprimer" onClick={() => onAction("remove")} disabled={isActing}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
