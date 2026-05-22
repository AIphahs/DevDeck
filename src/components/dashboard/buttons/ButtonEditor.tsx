import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { HotkeyRecorder } from "@/components/shared/HotkeyRecorder";
import { cn } from "@/utils/cn";
import type { Button as ButtonType, ActionType } from "@/types";
import { generateId } from "@/utils/format";

const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: "command", label: "Shell Command" },
  { value: "url", label: "Open URL" },
  { value: "app", label: "Launch App" },
  { value: "hotkey", label: "Send Hotkey" },
  { value: "multi", label: "Multi-Action" },
  { value: "sound", label: "Play Sound" },
];

const SHELL_OPTIONS = [
  { value: "powershell", label: "PowerShell" },
  { value: "bash", label: "Bash" },
  { value: "cmd", label: "CMD" },
];

const PRESET_ICONS = ["⚡", "🚀", "🐳", "🔗", "📋", "🎵", "🔧", "📦", "🌐", "💻", "🔒", "📊"];

interface Step {
  id: string;
  actionType: "command" | "url" | "app";
  value: string;
  shell: string;
  delay: number;
}

interface Props {
  button: ButtonType | null;
  col?: number;
  row?: number;
  open: boolean;
  onClose: () => void;
  onSave: (button: ButtonType) => void;
  onDelete?: (id: string) => void;
}

function emptyStep(): Step {
  return { id: generateId(), actionType: "command", value: "", shell: "powershell", delay: 0 };
}

export function ButtonEditor({ button, col = 0, row = 0, open, onClose, onSave, onDelete }: Props) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [actionType, setActionType] = useState<ActionType>("command");
  const [command, setCommand] = useState("");
  const [shell, setShell] = useState("powershell");
  const [url, setUrl] = useState("");
  const [hotkey, setHotkey] = useState("");
  const [steps, setSteps] = useState<Step[]>([emptyStep()]);
  const [soundPath, setSoundPath] = useState("");
  const [soundVolume, setSoundVolume] = useState(1);
  const [soundLoop, setSoundLoop] = useState(false);
  const [bgColor, setBgColor] = useState("");

  useEffect(() => {
    if (button) {
      setLabel(button.label);
      setIcon(button.icon ?? "");
      setActionType(button.actionType);
      setCommand(((button.actionData.command ?? button.actionData.path) as string) ?? "");
      setShell((button.actionData.shell as string) ?? "powershell");
      setUrl((button.actionData.url as string) ?? "");
      setHotkey((button.actionData.hotkey as string) ?? "");
      setSoundPath((button.actionData.soundPath as string) ?? "");
      setSoundVolume((button.actionData.volume as number) ?? 1);
      setSoundLoop((button.actionData.loop as boolean) ?? false);
      setBgColor(button.styleData.backgroundColor ?? "");

      // Normalize saved steps (supports both simplified Step format and legacy Button format)
      const savedSteps = button.actionData.steps;
      if (Array.isArray(savedSteps) && savedSteps.length > 0) {
        setSteps(
          savedSteps.map((s: Record<string, unknown>) => ({
            id: (s.id as string) ?? generateId(),
            actionType: (s.actionType as Step["actionType"]) ?? "command",
            value: ((s.value ?? (s.actionData as Record<string, unknown>)?.command ?? (s.actionData as Record<string, unknown>)?.url ?? (s.actionData as Record<string, unknown>)?.path) as string) ?? "",
            shell: ((s.shell ?? (s.actionData as Record<string, unknown>)?.shell) as string) ?? "powershell",
            delay: ((s.delay ?? (s.actionData as Record<string, unknown>)?.delay) as number) ?? 0,
          }))
        );
      } else {
        setSteps([emptyStep()]);
      }
    } else {
      setLabel("");
      setIcon("");
      setActionType("command");
      setCommand("");
      setShell("powershell");
      setUrl("");
      setHotkey("");
      setSteps([emptyStep()]);
      setSoundPath("");
      setSoundVolume(1);
      setSoundLoop(false);
      setBgColor("");
    }
  }, [button, open]);

  function handleSave() {
    const actionData: Record<string, unknown> = {};
    if (actionType === "command") { actionData.command = command; actionData.shell = shell; }
    if (actionType === "url") actionData.url = url;
    if (actionType === "app") actionData.path = command;
    if (actionType === "hotkey") actionData.hotkey = hotkey;
    if (actionType === "multi") actionData.steps = steps;
    if (actionType === "sound") { actionData.soundPath = soundPath; actionData.volume = soundVolume; actionData.loop = soundLoop; }

    const next: ButtonType = {
      id: button?.id ?? generateId(),
      pageId: button?.pageId ?? "",
      label,
      icon: icon || undefined,
      col: button?.col ?? col,
      row: button?.row ?? row,
      actionType,
      actionData,
      styleData: { backgroundColor: bgColor || undefined },
    };
    onSave(next);
    onClose();
  }

  function addStep() { setSteps((s) => [...s, emptyStep()]); }
  function removeStep(id: string) { setSteps((s) => s.filter((x) => x.id !== id)); }
  function updateStep(id: string, patch: Partial<Step>) {
    setSteps((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{button ? "Modifier le bouton" : "Nouveau bouton"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border text-center"
              style={{ backgroundColor: bgColor || undefined }}
            >
              <span className="text-2xl">{icon || "?"}</span>
              <span className="text-[10px] font-medium px-1 line-clamp-2">{label || "Bouton"}</span>
            </div>
          </div>

          <Separator />

          {/* Label */}
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Mon bouton" />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label>Icône (emoji)</Label>
            <div className="flex gap-1 flex-wrap">
              {PRESET_ICONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={cn(
                    "rounded border p-1.5 text-lg transition-colors hover:bg-accent",
                    icon === e ? "border-primary bg-primary/10" : "border-transparent"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Ou saisissez un emoji" />
          </div>

          {/* Action type */}
          <div className="space-y-1.5">
            <Label>Action</Label>
            <Select value={actionType} onValueChange={(v) => setActionType(v as ActionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Command */}
          {actionType === "command" && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label>Shell</Label>
                <Select value={shell} onValueChange={setShell}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHELL_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Commande</Label>
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="echo Hello World"
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* URL */}
          {actionType === "url" && (
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
          )}

          {/* App */}
          {actionType === "app" && (
            <div className="space-y-1.5">
              <Label>Chemin de l'application</Label>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="C:\Program Files\…"
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Hotkey */}
          {actionType === "hotkey" && (
            <div className="space-y-1.5">
              <Label>Raccourci clavier</Label>
              <HotkeyRecorder value={hotkey} onChange={setHotkey} />
              <p className="text-xs text-muted-foreground">
                Ce raccourci sera envoyé à la fenêtre active lors du clic.
              </p>
            </div>
          )}

          {/* Sound */}
          {actionType === "sound" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Fichier audio</Label>
                <Input
                  value={soundPath}
                  onChange={(e) => setSoundPath(e.target.value)}
                  placeholder="C:\sounds\alerte.mp3"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">Formats supportés : MP3, WAV, OGG, FLAC</p>
              </div>
              <div className="space-y-1.5">
                <Label>Volume <span className="text-muted-foreground font-normal">({Math.round(soundVolume * 100)}%)</span></Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={soundLoop}
                  onChange={(e) => setSoundLoop(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-sm">Lecture en boucle</span>
              </label>
            </div>
          )}

          {/* Multi-step */}
          {actionType === "multi" && (
            <div className="space-y-2">
              <Label>Étapes</Label>
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={step.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">Étape {i + 1}</span>
                      </div>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Select
                        value={step.actionType}
                        onValueChange={(v) => updateStep(step.id, { actionType: v as Step["actionType"] })}
                      >
                        <SelectTrigger className="h-7 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="command">Shell</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="app">App</SelectItem>
                        </SelectContent>
                      </Select>

                      {step.actionType === "command" && (
                        <Select
                          value={step.shell}
                          onValueChange={(v) => updateStep(step.id, { shell: v })}
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SHELL_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <div className="flex items-center gap-1 w-24">
                        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                        <Input
                          type="number"
                          min={0}
                          step={100}
                          value={step.delay}
                          onChange={(e) => updateStep(step.id, { delay: Number(e.target.value) })}
                          className="h-7 text-xs"
                          placeholder="0ms"
                        />
                      </div>
                    </div>

                    <Input
                      value={step.value}
                      onChange={(e) => updateStep(step.id, { value: e.target.value })}
                      placeholder={
                        step.actionType === "url" ? "https://…" :
                        step.actionType === "app" ? "C:\\…" :
                        "Commande…"
                      }
                      className="font-mono text-xs h-7"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                className="w-full gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Ajouter une étape
              </Button>
            </div>
          )}

          {/* Background color */}
          <div className="space-y-1.5">
            <Label>Couleur de fond</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor || "#1e293b"}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-9 w-9 rounded border cursor-pointer"
              />
              <Input
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="Laisser vide pour la couleur par défaut"
                className="flex-1"
              />
              {bgColor && (
                <button
                  type="button"
                  onClick={() => setBgColor("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {button && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => { onDelete(button.id); onClose(); }}>
              Supprimer
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" onClick={handleSave} disabled={!label.trim()}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
