import { create } from "zustand";

type ActivePanel = "dashboard" | "deck" | "terminal" | "soundboard" | "monitoring" | "git" | "docker" | "settings" | "plugins" | "ai";

interface UIState {
  activePanel: ActivePanel;
  isSidebarCollapsed: boolean;
  isSettingsOpen: boolean;

  setActivePanel: (panel: ActivePanel) => void;
  toggleSidebar: () => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activePanel: "dashboard",
  isSidebarCollapsed: false,
  isSettingsOpen: false,

  setActivePanel: (activePanel) => set({ activePanel }),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));
