import { useState } from "react";
import { ChevronDown, Plus, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { useProfileStore } from "@/store/profileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { generateId } from "@/utils/format";
import type { Profile } from "@/types";

function createDefaultProfile(name: string): Profile {
  const profileId = generateId();
  const pageId = generateId();
  return {
    id: profileId,
    name,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [
      { id: pageId, profileId, name: "Page 1", position: 0, buttons: [] },
    ],
  };
}

interface Props {
  collapsed: boolean;
}

export function ProfileSelector({ collapsed }: Props) {
  const { profiles, activeProfileId, setActiveProfile, addProfile, deleteProfile } = useProfileStore();
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const [open, setOpen] = useState(false);
  const [newProfileOpen, setNewProfileOpen] = useState(false);
  const [newName, setNewName] = useState("");

  function handleCreate() {
    if (!newName.trim()) return;
    const profile = createDefaultProfile(newName.trim());
    addProfile(profile);
    setActiveProfile(profile.id);
    setNewName("");
    setNewProfileOpen(false);
    setOpen(false);
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-xs font-bold text-primary"
        title={activeProfile?.name ?? "No profile"}
      >
        {(activeProfile?.name ?? "?")[0].toUpperCase()}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent",
          open && "bg-accent"
        )}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-xs font-bold text-primary shrink-0">
          {(activeProfile?.name ?? "?")[0].toUpperCase()}
        </div>
        <span className="flex-1 truncate text-left">{activeProfile?.name ?? "Select profile"}</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-1 shadow-md"
          >
            {profiles.map((p) => (
              <div key={p.id} className="group flex items-center gap-1">
                <button
                  onClick={() => { setActiveProfile(p.id); setOpen(false); }}
                  className="flex flex-1 items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  {p.id === activeProfileId && <Check className="h-3 w-3 text-primary shrink-0" />}
                  <span className={cn("truncate", p.id !== activeProfileId && "pl-4")}>{p.name}</span>
                </button>
                {profiles.length > 1 && (
                  <button
                    onClick={() => deleteProfile(p.id)}
                    className="hidden group-hover:flex h-6 w-6 items-center justify-center rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

            <div className="mt-1 border-t border-border pt-1">
              <button
                onClick={() => setNewProfileOpen(true)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" /> New profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New profile dialog */}
      <Dialog open={newProfileOpen} onOpenChange={setNewProfileOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>New profile</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Profile name"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewProfileOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
