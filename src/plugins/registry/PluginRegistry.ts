import type { DevDeckAction, DevDeckWidget } from "../sdk/types";
import type { InstalledPlugin } from "@/types";

class PluginRegistryService {
  private actions = new Map<string, DevDeckAction>();
  private widgets = new Map<string, DevDeckWidget>();
  private plugins = new Map<string, InstalledPlugin>();

  registerAction(pluginId: string, action: DevDeckAction) {
    const key = `${pluginId}::${action.id}`;
    this.actions.set(key, action);
  }

  registerWidget(pluginId: string, widget: DevDeckWidget) {
    const key = `${pluginId}::${widget.id}`;
    this.widgets.set(key, widget);
  }

  getAction(key: string): DevDeckAction | undefined {
    return this.actions.get(key);
  }

  getWidget(key: string): DevDeckWidget | undefined {
    return this.widgets.get(key);
  }

  getAllActions(): DevDeckAction[] {
    return Array.from(this.actions.values());
  }

  getAllWidgets(): DevDeckWidget[] {
    return Array.from(this.widgets.values());
  }

  unloadPlugin(pluginId: string) {
    for (const key of this.actions.keys()) {
      if (key.startsWith(`${pluginId}::`)) this.actions.delete(key);
    }
    for (const key of this.widgets.keys()) {
      if (key.startsWith(`${pluginId}::`)) this.widgets.delete(key);
    }
    this.plugins.delete(pluginId);
  }
}

export const pluginRegistry = new PluginRegistryService();
