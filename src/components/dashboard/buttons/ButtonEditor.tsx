import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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

const PRESET_ICONS = ["⚡", "🚀", "🐳", "🔗", "📋", "🎵", "🔧", "📦", "🌐", "💻", "🔒", "📊"];

interface Props {
  button: ButtonType | null;
  col?: number;
  row?: number;
  open: boolean;
  onClose: () => void;
  onSave: (button: ButtonType) => void;
  onDelete?: (id: string) => void;
}

export function ButtonEditor({ button, col = 0, row = 0, open, onClose, onSave, onDelete }: Props) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [actionType, setActionType] = useState<ActionType>("command");
  const [command, setCommand] = useState("");
  const [url, setUrl] = useState("");
  const [bgColor, setBgColor] = useState("");

  useEffect(() => {
    if (button) {
      setLabel(button.label);
      setIcon(button.icon ?? "");
      setActionType(button.actionType);
      setCommand((button.actionData.command as string) ?? "");
      setUrl((button.actionData.url as string) ?? "");
      setBgColor(button.styleData.backgroundColor ?? "");
    } else {
      setLabel("");
      setIcon("");
      setActionType("command");
      setCommand("");
      setUrl("");
      setBgColor("");
    }
  }, [button, open]);

  function handleSave() {
    const actionData: Record<string, unknown> = {};
    if (actionType === "command") actionData.command = command;
    if (actionType === "url") actionData.url = url;
    if (actionType === "app") actionData.path = command;

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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{button ? "Edit Button" : "New Button"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border text-center"
              style={{ backgroundColor: bgColor || undefined }}
            >
              <span className="text-2xl">{icon || "?"}</span>
              <span className="text-[10px] font-medium px-1 line-clamp-2">{label || "Button"}</span>
            </div>
          </div>

          <Separator />

          {/* Label */}
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="My button" />
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <Label>Icon (emoji)</Label>
            <div className="flex gap-1 flex-wrap">
              {PRESET_ICONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`rounded border p-1.5 text-lg transition-colors hover:bg-accent ${icon === e ? "border-primary bg-primary/10" : "border-transparent"}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Or type any emoji" />
          </div>

          {/* Action */}
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

          {/* Action-specific fields */}
          {actionType === "command" && (
            <div className="space-y-1.5">
              <Label>Command</Label>
              <Input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="echo Hello World" className="font-mono text-xs" />
            </div>
          )}
          {actionType === "url" && (
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}
          {actionType === "app" && (
            <div className="space-y-1.5">
              <Label>Application path</Label>
              <Input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="C:\Program Files\..." className="font-mono text-xs" />
            </div>
          )}

          {/* Color */}
          <div className="space-y-1.5">
            <Label>Background color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor || "#1e293b"} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-9 rounded border cursor-pointer" />
              <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} placeholder="Leave empty for default" className="flex-1" />
              {bgColor && <button onClick={() => setBgColor("")} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {button && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => { onDelete(button.id); onClose(); }}>
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
