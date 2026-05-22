import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { getProcesses } from "@/services/tauri/system";
import { formatBytes } from "@/utils/format";
import { cn } from "@/utils/cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Cpu, MemoryStick, HardDrive, Monitor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function pct(used: number, total: number) {
  return total > 0 ? Math.round((used / total) * 100) : 0;
}

function CircleGauge({
  value, max, label, sublabel, icon: Icon, color,
}: {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  color: string;
}) {
  const p = pct(value, max);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (p / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-card">
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7"
            className="text-muted/20" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-4 w-4 mb-0.5" style={{ color }} />
          <span className="text-lg font-bold tabular-nums">{p}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export function MonitoringPage() {
  const qc = useQueryClient();
  const systemQ = useSystemInfo(2000);
  const processesQ = useQuery({
    queryKey: ["processes"],
    queryFn: getProcesses,
    refetchInterval: 3000,
    retry: false,
  });

  const sys = systemQ.data;
  const processes = processesQ.data ?? [];
  const isLoading = systemQ.isLoading && !sys;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Monitoring</span>
          {sys && (
            <span className="text-xs text-muted-foreground">
              {sys.hostname} — {sys.osName}
            </span>
          )}
        </div>
        <Button
          size="sm" variant="ghost" className="h-8 w-8 p-0"
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["system-info"] });
            qc.invalidateQueries({ queryKey: ["processes"] });
          }}
          title="Actualiser"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", systemQ.isFetching && "animate-spin")} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Gauges */}
            {sys ? (
              <div className="grid grid-cols-3 gap-4">
                <CircleGauge
                  value={sys.cpuUsage}
                  max={100}
                  label="CPU"
                  sublabel={`${sys.cpuUsage.toFixed(1)}%`}
                  icon={Cpu}
                  color="hsl(var(--primary))"
                />
                <CircleGauge
                  value={sys.ramUsed}
                  max={sys.ramTotal}
                  label="RAM"
                  sublabel={`${formatBytes(sys.ramUsed)} / ${formatBytes(sys.ramTotal)}`}
                  icon={MemoryStick}
                  color="#06b6d4"
                />
                <CircleGauge
                  value={sys.diskUsed}
                  max={sys.diskTotal}
                  label="Disque"
                  sublabel={`${formatBytes(sys.diskUsed)} / ${formatBytes(sys.diskTotal)}`}
                  icon={HardDrive}
                  color="#f97316"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connexion au backend…
              </div>
            )}

            {/* Process table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Processus (top 50 par CPU)</p>
                {processesQ.isFetching && (
                  <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Nom</th>
                      <th className="text-right px-3 py-2 text-muted-foreground font-medium w-16">PID</th>
                      <th className="text-right px-3 py-2 text-muted-foreground font-medium w-20">CPU</th>
                      <th className="text-right px-3 py-2 text-muted-foreground font-medium w-24">Mémoire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((p) => (
                      <tr key={p.pid} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                        <td className="px-3 py-1.5 font-mono text-foreground truncate max-w-[200px]" title={p.name}>{p.name}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">{p.pid}</td>
                        <td className="px-3 py-1.5 text-right">
                          <span className={cn(
                            "font-mono tabular-nums",
                            p.cpuUsage > 20 ? "text-red-400" : p.cpuUsage > 5 ? "text-yellow-400" : "text-muted-foreground"
                          )}>
                            {p.cpuUsage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                          {formatBytes(p.memory)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
