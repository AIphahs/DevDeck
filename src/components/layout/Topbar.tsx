import { X, Minus, Square } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/utils/cn";

export function Topbar() {
  const win = getCurrentWindow();

  return (
    <header
      className="flex h-10 items-center justify-between border-b border-border bg-card px-4 shrink-0"
      data-tauri-drag-region
    >
      <div className="flex-1" data-tauri-drag-region />

      {/* Window controls */}
      <div className="no-drag flex items-center gap-1">
        <button
          onClick={() => win.minimize()}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent transition-colors"
          aria-label="Minimize"
        >
          <Minus className="h-3 w-3" />
        </button>
        <button
          onClick={() => win.toggleMaximize()}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent transition-colors"
          aria-label="Maximize"
        >
          <Square className="h-3 w-3" />
        </button>
        <button
          onClick={() => win.close()}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded transition-colors",
            "hover:bg-destructive hover:text-destructive-foreground"
          )}
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </header>
  );
}
