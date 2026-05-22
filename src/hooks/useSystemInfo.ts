import { useQuery } from "@tanstack/react-query";
import { getSystemInfo } from "@/services/tauri/system";

export function useSystemInfo(intervalMs = 2000) {
  return useQuery({
    queryKey: ["system-info"],
    queryFn: getSystemInfo,
    refetchInterval: intervalMs,
    // Disable during development if backend not available
    retry: false,
  });
}
