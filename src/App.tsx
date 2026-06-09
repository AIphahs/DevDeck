import { useEffect } from "react";
import { useThemeStore, applyAccentColor } from "@/store/themeStore";
import { useProfileStore } from "@/store/profileStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { generateId } from "@/utils/format";
import { useShortcuts } from "@/hooks/useShortcuts";

export default function App() {
  const { theme, accentColor } = useThemeStore();
  const { profiles, activeProfileId, addProfile, setActiveProfile } = useProfileStore();
  useShortcuts();

  // Bootstrap a default profile on first launch.
  // Deps include profiles.length and activeProfileId so we re-run after Zustand rehydrates
  // from persisted storage (avoids creating a duplicate default profile on async hydration).
  useEffect(() => {
    if (!useProfileStore.persist.hasHydrated()) return;
    if (profiles.length === 0) {
      const profileId = generateId();
      const pageId = generateId();
      const defaultProfile = {
        id: profileId,
        name: "Default",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pages: [{ id: pageId, profileId, name: "Page 1", position: 0, buttons: [] }],
      };
      addProfile(defaultProfile);
      setActiveProfile(profileId);
    } else if (!activeProfileId) {
      setActiveProfile(profiles[0].id);
    }
  }, [profiles.length, activeProfileId, addProfile, setActiveProfile]);

  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      root.classList.toggle("dark", mq.matches);
      const handler = (e: MediaQueryListEvent) => root.classList.toggle("dark", e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  return <AppLayout />;
}
