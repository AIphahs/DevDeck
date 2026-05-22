import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import { cn } from "@/utils/cn";
import { useWidgetStore } from "@/store/widgetStore";
import { WidgetRenderer } from "./widgets/WidgetRenderer";
import type { Widget } from "@/types";

interface Props {
  widget: Widget;
  isEditing: boolean;
}

export function WidgetCard({ widget, isEditing }: Props) {
  const removeWidget = useWidgetStore((s) => s.removeWidget);
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.colSpan}`,
    gridRow: `span ${widget.rowSpan}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative rounded-lg border bg-card p-3 transition-all",
        isDragging && "opacity-50 ring-2 ring-primary",
        isEditing && "ring-1 ring-dashed ring-border"
      )}
    >
      {/* Widget title */}
      {widget.title && (
        <div className="absolute top-2 left-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {widget.title}
        </div>
      )}

      {/* Edit controls */}
      {isEditing && (
        <>
          <button
            {...attributes}
            {...listeners}
            className="absolute top-1 left-1 cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
          </button>
          {isHovered && (
            <button
              onClick={() => removeWidget(widget.id)}
              className="absolute top-1 right-1 rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </>
      )}

      <div className={cn("h-full", widget.title && "pt-4")}>
        <WidgetRenderer widget={widget} />
      </div>
    </div>
  );
}
