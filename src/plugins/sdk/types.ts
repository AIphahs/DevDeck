export interface DevDeckAction {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  execute: (context: ActionContext) => Promise<void>;
}

export interface ActionContext {
  invokeBackend: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
  notify: (message: string, title?: string) => void;
  getProfileId: () => string;
}

export interface DevDeckWidget {
  id: string;
  label: string;
  description?: string;
  defaultColSpan: number;
  defaultRowSpan: number;
  component: React.ComponentType<WidgetProps>;
}

export interface WidgetProps {
  config: Record<string, unknown>;
  onConfigChange?: (config: Record<string, unknown>) => void;
}

export interface PluginSDK {
  registerAction: (action: DevDeckAction) => void;
  registerWidget: (widget: DevDeckWidget) => void;
  onUnload: (callback: () => void) => void;
}
