import { useProfileStore } from "@/store/profileStore";

export function useActiveProfile() {
  const { profiles, activeProfileId } = useProfileStore();
  return profiles.find((p) => p.id === activeProfileId) ?? null;
}
