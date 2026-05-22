export type PluginStatus = "loaded" | "disabled" | "error";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  permissions: string[];
  entry: string;
  iconUrl?: string;
  repositoryUrl?: string;
}

export interface InstalledPlugin {
  manifest: PluginManifest;
  status: PluginStatus;
  errorMessage?: string;
  installedAt: string;
}
