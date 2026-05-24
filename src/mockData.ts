import { OSProfile, MusicTrack } from './types';

export const RETRO_OS_PROFILES: OSProfile[] = [
  {
    id: 'win98',
    name: 'Windows 98 SE',
    version: 'Microsoft Windows 98 Second Edition (v4.10.2222A)',
    icon: '💾',
    releaseYear: 1999,
    description: 'The peak of consumer analog x86 desktops. Optimized for retro DOS games, vintage productivity applications, and nostalgia-driven software testing under mobile devices with minimal hardware overlays.',
    systemRequirements: {
      minRam: 32,
      recommendedRam: 128,
      optCpuPattern: 'pentium2 / qemu32'
    },
    recommendedDiskSize: '2.0 GB IDE',
    defaultIsoName: 'win98se_bootable_oem.iso',
    popularity: '🔥 Very High (Perfect for Bochs & Limbo)'
  },
  {
    id: 'winxp',
    name: 'Windows XP Professional',
    version: 'Service Pack 3 (v5.1.2600)',
    icon: '💿',
    releaseYear: 2001,
    description: 'The legendary NT-based operating system. Merges peak stability with the iconic blue-and-green Bliss theme. Ideal for running early 2000s office, audio players, or vintage coding utilities inside Android processors.',
    systemRequirements: {
      minRam: 128,
      recommendedRam: 512,
      optCpuPattern: 'pentium3 / qemu32 / core2duo'
    },
    recommendedDiskSize: '10.0 GB IDE',
    defaultIsoName: 'windows_xp_sp3_pro_x86.iso',
    popularity: '⭐ High (Runs smoothly on 6GB+ Android devices)'
  },
  {
    id: 'alpine',
    name: 'Alpine Linux Virtual',
    version: 'v3.18.2 (LTS with BusyBox / musl)',
    icon: '🏔️',
    releaseYear: 2023,
    description: 'An ultra-lightweight, security-oriented Linux distribution based on musl libc and busybox. Powers extremely fast terminal scripts, dev stacks, and tiny container environments with less than 64MB memory utilization.',
    systemRequirements: {
      minRam: 32,
      recommendedRam: 128,
      optCpuPattern: 'host / qemu64'
    },
    recommendedDiskSize: '1.5 GB SATA (VirtIO recommended)',
    defaultIsoName: 'alpine-virt-3.18.2-x86.iso',
    popularity: '⚡ Ultra-Fast (Boot time < 6s on mobile processors)'
  },
  {
    id: 'debian',
    name: 'Debian GNU/Linux Desktop',
    version: 'Debian 12.0 "Bookworm" (Minimal GUI)',
    icon: '🌀',
    releaseYear: 2023,
    description: 'The universal operating system. A highly stable, complete Linux workbench. Offers hundreds of pre-packed developer tools, terminal interpreters, and server services directly runnable on Android.',
    systemRequirements: {
      minRam: 512,
      recommendedRam: 1024,
      optCpuPattern: 'qemu64 / host'
    },
    recommendedDiskSize: '15.0 GB Sata / VirtIO',
    defaultIsoName: 'debian-12.0.0-i386-netinst.iso',
    popularity: '🛠️ Developer Favorite (Best inside Termux + command shells)'
  },
  {
    id: 'freedos',
    name: 'FreeDOS v1.3',
    version: 'FreeDOS Kernel v2043 (16-bit FAT32)',
    icon: '🦖',
    releaseYear: 2022,
    description: 'A completely free, open-source DOS compatible operating system. Directly executes classic 16-bit DOS games, old machine BIOS tools, or custom vintage assembly program chains with zero emulation overhead.',
    systemRequirements: {
      minRam: 8,
      recommendedRam: 64,
      optCpuPattern: 'i486 / pentium'
    },
    recommendedDiskSize: '500 MB IDE',
    defaultIsoName: 'FreeDOS-1.3-LiveCD.iso',
    popularity: '🕹️ Low-End Friendly (Runs at 60 FPS even on antique Android 8.0 devices)'
  }
];

export const RETRO_TRACKS: MusicTrack[] = [
  {
    id: 'xp-startup',
    title: 'Windows XP Startup Sound',
    artist: 'Brian Eno (Remix)',
    duration: '0:06',
    melody: [
      [220, 200], [293, 200], [440, 200], [392, 400], [587, 300], [493, 400], [440, 600]
    ]
  },
  {
    id: 'canyon',
    title: 'Canyon.mid (Midi Classic)',
    artist: 'Nathan Grigg',
    duration: '0:22',
    melody: [
      [330, 250], [392, 250], [440, 500], [0, 100], [440, 250], [494, 250], [523, 500],
      [0, 100], [523, 250], [587, 250], [659, 500], [587, 250], [523, 250], [440, 500],
      [392, 250], [330, 500], [294, 250], [330, 1000]
    ]
  },
  {
    id: 'beep-run',
    title: 'Arcade Digital Chiptune',
    artist: 'NovaVM Synth Synthesizer',
    duration: '0:18',
    melody: [
      [523, 150], [587, 150], [659, 150], [523, 150], [659, 150], [523, 150], [659, 300], 
      [587, 150], [698, 150], [698, 150], [659, 150], [587, 300],
      [659, 150], [523, 150], [392, 300], [440, 300], [261, 600]
    ]
  }
];
