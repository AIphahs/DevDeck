import { useState } from "react";
import { Plus, Trash2, Keyboard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HotkeyRecorder } from "@/components/shared/HotkeyRecorder";
import { useShortcutStore } from "@/store/shortcutStore";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { cn } from "@/utils/cn";
import type { Button as ButtonType } from "@/types";

export function ShortcutsSettings() {
  const { bindings, addBinding, updateBinding, removeBinding } = useShortcutStore();
  const profile = useActiveProfile();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedButtonId, setSelectedButtonId] = useState("");
  const [newKeys, setNewKeys] = useState("");

  const allButtons: ButtonType[] = profile ? profile.pages.flatMap((p) => p.buttons) : [];
  const profileBindings = profile ? bindings.filter((b) => b.profileId === profile.id) : [];

  function getButtonLabel(actionId: string): string {
    const btn = allButtons.find((b) => b.id === actionId);
    return btn ? `${btn.icon ? btn.icon + " " : ""}${btn.label}` : actionId;
  }

  function handleAdd() {
    if (!newKeys || !selectedButtonId || !profile) return;
    addBinding({ profileId: profile.id, keys: newKeys, actionId: selectedButtonId, enabled: true });
    setSelectedButtonId("");
    setNewKeys("");
    setAddOpen(false);
  }

  function closeAdd() {
    setAddOpen(false);
    setSelectedButtonId("");
    setNewKeys("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base font-medium">Raccourcis globaux</p>
        <p className="text-sm text-muted-foreground mt-1">
          Raccourcis clavier déclenchant des actions de votre Deck lorsque DevDeck est au premier plan.
        </p>
      </div>

      {!profile && (
        <p className="text-sm text-muted-foreground">Aucun profil actif.</p>
      )}

      {profile && profileBindings.length === 0 && !addOpen && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">
          <Keyboard className="h-8 w-8 opacity-40" />
          <div className="space-y-0.5">
            <p className="text-sm">Aucun raccourci configuré.</p>
            <p className="text-xs opacity-70">Liez une combinaison de touches à un bouton du Deck.</p>
          </div>
        </div>
      )}

      {profile && profileBindings.length > 0 && (
        <div className="space-y-2">
          {profileBindings.map((b) => (
            <div
              key={b.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border p-3 transition-opacity",
                !b.enabled && "opacity-50"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                  <p className="text-sm font-medium truncate">{getButtonLabel(b.actionId)}</p>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {b.keys.split("+").map((k, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      {i > 0 && <span className="text-muted-foreground text-[10px]">+</span>}
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-border bg-muted">
                        {k}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => updateBinding(b.id, { enabled: !b.enabled })}
                aria-label={b.enabled ? "Désactiver" : "Activer"}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors shrink-0",
                  b.enabled ? "bg-primary" : "bg-muted border border-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    b.enabled && "translate-x-4"
                  )}
                />
              </button>

              <button
                type="button"
                onClick={() => removeBinding(b.id)}
                aria-label="Supprimer"
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {profile && addOpen && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm font-medium">Nouveau raccourci</p>

          <div className="space-y-1.5">
            <Label className="text-xs">Bouton à déclencher</Label>
            {allButtons.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucun bouton dans ce profil. Créez d'abord des boutons dans l'onglet Deck.
              </p>
            ) : (
              <Select value={selectedButtonId} onValueChange={setSelectedButtonId}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Choisir un bouton…" />
                </SelectTrigger>
                <SelectContent>
                  {allButtons.map((btn) => (
                    <SelectItem key={btn.id} value={btn.id}>
                      {btn.icon ? `${btn.icon} ` : ""}{btn.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Combinaison de touches</Label>
            <HotkeyRecorder value={newKeys} onChange={setNewKeys} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={closeAdd}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!newKeys || !selectedButtonId}>
              Ajouter
            </Button>
          </div>
        </div>
      )}

      {profile && !addOpen && (
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Ajouter un raccourci
        </Button>
      )}
    </div>
  );
}
