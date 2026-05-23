import { useState, useEffect } from "react";
import { Music2, Square } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSoundStore } from "@/store/soundStore";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { playClip, stopClip, isPlaying, stopAll } from "@/services/audio/soundService";

export function SoundboardWidget() {
  const { clips, masterVolume } = useSoundStore();
  const profile = useActiveProfile();
  const [playingIds, setPlayingIds] = useState<Set<string>>(new Set());

  const profileClips = profile ? clips.filter((c) => c.profileId === profile.id).slice(0, 6) : [];

  useEffect(() => {
    const id = setInterval(() => {
      setPlayingIds((prev) => {
        const next = new Set<string>();
        for (const clip of profileClips) {
          if (isPlaying(clip.id)) next.add(clip.id);
        }
        if (prev.size === next.size && [...prev].every((id) => next.has(id))) return prev;
        return next;
      });
    }, 150);
    return () => clearInterval(id);
  }, [profileClips.length]);

  if (profileClips.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
        <Music2 className="h-5 w-5 opacity-40" />
        <p className="text-[10px]">Aucun son — ajoutez-en dans Soundboard</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Music2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Soundboard</span>
        </div>
        {playingIds.size > 0 && (
          <button
            onClick={stopAll}
            className="flex items-center gap-0.5 text-[10px] text-destructive hover:text-destructive/80 transition-colors"
          >
            <Square className="h-3 w-3" /> Stop
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 flex-1">
        {profileClips.map((clip) => {
          const playing = playingIds.has(clip.id);
          const color = (clip.category as string) ?? "#6366f1";
          return (
            <button
              key={clip.id}
              onClick={() => {
                if (playing) {
                  stopClip(clip.id);
                } else {
                  void playClip(clip.id, clip.filePath, clip.volume * masterVolume, clip.loopMode);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg p-1.5 text-white transition-all text-center",
                playing ? "ring-2 ring-white/60 brightness-110" : "opacity-90 hover:opacity-100"
              )}
              style={{ backgroundColor: color + (playing ? "ff" : "bb") }}
              title={clip.name}
            >
              <span className="text-[9px] font-medium leading-tight line-clamp-2">{clip.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
