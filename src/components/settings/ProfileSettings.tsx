import { useState } from "react";
import { Download, Upload, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProfileStore } from "@/store/profileStore";

export function ProfileSettings() {
  const { profiles, activeProfileId, updateProfile } = useProfileStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditName(name);
  }

  function saveEdit(id: string) {
    if (editName.trim()) updateProfile(id, { name: editName.trim() });
    setEditingId(null);
  }

  function exportProfile(id: string) {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name}.devdeck.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importProfile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (
          typeof data !== "object" || data === null ||
          typeof data.name !== "string" || !data.name.trim() ||
          !Array.isArray(data.pages) ||
          !data.pages.every((p: unknown) =>
            typeof p === "object" && p !== null &&
            typeof (p as Record<string, unknown>).name === "string" &&
            Array.isArray((p as Record<string, unknown>).buttons)
          )
        ) {
          throw new Error("Fichier de profil invalide ou corrompu.");
        }
        useProfileStore.getState().addProfile({ ...data, id: crypto.randomUUID() });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Fichier de profil invalide.");
      }
    };
    input.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium">Profils</span>
        <Button size="sm" variant="outline" onClick={importProfile} className="gap-2">
          <Upload className="h-3.5 w-3.5" /> Importer
        </Button>
      </div>

      <div className="space-y-2">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-lg border p-3">
            {editingId === p.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(p.id)}
                  className="h-7 flex-1 text-sm"
                  autoFocus
                />
                <button onClick={() => saveEdit(p.id)} className="text-primary hover:opacity-80"><Check className="h-4 w-4" /></button>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:opacity-80"><X className="h-4 w-4" /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{p.name}</span>
                {p.id === activeProfileId && <Badge variant="secondary" className="text-xs">Actif</Badge>}
                <span className="text-xs text-muted-foreground">{p.pages.length} page{p.pages.length > 1 ? "s" : ""}</span>
                <button onClick={() => startEdit(p.id, p.name)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => exportProfile(p.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ))}

        {profiles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun profil. Créez-en un depuis la barre latérale.</p>
        )}
      </div>
    </div>
  );
}
