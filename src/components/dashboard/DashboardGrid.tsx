import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWidgetStore } from "@/store/widgetStore";
import { WidgetCard } from "./WidgetCard";
import { AddWidgetMenu } from "./AddWidgetMenu";

const GRID_COLS = 8;

export function DashboardGrid() {
  const { widgets, reorderWidgets } = useWidgetStore();
  const [isEditing, setIsEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgets.findIndex((w) => w.id === active.id);
    const newIndex = widgets.findIndex((w) => w.id === over.id);

    const reordered = arrayMove(widgets, oldIndex, newIndex);
    reorderWidgets(reordered.map((w) => w.id));
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de votre DevDeck</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && <AddWidgetMenu />}
          <Button
            size="sm"
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing((v) => !v)}
            className="gap-2"
          >
            {isEditing ? (
              <><Check className="h-4 w-4" /> Terminé</>
            ) : (
              <><Pencil className="h-4 w-4" /> Modifier</>
            )}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div
            className="grid auto-rows-[100px] gap-3"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
          >
            {widgets.map((widget) => (
              <WidgetCard key={widget.id} widget={widget} isEditing={isEditing} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {widgets.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <p className="text-sm">Aucun widget — ajoutez-en un pour commencer.</p>
          <AddWidgetMenu />
        </div>
      )}
    </div>
  );
}
