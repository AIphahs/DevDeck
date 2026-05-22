export type ActionType =
  | "command"
  | "script"
  | "hotkey"
  | "sound"
  | "url"
  | "app"
  | "plugin"
  | "folder"
  | "multi";

export interface ButtonStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: number;
  iconSize?: number;
}

export interface Button {
  id: string;
  pageId: string;
  label: string;
  icon?: string;
  col: number;
  row: number;
  actionType: ActionType;
  actionData: Record<string, unknown>;
  styleData: ButtonStyle;
}

export interface Page {
  id: string;
  profileId: string;
  name: string;
  position: number;
  buttons: Button[];
}

export interface Profile {
  id: string;
  name: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
}
