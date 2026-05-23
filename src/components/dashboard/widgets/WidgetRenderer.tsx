import type { Widget } from "@/types";
import { ClockWidget } from "./ClockWidget";
import { SystemWidget } from "./SystemWidget";
import { GitStatusWidget } from "./GitStatusWidget";
import { DockerStatusWidget } from "./DockerStatusWidget";
import { NotesWidget } from "./NotesWidget";
import { SoundboardWidget } from "./SoundboardWidget";

interface Props {
  widget: Widget;
  isEditing?: boolean;
}

export function WidgetRenderer({ widget, isEditing }: Props) {
  switch (widget.type) {
    case "clock":
      return <ClockWidget />;
    case "cpu-monitor":
      return <SystemWidget type="cpu" />;
    case "ram-monitor":
      return <SystemWidget type="ram" />;
    case "disk-monitor":
      return <SystemWidget type="disk" />;
    case "git-status":
      return <GitStatusWidget widget={widget} isEditing={isEditing} />;
    case "docker-status":
      return <DockerStatusWidget />;
    case "notes":
      return <NotesWidget widget={widget} />;
    case "soundboard":
      return <SoundboardWidget />;
    default:
      return (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          {widget.type}
        </div>
      );
  }
}
