import type { Widget } from "@/types";
import { ClockWidget } from "./ClockWidget";
import { SystemWidget } from "./SystemWidget";

interface Props {
  widget: Widget;
}

export function WidgetRenderer({ widget }: Props) {
  switch (widget.type) {
    case "clock":
      return <ClockWidget />;
    case "cpu-monitor":
      return <SystemWidget type="cpu" />;
    case "ram-monitor":
      return <SystemWidget type="ram" />;
    case "disk-monitor":
      return <SystemWidget type="disk" />;
    default:
      return (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          {widget.type}
        </div>
      );
  }
}
