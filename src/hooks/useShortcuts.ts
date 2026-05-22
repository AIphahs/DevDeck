import { useEffect } from "react";
import { useShortcutStore } from "@/store/shortcutStore";
import { useProfileStore } from "@/store/profileStore";
import { executeAction } from "@/services/actions/executeAction";

function buildCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.metaKey) parts.push("Meta");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  const { key } = e;
  if (!["Control", "Alt", "Shift", "Meta"].includes(key)) {
    parts.push(key.length === 1 ? key.toUpperCase() : key);
  }
  return parts.join("+");
}

export function useShortcuts() {
  const { bindings } = useShortcutStore();
  const { profiles, activeProfileId } = useProfileStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Skip when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      const combo = buildCombo(e);
      const binding = bindings.find((b) => b.enabled && b.keys === combo);
      if (!binding) return;

      const profile = profiles.find((p) => p.id === (binding.profileId || activeProfileId));
      if (!profile) return;

      const button = profile.pages.flatMap((pg) => pg.buttons).find((b) => b.id === binding.actionId);
      if (!button) return;

      e.preventDefault();
      executeAction(button);
    }

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [bindings, profiles, activeProfileId]);
}
