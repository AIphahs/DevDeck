import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface Props {
  value: string;
  onChange: (keys: string) => void;
  placeholder?: string;
}

function buildCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.metaKey) parts.push("Meta");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  const { key } = e;
  if (!["Control", "Alt", "Shift", "Meta"].includes(key)) {
    parts.push(key.length === 1 ? key.toUpperCase() : key);
  }
  return parts.join("+");
}

const MODIFIER_ONLY = new Set(["Ctrl", "Alt", "Shift", "Meta", "Ctrl+Shift", "Ctrl+Alt", "Alt+Shift", "Ctrl+Alt+Shift"]);

export function HotkeyRecorder({ value, onChange, placeholder = "Cliquer pour enregistrer…" }: Props) {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!recording) return;
    function onKey(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();
      const combo = buildCombo(e);
      if (combo && !MODIFIER_ONLY.has(combo)) {
        onChange(combo);
        setRecording(false);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [recording, onChange]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setRecording(true)}
        onBlur={() => setRecording(false)}
        className={cn(
          "flex-1 rounded-md border px-3 py-2 text-sm text-left font-mono transition-colors focus:outline-none",
          recording
            ? "border-primary bg-primary/5 text-primary"
            : value
            ? "border-input bg-background"
            : "border-input bg-background"
        )}
      >
        {recording ? (
          <span className="animate-pulse">Appuyez sur la combinaison…</span>
        ) : value ? (
          value
        ) : (
          <span className="text-muted-foreground font-sans text-sm">{placeholder}</span>
        )}
      </button>
      {value && !recording && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
