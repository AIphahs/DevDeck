import { useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Pencil, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/store/profileStore";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { ButtonCard } from "./ButtonCard";
import { EmptySlot } from "./EmptySlot";
import { ButtonEditor } from "./ButtonEditor";
import type { Button as ButtonType, Page } from "@/types";
import { generateId } from "@/utils/format";

const COLS = 5;
const ROWS = 3;
const TOTAL = COLS * ROWS;

export function ButtonGrid() {
  const { addButton, updateButton, deleteButton, addPage } = useProfileStore();
  const profile = useActiveProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [editingButton, setEditingButton] = useState<ButtonType | null>(null);
  const [newSlot, setNewSlot] = useState<{ col: number; row: number } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <p className="text-sm">No profile selected.</p>
        <p className="text-xs">Create a profile in Settings.</p>
      </div>
    );
  }

  const pages = profile.pages;
  const currentPage: Page | undefined = pages[currentPageIdx];

  function getButtonAt(col: number, row: number): ButtonType | undefined {
    return currentPage?.buttons.find((b) => b.col === col && b.row === row);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentPage) return;

    const moved = currentPage.buttons.find((b) => b.id === active.id);
    const target = currentPage.buttons.find((b) => b.id === over.id);
    if (!moved || !target) return;

    updateButton(profile.id, currentPage.id, moved.id, { col: target.col, row: target.row });
    updateButton(profile.id, currentPage.id, target.id, { col: moved.col, row: moved.row });
  }

  function handleAddButton(col: number, row: number) {
    setNewSlot({ col, row });
    setEditingButton(null);
    setEditorOpen(true);
  }

  function handleSaveButton(button: ButtonType) {
    if (!currentPage) return;
    if (button.id && currentPage.buttons.find((b) => b.id === button.id)) {
      updateButton(profile.id, currentPage.id, button.id, { ...button, pageId: currentPage.id });
    } else {
      addButton(profile.id, currentPage.id, { ...button, pageId: currentPage.id });
    }
  }

  function handleDeleteButton(id: string) {
    if (!currentPage) return;
    deleteButton(profile.id, currentPage.id, id);
  }

  function handleAddPage() {
    addPage(profile.id, {
      id: generateId(),
      profileId: profile.id,
      name: `Page ${pages.length + 1}`,
      position: pages.length,
      buttons: [],
    });
    setCurrentPageIdx(pages.length);
  }

  const buttonIds = currentPage?.buttons.map((b) => b.id) ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Deck</h1>
          <p className="text-sm text-muted-foreground">{profile.name}</p>
        </div>
        <Button
          size="sm"
          variant={isEditing ? "default" : "outline"}
          onClick={() => setIsEditing((v) => !v)}
          className="gap-2"
        >
          {isEditing ? <><Check className="h-4 w-4" />Done</> : <><Pencil className="h-4 w-4" />Edit</>}
        </Button>
      </div>

      {/* Button grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={buttonIds} strategy={rectSortingStrategy}>
          <div
            className="flex-1 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            }}
          >
            {Array.from({ length: TOTAL }, (_, i) => {
              const col = i % COLS;
              const row = Math.floor(i / COLS);
              const btn = getButtonAt(col, row);

              return (
                <AnimatePresence key={`${col}-${row}`} mode="wait">
                  {btn ? (
                    <motion.div
                      key={btn.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="aspect-square"
                    >
                      <ButtonCard
                        button={btn}
                        isEditing={isEditing}
                        onEdit={(b) => { setEditingButton(b); setEditorOpen(true); }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`empty-${col}-${row}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="aspect-square"
                    >
                      <EmptySlot col={col} row={row} isEditing={isEditing} onAdd={handleAddButton} />
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Page navigation */}
      <div className="flex items-center justify-center gap-2">
        <Button size="icon" variant="ghost" disabled={currentPageIdx === 0} onClick={() => setCurrentPageIdx((i) => i - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1.5">
          {pages.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrentPageIdx(i)}
              className={`h-2 w-2 rounded-full transition-all ${i === currentPageIdx ? "bg-primary w-4" : "bg-muted-foreground/40"}`}
            />
          ))}
          {isEditing && (
            <button
              onClick={handleAddPage}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>

        <Button size="icon" variant="ghost" disabled={currentPageIdx >= pages.length - 1} onClick={() => setCurrentPageIdx((i) => i + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Button editor dialog */}
      <ButtonEditor
        open={editorOpen}
        button={editingButton}
        col={newSlot?.col}
        row={newSlot?.row}
        onClose={() => { setEditorOpen(false); setEditingButton(null); setNewSlot(null); }}
        onSave={handleSaveButton}
        onDelete={handleDeleteButton}
      />
    </div>
  );
}
