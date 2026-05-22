import { Puzzle, Package, Code2, Store, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: Store, label: "Marketplace", desc: "Découvrez et installez des plugins créés par la communauté depuis un dépôt central." },
  { icon: Package, label: "Gestion des plugins", desc: "Activez, désactivez et mettez à jour vos plugins sans redémarrer l'application." },
  { icon: Code2, label: "SDK développeur", desc: "Créez vos propres plugins avec le SDK TypeScript — nouveaux types d'actions et widgets." },
];

export function PluginsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
          <Puzzle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">Plugins</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Étendez DevDeck avec des plugins communautaires ou créez les vôtres.
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> Phase 8 — À venir
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
