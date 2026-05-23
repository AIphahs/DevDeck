import { useState, useEffect } from "react";
import { Plus, Trash2, Square, Play, Volume2, Music2, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { useSoundStore } from "@/store/soundStore";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useT } from "@/hooks/useT";
import { playClip, stopClip, stopAll, isPlaying, setMasterVolume } from "@/services/audio/soundService";
import { pickAudioFile } from "@/services/tauri/dialog";
import type { SoundClip } from "@/types";

const CLIP_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#06b6d4",
];

export function SoundboardPage() {
  const { clips, masterVolume, addClip, updateClip, removeClip, setMasterVolume: storeMasterVolume } = useSoundStore();
  const profile = useActiveProfile();
  const t = useT();

  const [playingIds, setPlayingIds] = useState<Set<string>>(new Set());
  const [editClip, setEditClip] = useState<SoundClip | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPath, setFormPath] = useState("");
  const [formVolume, setFormVolume] = useState(0.8);
  const [formLoop, setFormLoop] = useState(false);
  const [formColor, setFormColor] = useState(CLIP_COLORS[0]);

  // Sync master volume to Howler on mount and on change
  useEffect(() => {
    setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Poll playing state
  useEffect(() => {
    const id = setInterval(() => {
      setPlayingIds((prev) => {
        const next = new Set<string>();
        for (const clip of clips) {
          if (isPlaying(clip.id)) next.add(clip.id);
        }
        if (prev.size === next.size && [...prev].every((id) => next.has(id))) return prev;
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [clips]);

  const profileClips = profile ? clips.filter((c) => c.profileId === profile.id) : clips;

  function openAdd() {
    setFormName("");
    setFormPath("");
    setFormVolume(0.8);
    setFormLoop(false);
    setFormColor(CLIP_COLORS[0]);
    setEditClip(null);
    setAddOpen(true);
  }

  function openEdit(clip: SoundClip) {
    setFormName(clip.name);
    setFormPath(clip.filePath);
    setFormVolume(clip.volume);
    setFormLoop(clip.loopMode);
    setFormColor((clip.category as string) ?? CLIP_COLORS[0]);
    setEditClip(clip);
    setAddOpen(true);
  }

  function handleSave() {
    if (!formName.trim() || !formPath.trim()) return;
    if (editClip) {
      updateClip(editClip.id, {
        name: formName.trim(),
        filePath: formPath.trim(),
        volume: formVolume,
        loopMode: formLoop,
        category: formColor,
      });
    } else {
      addClip({
        profileId: profile?.id ?? "",
        name: formName.trim(),
        filePath: formPath.trim(),
        volume: formVolume,
        loopMode: formLoop,
        category: formColor,
      });
    }
    setAddOpen(false);
  }

  function handleToggle(clip: SoundClip) {
    if (isPlaying(clip.id)) {
      stopClip(clip.id);
    } else {
      void playClip(clip.id, clip.filePath, clip.volume * masterVolume, clip.loopMode);
    }
  }

  function handleDelete(id: string) {
    stopClip(id);
    removeClip(id);
  }

  function handleMasterVolume(v: number) {
    storeMasterVolume(v);
    setMasterVolume(v);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Music2 className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{t.soundboard.title}</span>
          {profile && (
            <span className="text-xs text-muted-foreground">{profile.name}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Master volume */}
          <div className="flex items-center gap-2">
            <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={masterVolume}
              onChange={(e) => handleMasterVolume(Number(e.target.value))}
              className="w-24 accent-primary"
              title={`Volume maître : ${Math.round(masterVolume * 100)}%`}
            />
            <span className="text-xs text-muted-foreground w-8 tabular-nums">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {playingIds.size > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={stopAll}
              className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
            >
              <Square className="h-3 w-3" /> {t.soundboard.stopAll}
            </Button>
          )}

          <Button size="sm" onClick={openAdd} className="h-7 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> {t.soundboard.add}
          </Button>
        </div>
      </div>

      {/* Clip grid */}
      <ScrollArea className="flex-1">
        {profileClips.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
            <Music2 className="h-10 w-10 opacity-30" />
            <div className="text-center space-y-1">
              <p className="text-sm">{t.soundboard.noSound}</p>
              <p className="text-xs opacity-70">{t.soundboard.noSoundHint}</p>
            </div>
            <Button variant="outline" size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-4 w-4" /> {t.soundboard.addSound}
            </Button>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            <AnimatePresence>
              {profileClips.map((clip) => {
                const playing = playingIds.has(clip.id);
                const color = (clip.category as string) ?? CLIP_COLORS[0];
                return (
                  <motion.div
                    key={clip.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                  >
                    <SoundPad
                      clip={clip}
                      playing={playing}
                      color={color}
                      onToggle={() => handleToggle(clip)}
                      onEdit={() => openEdit(clip)}
                      onDelete={() => handleDelete(clip.id)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Add / Edit dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editClip ? t.soundboard.editSound : t.soundboard.addSound}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.soundboard.name}</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t.soundboard.namePlaceholder}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t.soundboard.file}</Label>
              <div className="flex gap-2">
                <Input
                  value={formPath}
                  onChange={(e) => setFormPath(e.target.value)}
                  placeholder="C:\sounds\alerte.mp3"
                  className="font-mono text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={async () => {
                    const path = await pickAudioFile();
                    if (path) setFormPath(path);
                  }}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  {t.soundboard.browse}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t.soundboard.formats}</p>
            </div>

            <div className="space-y-1.5">
              <Label>{t.soundboard.volume} <span className="text-muted-foreground font-normal">({Math.round(formVolume * 100)}%)</span></Label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={formVolume}
                onChange={(e) => setFormVolume(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formLoop}
                onChange={(e) => setFormLoop(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-sm">{t.soundboard.loop}</span>
            </label>

            <div className="space-y-1.5">
              <Label>{t.soundboard.color}</Label>
              <div className="flex gap-2 flex-wrap">
                {CLIP_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormColor(c)}
                    className={cn(
                      "h-7 w-7 rounded-lg border-2 transition-transform",
                      formColor === c ? "border-white scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editClip && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { handleDelete(editClip.id); setAddOpen(false); }}
              >
                {t.soundboard.delete}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
              {t.soundboard.cancel}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!formName.trim() || !formPath.trim()}>
              {editClip ? t.soundboard.save : t.soundboard.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SoundPad({
  clip, playing, color, onToggle, onEdit, onDelete,
}: {
  clip: SoundClip;
  playing: boolean;
  color: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden border border-border/50 aspect-square">
      {/* Main clickable area */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-2 p-3 transition-all",
          playing ? "opacity-100" : "opacity-90 hover:opacity-100"
        )}
        style={{ backgroundColor: color + (playing ? "ff" : "cc") }}
      >
        {playing ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
          >
            <Volume2 className="h-6 w-6 text-white" />
          </motion.div>
        ) : (
          <Play className="h-6 w-6 text-white" />
        )}
        <span className="text-white text-[11px] font-medium text-center leading-tight line-clamp-2 px-1">
          {clip.name}
        </span>
      </button>

      {/* Volume indicator */}
      <div
        className="absolute bottom-0 left-0 h-1 transition-all"
        style={{ width: `${clip.volume * 100}%`, backgroundColor: "rgba(255,255,255,0.5)" }}
      />

      {/* Hover actions */}
      <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex h-5 w-5 items-center justify-center rounded bg-black/40 text-white hover:bg-black/60"
          aria-label="Modifier"
        >
          <span className="text-[10px]">✎</span>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex h-5 w-5 items-center justify-center rounded bg-black/40 text-white hover:bg-red-500/80"
          aria-label="Supprimer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {playing && (
        <div className="absolute inset-0 ring-2 ring-white/60 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}
