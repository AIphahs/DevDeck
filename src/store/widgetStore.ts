import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Widget } from "@/types";
import { generateId } from "@/utils/format";

interface WidgetState {
  widgets: Widget[];
  addWidget: (widget: Omit<Widget, "id">) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  reorderWidgets: (orderedIds: string[]) => void;
  moveWidget: (id: string, col: number, row: number) => void;
  resizeWidget: (id: string, colSpan: number, rowSpan: number) => void;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: "w-clock", type: "clock", col: 0, row: 0, colSpan: 2, rowSpan: 1, config: {} },
  { id: "w-cpu", type: "cpu-monitor", title: "CPU", col: 2, row: 0, colSpan: 2, rowSpan: 1, config: { refreshInterval: 2000 } },
  { id: "w-ram", type: "ram-monitor", title: "RAM", col: 4, row: 0, colSpan: 2, rowSpan: 1, config: { refreshInterval: 2000 } },
];

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,

      addWidget: (widget) =>
        set((s) => ({ widgets: [...s.widgets, { ...widget, id: generateId() }] })),

      updateWidget: (id, updates) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        })),

      removeWidget: (id) =>
        set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),

      reorderWidgets: (orderedIds) =>
        set((s) => ({
          widgets: orderedIds
            .map((id) => s.widgets.find((w) => w.id === id))
            .filter((w): w is Widget => w !== undefined),
        })),

      moveWidget: (id, col, row) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, col, row } : w)),
        })),

      resizeWidget: (id, colSpan, rowSpan) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, colSpan, rowSpan } : w)),
        })),
    }),
    { name: "devdeck-widgets" }
  )
);
