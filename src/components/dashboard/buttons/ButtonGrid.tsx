import { useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext as _SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { FC, ReactNode } from "react";
// dnd-kit v8 returns Element instead of ReactNode — cast for React 19 JSX compat
const SortableContext = _SortableContext as unknown as FC<{ items: (string | number)[]; strategy?: typeof rectSortingStrategy; children?: ReactNode }>;
import { Pencil, Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  const { addButton, updateButton, deleteButton, addPage, deletePage } = useProfileStore();
  const profile = useActiveProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [editingButton, setEditingButton] = useState<ButtonType | null>(null);
  const [newSlot, setNewSlot] = useState<{ col: number; row: number } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteConfirmPage, setDeleteConfirmPage] = useState<Page | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <p className="text-sm">Aucun profil sélectionné.</p>
        <p className="text-xs">Créez un profil dans Paramètres.</p>
      </div>
    );
  }

  const pages = profile.pages;
  const currentPage: Page | undefined = pages[currentPageIdx];

  function getButtonAt(col: number, row: number): ButtonType | undefined {
    return currentPage?.buttons.find((b) => b.col === col && b.row === row);
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!profile) return;
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
    if (!profile || !currentPage) return;
    if (button.id && currentPage.buttons.find((b) => b.id === button.id)) {
      updateButton(profile.id, currentPage.id, button.id, { ...button, pageId: currentPage.id });
    } else {
      addButton(profile.id, currentPage.id, { ...button, pageId: currentPage.id });
    }
  }

  function handleDeleteButton(id: string) {
    if (!profile || !currentPage) return;
    deleteButton(profile.id, currentPage.id, id);
  }

  function handleAddPage() {
    if (!profile) return;
    addPage(profile.id, {
      id: generateId(),
      profileId: profile.id,
      name: `Page ${pages.length + 1}`,
      position: pages.length,
      buttons: [],
    });
    setCurrentPageIdx(pages.length);
  }

  function handleDeletePageRequest(page: Page) {
    if (page.buttons.length === 0) {
      // Empty page — delete immediately without confirmation
      doDeletePage(page);
    } else {
      setDeleteConfirmPage(page);
    }
  }

  function doDeletePage(page: Page) {
    if (!profile) return;
    const idx = pages.findIndex((p) => p.id === page.id);
    deletePage(profile.id, page.id);
    // Adjust currentPageIdx so we don't go out of bounds
    if (idx < currentPageIdx) {
      setCurrentPageIdx((prev) => prev - 1);
    } else if (idx === currentPageIdx) {
      setCurrentPageIdx(Math.max(0, idx - 1));
    }
    setDeleteConfirmPage(null);
  }

  const buttonIds = currentPage?.buttons.map((b) => b.id) ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4 overflow-hidden">
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
          {isEditing ? <><Check className="h-4 w-4" /> Terminé</> : <><Pencil className="h-4 w-4" /> Modifier</>}
        </Button>
      </div>

      {/* Button grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={buttonIds} strategy={rectSortingStrategy}>
          <div
            className="flex-1 min-h-0 grid gap-2"
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
                      className="h-full w-full"
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
                      className="h-full w-full"
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
        <Button
          size="icon" variant="ghost"
          disabled={currentPageIdx === 0}
          onClick={() => setCurrentPageIdx((i) => i - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {pages.map((p, i) => (
            <div key={p.id} className="group relative flex flex-col items-center">
              {/* Delete button — shown on hover when editing and more than 1 page */}
              {isEditing && pages.length > 1 && (
                <button
                  onClick={() => handleDeletePageRequest(p)}
                  title={`Supprimer "${p.name}"`}
                  className={cn(
                    "absolute -top-5 left-1/2 -translate-x-1/2",
                    "flex h-4 w-4 items-center justify-center rounded-full",
                    "bg-destructive text-destructive-foreground",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                    "hover:scale-110"
                  )}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}

              {/* Page dot */}
              <button
                onClick={() => setCurrentPageIdx(i)}
                title={p.name}
                className={cn(
                  "h-2 rounded-full transition-all duration-200",
                  i === currentPageIdx
                    ? "bg-primary w-5"
                    : "bg-muted-foreground/40 w-2 hover:bg-muted-foreground/60"
                )}
              />

              {/* Page name — shown below active dot when editing */}
              {isEditing && i === currentPageIdx && (
                <span className="absolute top-4 text-[10px] text-muted-foreground whitespace-nowrap">
                  {p.name}
                </span>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              onClick={handleAddPage}
              title="Ajouter une page"
              className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>

        <Button
          size="icon" variant="ghost"
          disabled={currentPageIdx >= pages.length - 1}
          onClick={() => setCurrentPageIdx((i) => i + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete page confirmation */}
      <Dialog open={!!deleteConfirmPage} onOpenChange={(o) => { if (!o) setDeleteConfirmPage(null); }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Supprimer la page</DialogTitle>
            <DialogDescription>
              "{deleteConfirmPage?.name}" contient {deleteConfirmPage?.buttons.length} bouton
              {(deleteConfirmPage?.buttons.length ?? 0) > 1 ? "s" : ""}. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmPage(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmPage && doDeletePage(deleteConfirmPage)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
