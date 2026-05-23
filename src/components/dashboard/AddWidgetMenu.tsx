import { useState } from "react";
import { Plus, Clock, Cpu, HardDrive, MemoryStick, GitBranch, Container, StickyNote, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWidgetStore } from "@/store/widgetStore";
import type { WidgetType } from "@/types";

const WIDGET_CATALOG: { type: WidgetType; label: string; icon: React.ReactNode; colSpan: number; rowSpan: number }[] = [
  { type: "clock", label: "Horloge", icon: <Clock className="h-5 w-5" />, colSpan: 2, rowSpan: 1 },
  { type: "cpu-monitor", label: "CPU", icon: <Cpu className="h-5 w-5" />, colSpan: 2, rowSpan: 1 },
  { type: "ram-monitor", label: "Mémoire RAM", icon: <MemoryStick className="h-5 w-5" />, colSpan: 2, rowSpan: 1 },
  { type: "disk-monitor", label: "Disque", icon: <HardDrive className="h-5 w-5" />, colSpan: 2, rowSpan: 1 },
  { type: "git-status", label: "Statut Git", icon: <GitBranch className="h-5 w-5" />, colSpan: 3, rowSpan: 1 },
  { type: "docker-status", label: "Docker", icon: <Container className="h-5 w-5" />, colSpan: 3, rowSpan: 2 },
  { type: "notes", label: "Notes", icon: <StickyNote className="h-5 w-5" />, colSpan: 3, rowSpan: 2 },
  { type: "soundboard", label: "Soundboard", icon: <Music2 className="h-5 w-5" />, colSpan: 4, rowSpan: 2 },
];

export function AddWidgetMenu() {
  const addWidget = useWidgetStore((s) => s.addWidget);
  const [open, setOpen] = useState(false);

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
          <Plus className="h-4 w-4" /> Ajouter widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajouter un widget</DialogTitle>
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
