import { Music2, Volume2, FolderOpen, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: Volume2, label: "Boutons sonores", desc: "Assignez un son à n'importe quel bouton de votre Deck et déclenchez-le en un clic." },
  { icon: FolderOpen, label: "Bibliothèque locale", desc: "Importez vos propres fichiers audio (MP3, WAV, OGG) depuis votre machine." },
  { icon: Music2, label: "Howler.js", desc: "Lecture audio performante avec contrôle du volume, fondu et superposition." },
];

export function SoundboardPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
          <Music2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">Soundboard</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Déclenchez des sons, alertes ou notifications audio depuis votre Deck.
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> Phase 5 — À venir
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full max-w-md">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
