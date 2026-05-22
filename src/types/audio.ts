export interface AudioDevice {
  name: string;
  isDefault: boolean;
}

export interface SoundClip {
  id: string;
  profileId: string;
  name: string;
  filePath: string;
  category?: string;
  volume: number;
  loopMode: boolean;
  hotkey?: string;
  createdAt: string;
}
