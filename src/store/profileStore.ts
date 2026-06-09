import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Profile, Page, Button } from "@/types";

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;

  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (id: string) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;

  addPage: (profileId: string, page: Page) => void;
  updatePage: (profileId: string, pageId: string, updates: Partial<Page>) => void;
  deletePage: (profileId: string, pageId: string) => void;

  addButton: (profileId: string, pageId: string, button: Button) => void;
  updateButton: (profileId: string, pageId: string, buttonId: string, updates: Partial<Button>) => void;
  deleteButton: (profileId: string, pageId: string, buttonId: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set) => ({
        profiles: [],
        activeProfileId: null,

        setProfiles: (profiles) => set({ profiles }),
        setActiveProfile: (id) => set({ activeProfileId: id }),

        addProfile: (profile) =>
          set((s) => ({ profiles: [...s.profiles, profile] })),

        updateProfile: (id, updates) =>
          set((s) => ({
            profiles: s.profiles.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          })),

        deleteProfile: (id) =>
          set((s) => {
            const remaining = s.profiles.filter((p) => p.id !== id);
            const nextActiveId =
              s.activeProfileId === id
                ? (remaining[0]?.id ?? null)
                : s.activeProfileId;
            return { profiles: remaining, activeProfileId: nextActiveId };
          }),

        addPage: (profileId, page) =>
          set((s) => ({
            profiles: s.profiles.map((p) =>
              p.id === profileId ? { ...p, pages: [...p.pages, page] } : p
            ),
          })),

        updatePage: (profileId, pageId, updates) =>
          set((s) => ({
            profiles: s.profiles.map((p) =>
              p.id === profileId
                ? {
                    ...p,
                    pages: p.pages.map((pg) =>
                      pg.id === pageId ? { ...pg, ...updates } : pg
                    ),
                  }
                : p
            ),
          })),

        deletePage: (profileId, pageId) =>
          set((s) => ({
            profiles: s.profiles.map((p) =>
              p.id === profileId
                ? { ...p, pages: p.pages.filter((pg) => pg.id !== pageId) }
                : p
            ),
          })),

        addButton: (profileId, pageId, button) =>
          set((s) => ({
            profiles: s.profiles.map((p) =>
              p.id === profileId
                ? {
                    ...p,
                    pages: p.pages.map((pg) =>
                      pg.id === pageId
                        ? { ...pg, buttons: [...pg.buttons, button] }
                        : pg
                    ),
                  }
                : p
            ),
          })),

        updateButton: (profileId, pageId, buttonId, updates) =>
          set((s) => ({
            profiles: s.profiles.map((p) =>
              p.id === profileId
                ? {
                    ...p,
                    pages: p.pages.map((pg) =>
                      pg.id === pageId
                        ? {
                            ...pg,
                            buttons: pg.buttons.map((b) =>
                              b.id === buttonId ? { ...b, ...updates } : b
                            ),
                          }
                        : pg
                    ),
                  }
                : p
            ),
          })),

        deleteButton: (profileId, pageId, buttonId) =>
          set((s) => ({
            profiles: s.profiles.map((p) =>
              p.id === profileId
                ? {
                    ...p,
                    pages: p.pages.map((pg) =>
                      pg.id === pageId
                        ? {
                            ...pg,
                            buttons: pg.buttons.filter((b) => b.id !== buttonId),
                          }
                        : pg
                    ),
                  }
                : p
            ),
          })),
      }),
      { name: "devdeck-profiles" }
    )
  )
);
