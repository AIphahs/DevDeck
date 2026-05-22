import { Bot, Sparkles, Zap, MessageSquare } from "lucide-react";

const FEATURES = [
  { icon: MessageSquare, label: "Chat contextuel", desc: "Posez des questions sur votre code, vos logs ou vos containers directement depuis DevDeck." },
  { icon: Zap, label: "Actions intelligentes", desc: "Générez des commandes shell, des scripts ou des configurations à la demande." },
  { icon: Sparkles, label: "Claude API", desc: "Intégration avec Claude Sonnet pour des réponses rapides et précises." },
];

export function AIPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">Assistant IA</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Un assistant intégré alimenté par Claude pour vous aider dans vos tâches de développement.
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> Phase 4 — À venir
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
