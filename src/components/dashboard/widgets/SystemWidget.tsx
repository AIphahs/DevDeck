import { useSystemInfo } from "@/hooks/useSystemInfo";
import { formatBytes, formatPercent } from "@/utils/format";
import { cn } from "@/utils/cn";

interface Props {
  type: "cpu" | "ram" | "disk";
}

export function SystemWidget({ type }: Props) {
  const { data, isError } = useSystemInfo();

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Backend not available
      </div>
    );
  }

  const { label, value, detail } = getMetric(type, data);
  const pct = value ?? 0;

  return (
    <div className="flex h-full flex-col justify-between p-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>

      <div className="space-y-1">
        <div className="flex items-end justify-between gap-1 min-w-0">
          <span className="text-xl font-bold tabular-nums shrink-0">{formatPercent(pct)}</span>
          {detail && <span className="text-[10px] text-muted-foreground truncate text-right">{detail}</span>}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              pct < 60 ? "bg-emerald-500" : pct < 80 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function getMetric(type: Props["type"], data: ReturnType<typeof useSystemInfo>["data"]) {
  if (!data) return { label: type.toUpperCase(), value: 0, detail: undefined };

  switch (type) {
    case "cpu":
      return { label: "CPU", value: data.cpuUsage, detail: undefined };
    case "ram": {
      const pct = (data.ramUsed / data.ramTotal) * 100;
      return { label: "RAM", value: pct, detail: `${formatBytes(data.ramUsed)} / ${formatBytes(data.ramTotal)}` };
    }
    case "disk": {
      const pct = (data.diskUsed / data.diskTotal) * 100;
      return { label: "Disk", value: pct, detail: `${formatBytes(data.diskUsed)} / ${formatBytes(data.diskTotal)}` };
    }
  }
}
