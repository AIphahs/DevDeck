import { pluginRegistry } from "../registry/PluginRegistry";
import type { PluginSDK } from "../sdk/types";
import type { PluginManifest } from "@/types";

export class PluginLoader {
  private unloadCallbacks = new Map<string, (() => void)[]>();

  async load(manifest: PluginManifest, entryUrl: string): Promise<void> {
    const sdk: PluginSDK = {
      registerAction: (action) => pluginRegistry.registerAction(manifest.id, action),
      registerWidget: (widget) => pluginRegistry.registerWidget(manifest.id, widget),
      onUnload: (cb) => {
        const cbs = this.unloadCallbacks.get(manifest.id) ?? [];
        cbs.push(cb);
        this.unloadCallbacks.set(manifest.id, cbs);
      },
    };

    const module = await import(/* @vite-ignore */ entryUrl);
    if (typeof module.default === "function") {
      await module.default(sdk);
    }
  }

  unload(pluginId: string): void {
    const cbs = this.unloadCallbacks.get(pluginId) ?? [];
    cbs.forEach((cb) => cb());
    this.unloadCallbacks.delete(pluginId);
    pluginRegistry.unloadPlugin(pluginId);
  }
}

export const pluginLoader = new PluginLoader();
