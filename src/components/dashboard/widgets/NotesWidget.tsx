import { useState, useEffect, useRef } from "react";
import { useWidgetStore } from "@/store/widgetStore";
import type { Widget } from "@/types";

interface Props {
  widget: Widget;
}

export function NotesWidget({ widget }: Props) {
  const updateWidget = useWidgetStore((s) => s.updateWidget);
  const [text, setText] = useState((widget.config.text as string) ?? "");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync if widget config changes externally
  useEffect(() => {
    setText((widget.config.text as string) ?? "");
  }, [widget.id]);

  function handleChange(value: string) {
    setText(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateWidget(widget.id, { config: { ...widget.config, text: value } });
    }, 500);
  }

  return (
    <textarea
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Notes…"
      className="h-full w-full resize-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none leading-relaxed"
      spellCheck={false}
    />
  );
}
