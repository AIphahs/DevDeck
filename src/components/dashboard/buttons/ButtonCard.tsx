import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useActionStore } from "@/store/actionStore";
import { executeAction } from "@/services/actions/executeAction";
import type { Button as ButtonType } from "@/types";

interface Props {
  button: ButtonType;
  isEditing: boolean;
  onEdit: (button: ButtonType) => void;
}

export function ButtonCard({ button, isEditing, onEdit }: Props) {
  const { runningActionIds, setRunning } = useActionStore();
  const isRunning = runningActionIds.has(button.id);
  const [error, setError] = useState(false);

  async function handleClick() {
    if (isEditing) {
      onEdit(button);
      return;
    }
    if (isRunning) return;

    setError(false);
    setRunning(button.id, true);
    try {
      await executeAction(button);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2000);
    } finally {
      setRunning(button.id, false);
    }
  }

  const bg = button.styleData.backgroundColor;
  const fg = button.styleData.textColor;
  const border = button.styleData.borderColor;

  return (
    <motion.button
      onClick={handleClick}
      whileTap={!isEditing ? { scale: 0.94 } : undefined}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isEditing
          ? "cursor-pointer ring-1 ring-dashed ring-primary/40 hover:ring-primary"
          : "hover:brightness-110 active:brightness-90",
        error && "ring-2 ring-destructive",
        !bg && "bg-card hover:bg-accent"
      )}
      style={{
        backgroundColor: bg,
        color: fg,
        borderColor: border ?? undefined,
      }}
    >
      {/* Icon */}
      {button.icon ? (
        <span className="text-2xl leading-none">{button.icon}</span>
      ) : (
        <div className="h-6 w-6 rounded-md bg-muted/50" />
      )}

      {/* Label */}
      <span
        className="line-clamp-2 text-[11px] font-medium leading-tight"
        style={{ fontSize: button.styleData.fontSize ?? 11 }}
      >
        {button.label || "Button"}
      </span>

      {/* Running spinner */}
      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Edit overlay */}
      {isEditing && (
        <div className="absolute top-1 right-1">
          <Pencil className="h-3 w-3 text-primary" />
        </div>
      )}
    </motion.button>
  );
}
