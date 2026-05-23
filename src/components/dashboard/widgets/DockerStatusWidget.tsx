import { useQuery } from "@tanstack/react-query";
import { Container, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { dockerContainers } from "@/services/tauri/docker";

export function DockerStatusWidget() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["docker-widget"],
    queryFn: dockerContainers,
    refetchInterval: 15_000,
    retry: false,
    staleTime: 10_000,
  });

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
        <p className="text-[10px]">Docker non disponible</p>
      </div>
    );
  }

  const running = data.filter((c) => c.state === "running");

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Container className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">
            <span className="text-emerald-400">{running.length}</span>
            <span className="text-muted-foreground"> / {data.length} containers</span>
          </span>
        </div>
        <button
          onClick={() => refetch()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
        </button>
      </div>

      {/* Container list */}
      <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
        {data.length === 0 && (
          <p className="text-[10px] text-muted-foreground">Aucun container</p>
        )}
        {data.slice(0, 5).map((c) => (
          <div key={c.id} className="flex items-center gap-1.5 py-0.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                c.state === "running" ? "bg-emerald-400" :
                c.state === "paused" ? "bg-amber-400" : "bg-muted-foreground"
              )}
            />
            <span className="font-mono text-[10px] truncate flex-1">{c.name}</span>
            <span className="text-[10px] text-muted-foreground shrink-0 truncate max-w-[80px]">{c.image.split(":")[0]}</span>
          </div>
        ))}
        {data.length > 5 && (
          <p className="text-[10px] text-muted-foreground">+{data.length - 5} autres</p>
        )}
      </div>

      {/* Summary bar */}
      {data.length > 0 && (
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${(running.length / data.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
