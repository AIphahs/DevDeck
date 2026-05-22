export type WidgetType =
  | "cpu-monitor"
  | "ram-monitor"
  | "disk-monitor"
  | "network-monitor"
  | "clock"
  | "weather"
  | "git-status"
  | "docker-status"
  | "soundboard"
  | "terminal-shortcut"
  | "custom";

export interface WidgetConfig {
  refreshInterval?: number;
  [key: string]: unknown;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title?: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  config: WidgetConfig;
}
