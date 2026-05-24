export type GuestOSType = 'win98' | 'winxp' | 'alpine' | 'debian' | 'freedos';

export interface OSProfile {
  id: GuestOSType;
  name: string;
  version: string;
  icon: string;
  releaseYear: number;
  description: string;
  systemRequirements: {
    minRam: number;
    recommendedRam: number;
    optCpuPattern: string;
  };
  recommendedDiskSize: string;
  defaultIsoName: string;
  popularity: string;
}

export interface VMConfig {
  guestOS: GuestOSType;
  androidRam: number;
  androidVersion: number;
  cpuCores: number;
  networkEnabled: boolean;
  audioEnabled: boolean;
  diskInterface: 'ide' | 'scsi' | 'virtio';
  displayDriver: 'std' | 'vmware' | 'cirrus';
}

export interface WindowState {
  id: string; // 'paint' | 'notepad' | 'minesweeper' | 'music' | 'terminal' | 'config' | 'guide' | 'ie'
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface NotepadFile {
  name: string;
  content: string;
  createdAt: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  melody: number[][]; // [frequency, durationMs] for audio synthesis API
}
