import { useState, useEffect } from "react";

export function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");
  const date = time.toLocaleDateString(navigator.language, { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <div className="font-mono text-2xl font-bold tabular-nums leading-none">
        {hh}<span className="animate-pulse text-primary">:</span>{mm}<span className="text-muted-foreground text-base">:{ss}</span>
      </div>
      <div className="text-xs text-muted-foreground">{date}</div>
    </div>
  );
}
