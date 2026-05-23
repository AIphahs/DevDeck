import { useState } from "react";
import { Plus, Clock, Cpu, HardDrive, MemoryStick, GitBranch, Container, StickyNote, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWidgetStore } from "@/store/widgetStore";
import { useT } from "@/hooks/useT";
import type { WidgetType } from "@/types";

export function AddWidgetMenu() {
  const addWidget = useWidgetStore((s) => s.addWidget);
  const [open, setOpen] = useState(false);
  const t = useT();

  const WIDGET_CATALOG: { type: WidgetType; label: string; icon: React.ReactNode; colSpan: number; rowSpan: number }[] = [
    { type: "clock", label: t.widgets.clock, icon: <Clock className="h-5 w-5" />, colSpan: 2, rowSpan: 1 },
    { type: "cpu-monitor", label: t.widgets.cpu, icon: <Cpu className="h-5 w-5" />, colSpan: 2, rowSpan: 1 },
    { type: "ram-monitor", label: t.widgets.ram, icon: <MemoryStick className="h-5 w-5" />, colSpan: 2, rowSpan: 1 },
    { type: "disk-monitor", label: t.widgets.disk, icon: <HardDrive className="h-5 w-5" />, colSpan: 2, rowSpan: 1 },
    { type: "git-status", label: t.widgets.git, icon: <GitBranch className="h-5 w-5" />, colSpan: 3, rowSpan: 1 },
    { type: "docker-status", label: t.widgets.docker, icon: <Container className="h-5 w-5" />, colSpan: 3, rowSpan: 2 },
    { type: "notes", label: t.widgets.notes, icon: <StickyNote className="h-5 w-5" />, colSpan: 3, rowSpan: 2 },
    { type: "soundboard", label: t.widgets.soundboard, icon: <Music2 className="h-5 w-5" />, colSpan: 4, rowSpan: 2 },
  ];

  function handleAdd(item: (typeof WIDGET_CATALOG)[0]) {
    addWidget({
      type: item.type,
      title: item.label,
      col: 0,
      row: 99,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan,
      config: {},
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> {t.dashboard.addWidget}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.dashboard.addWidgetTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {WIDGET_CATALOG.map((item) => (
            <button
              key={item.type}
              onClick={() => handleAdd(item)}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 text-sm hover:bg-accent transition-colors"
            >
              <span className="text-primary">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
