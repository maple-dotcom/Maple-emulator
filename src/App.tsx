import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Settings,
  BookOpen,
  Cpu,
  Download,
  HelpCircle,
  Play,
  RotateCcw,
  Monitor,
  Volume2,
  VolumeX,
  Power,
  Code,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  Save,
  ChevronRight,
  FileText,
  Search,
  Smile,
  Music,
  Smartphone,
  Plus,
  Info,
  ExternalLink,
  Keyboard,
  Compass,
  FileCode,
  FolderOpen
} from 'lucide-react';

import {
  OSProfile,
  MusicTrack,
  WindowState,
  NotepadFile,
  GuestOSType,
  VMConfig
} from './types';

import {
  RETRO_OS_PROFILES,
  RETRO_TRACKS
} from './mockData';

export default function App() {
  // Navigation Tabs: 'sandbox' (Interactive Live Emulator), 'configurator' (Android VM Maker), 'wiki' (How-To Tutorial Wiki)
  const [activeTab, setActiveTab] = useState<'sandbox' | 'configurator' | 'wiki'>('sandbox');

  // Booter & Power states
  const [selectedOS, setSelectedOS] = useState<GuestOSType>('win98');
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [isPowerOn, setIsPowerOn] = useState<boolean>(false);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [biosOutput, setBiosOutput] = useState<string[]>([]);
  const [emulatedDiskStatus, setEmulatedDiskStatus] = useState<string>('IDE Secondary: [Empty]');

  // Live BIOS state counter
  const biosTimer = useRef<number | null>(null);

  // Active simulated windows
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'notepad', title: 'Notepad', isOpen: false, isMaximized: false, x: 40, y: 40, width: 380, height: 260, zIndex: 10 },
    { id: 'paint', title: 'MS Paint 98', isOpen: false, isMaximized: false, x: 80, y: 30, width: 420, height: 350, zIndex: 10 },
    { id: 'minesweeper', title: 'Minesweeper', isOpen: false, isMaximized: false, x: 120, y: 20, width: 280, height: 340, zIndex: 10 },
    { id: 'music', title: 'Windows Media Player', isOpen: false, isMaximized: false, x: 100, y: 70, width: 360, height: 280, zIndex: 10 },
    { id: 'ie', title: 'Internet Explorer 5.0', isOpen: false, isMaximized: false, x: 60, y: 60, width: 450, height: 320, zIndex: 10 },
    { id: 'welcome', title: 'Welcome to NovaVM', isOpen: true, isMaximized: false, x: 20, y: 30, width: 340, height: 240, zIndex: 12 }
  ]);

  const [topZIndex, setTopZIndex] = useState<number>(15);

  // Synthesizer variables
  const [audioSynthesizing, setAudioSynthesizing] = useState<boolean>(false);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<MusicTrack | null>(null);
  const [audioMute, setAudioMute] = useState<boolean>(false);
  const [synthVisualizerFreqs, setSynthVisualizerFreqs] = useState<number[]>(Array(12).fill(1));

  // Simulated Paint Canvas States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paintColor, setPaintColor] = useState<string>('#000000');
  const [paintSize, setPaintSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Notepad states
  const [notepadFiles, setNotepadFiles] = useState<NotepadFile[]>([
    { name: 'read_me_first.txt', content: 'Welcome to NovaVM!\n\nThis is a complete, browser-based sandboxed simulator of Windows 98 and Windows XP operating systems.\n\nCreated of high-performance HTML5/React tools to help anyone test PC simulations smoothly on Android and mobile screens!\n\nUse the Start Menu (lower-left) to access all retro programs including Paints, Minesweeper, and synthesized Windows Media Players.', createdAt: 'May 2026' },
    { name: 'emulator_cheats.txt', content: 'Secret Tips for Limbo PC Android Speed Hacks:\n\n1. Select Pentium 3 or Qemu32 CPU\n2. Enable standard ACPI and APM options\n3. Select Vmware or Cirrus for Video Driver\n4. Allocate no more than 256MB of RAM for Windows 98 to avoid memory paging overhead on Android.\n5. Enable multi-threading / MTTCG inside advanced settings to utilize unused ARM core threads.', createdAt: 'June 2026' }
  ]);
  const [selectedNotepadIndex, setSelectedNotepadIndex] = useState<number>(0);
  const [notepadEditorText, setNotepadEditorText] = useState<string>(notepadFiles[0].content);
  const [newFileNameInput, setNewFileNameInput] = useState<string>('');
  const [isAddingNewFile, setIsAddingNewFile] = useState<boolean>(false);

  // Minesweeper Interactive Game state
  interface MineCell {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
  }
  const [mineGrid, setMineGrid] = useState<MineCell[][]>([]);
  const [mineStatus, setMineStatus] = useState<'playing' | 'won' | 'lost' | 'idle'>('idle');
  const [remainingMines, setRemainingMines] = useState<number>(10);
  const [minesweeperFace, setMinesweeperFace] = useState<string>('🙂');

  // IE Browser Sim states
  const [browserSearchQuery, setBrowserSearchQuery] = useState<string>('');
  const [browserTabUrl, setBrowserTabUrl] = useState<string>('http://www.google98.com');
  const [browserLoadedPage, setBrowserLoadedPage] = useState<'home' | 'search-results' | 'limbo-wiki'>('home');

  // Linux Bash Terminal Simulator States
  const [terminalHistory, setTerminalHistory] = useState<{ text: string; type: 'input' | 'output' | 'error' | 'success' | 'ascii' }[]>([
    { text: 'NovaVM Gen-Kernel 6.1.0-8-amd64 x86_64 JIT Sandbox booted', type: 'ascii' },
    { text: 'Type "help" to list available commands inside this container.', type: 'output' },
    { text: 'guest@novavm:~$ ', type: 'input' }
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  // Linux Mini State Engine
  const [linuxFileTree, setLinuxFileTree] = useState<{ [filename: string]: string }>({
    'welcome.txt': 'Welcome to the NovaVM Linux environment. Operating inside a secure browser micro-sandbox.',
    'neofetch.sh': 'echo "NovaVM Core: Powered by React Typescript JIT v3"',
    'about_emulation.md': 'Running real Operating Systems on Android 8+ is extremely rewarding.\nWith proper configuration using apps like Limbo PC (QEMU wrapper) or Termux Proot Distro, your phone can become a full-capacity workstation or legacy server.'
  });

  // Dynamic Android Setup & Configurator Form States
  const [androidVMOs, setAndroidVMOs] = useState<GuestOSType>('win98');
  const [androidRamCapacity, setAndroidRamCapacity] = useState<number>(6); // Default 6GB Phone
  const [cpuCoreAllocation, setCpuCoreAllocation] = useState<number>(4); // Default Quad-core
  const [androidVerNum, setAndroidVerNum] = useState<number>(11); // Android 11
  const [speedHackLevel, setSpeedHackLevel] = useState<'standard' | 'maximum' | 'debug'>('maximum');
  const [vDiskType, setVDiskType] = useState<'ide' | 'scsi' | 'virtio'>('ide');
  const [isNetworkEnabled, setIsNetworkEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // Toast / System indicator messages
  const [sysNotification, setSysNotification] = useState<{ text: string; type: 'info' | 'success' | 'warn' } | null>(null);

  // Virtual controller indicators
  const [trackpadEnabled, setTrackpadEnabled] = useState<boolean>(false);
  const [joystickCoords, setJoystickCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [keyboardToolbarOpen, setKeyboardToolbarOpen] = useState<boolean>(false);

  // Launch quick alert
  const triggerNotification = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setSysNotification({ text, type });
    setTimeout(() => {
      setSysNotification((prev) => prev?.text === text ? null : prev);
    }, 3500);
  };

  // Pre-load audio oscillator node list
  const activeOscillators = useRef<any[]>([]);
  const synthesizerInterval = useRef<number | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Clean oscillators on unmount
  useEffect(() => {
    return () => {
      stopSynthesizer();
    };
  }, []);

  // START BOOT PROCESS SIMULATING A REAL COMPUTER BIOS
  const handlePowerOn = () => {
    if (isPowerOn) {
      // Shutdown action
      setIsPowerOn(false);
      setIsBooting(false);
      setBootProgress(0);
      setBiosOutput([]);
      stopSynthesizer();
      triggerNotification('Virtual Machine powered down.', 'warn');
      return;
    }

    setIsBooting(true);
    setBootProgress(0);
    setBiosOutput([]);
    triggerNotification(`Initializing bootloader for: ${RETRO_OS_PROFILES.find((p) => p.id === selectedOS)?.name}...`, 'info');

    const biosSequence = [
      'AMIBIOS (C) 1999 American Megatrends Inc.',
      'NovaVM Motherboard Model N98-KVM-ARM32/64 BIOS Ver 4.51PG',
      'CPU: Qualcomm Snapdragon / JIT Translation Engine v8.2',
      'Running Speed Benchmark... Clock: 2.84 GHz x8 Cores',
      'Memory Test: 524288K OK (Allocating Host System Memory...)',
      'Checking Disk Bus IDE Primary Master: QEMU qv-hdd-10GB.img',
      'Checking Drive floppy0: Bootable ROM floppy SE...',
      'Partition Boot sector found. Reading bootstrap table info...',
      'Bootloader: loading virtual memory modules into memory...',
      'Initializing graphics overlay... Display adapter model: Cirrus Logic GD5446',
      'Power On Self Test (POST) Complete. Booting chosen Operating System kernel...'
    ];

    let currentLineIdx = 0;
    
    const tickBios = () => {
      if (currentLineIdx < biosSequence.length) {
        setBiosOutput((prev) => [...prev, biosSequence[currentLineIdx]]);
        setBootProgress((prev) => Math.min(prev + 10, 95));
        currentLineIdx++;
        biosTimer.current = window.setTimeout(tickBios, 300);
      } else {
        // BIOS complete! Finish power on
        setBootProgress(100);
        setTimeout(() => {
          setIsBooting(false);
          setIsPowerOn(true);
          triggerNotification(`${selectedOS.toUpperCase()} Virtual Sandbox running successfully!`, 'success');
          
          // Auto boot welcome window
          setWindows((prev) =>
            prev.map((w) => (w.id === 'welcome' ? { ...w, isOpen: true } : w))
          );

          // Play startup sound if selected
          if (selectedOS === 'winxp') {
            const xpTrack = RETRO_TRACKS.find(t => t.id === 'xp-startup');
            if (xpTrack) playSynthMelody(xpTrack);
          } else if (selectedOS === 'win98') {
            const startupTrack = RETRO_TRACKS.find(t => t.id === 'beep-run');
            if (startupTrack) playSynthMelody(startupTrack);
          }
        }, 500);
      }
    };

    tickBios();
  };

  const handleResetEmulator = () => {
    setIsPowerOn(false);
    setIsBooting(false);
    setBootProgress(0);
    setBiosOutput([]);
    stopSynthesizer();
    setTimeout(() => {
      handlePowerOn();
    }, 200);
  };

  // OS WINDOW NAVIGATION ENGINE
  const toggleWindow = (winId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === winId) {
          const nextOpen = !w.isOpen;
          // Assign highest Z-index on opening
          const nextZ = nextOpen ? topZIndex + 1 : w.zIndex;
          if (nextOpen) setTopZIndex(nextZ);
          return { ...w, isOpen: nextOpen, zIndex: nextZ };
        }
        return w;
      })
    );
  };

  const focusWindow = (winId: string) => {
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, zIndex: nextZ } : w))
    );
  };

  const maximizeWindow = (winId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  // LIVE SYNTHESIZER SOUND ENGINE VIA WEB AUDIO API (100% REAL MUSIC)
  const playSynthMelody = (track: MusicTrack) => {
    if (audioMute) {
      triggerNotification('Audio is muted on the virtual toolbar!', 'warn');
      return;
    }

    stopSynthesizer();
    setAudioSynthesizing(true);
    setCurrentPlayingTrack(track);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let playTime = audioCtx.currentTime;

      track.melody.forEach(([freq, duration]) => {
        if (freq === 0) {
          // Rest note
          playTime += duration / 1000;
        } else {
          const oscNode = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscNode.type = selectedOS === 'win98' ? 'triangle' : 'sine'; // vintage warmth vs smooth XP
          oscNode.frequency.setValueAtTime(freq, playTime);

          gainNode.gain.setValueAtTime(0.06, playTime); // low volume
          gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + duration / 1000 - 0.02);

          oscNode.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscNode.start(playTime);
          oscNode.stop(playTime + duration / 1000);

          activeOscillators.current.push(oscNode, gainNode);
          playTime += duration / 1000;
        }
      });

      // Simple visualizer pulse tick
      let step = 0;
      synthesizerInterval.current = window.setInterval(() => {
        setSynthVisualizerFreqs((_) =>
          Array(12).fill(0).map(() => Math.floor(Math.random() * 80) + 10)
        );
        step++;
        if (step > (track.melody.length * 1.5)) {
          stopSynthesizer();
        }
      }, 150);

    } catch (e) {
      console.warn('Audio Synthesis Context failed. Browser block of autoplay.', e);
    }
  };

  const stopSynthesizer = () => {
    setAudioSynthesizing(false);
    setCurrentPlayingTrack(null);
    setSynthVisualizerFreqs(Array(12).fill(1));
    if (synthesizerInterval.current) {
      clearInterval(synthesizerInterval.current);
      synthesizerInterval.current = null;
    }
    try {
      activeOscillators.current.forEach(node => {
        try { node.stop(); } catch(e){}
      });
      activeOscillators.current = [];
    } catch(e){}
  };

  // MS PAINT APPLICATION CANVAS ENGINE
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isPowerOn, windows.find(w => w.id === 'paint')?.isOpen]);

  const handlePaintStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawOnCanvas(e);
  };

  const handlePaintDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    drawOnCanvas(e);
  };

  const handlePaintStop = () => {
    setIsDrawing(false);
  };

  const drawOnCanvas = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // prevent scrolling
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.strokeStyle = paintColor;
    ctx.lineWidth = paintSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearPaintCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    triggerNotification('Cleared paint board!', 'success');
  };

  // MINESWEEPER REACT FULLY-PLAYABLE GAME ENGINE
  const startMinesweeperGame = () => {
    setMineStatus('playing');
    setRemainingMines(10);
    setMinesweeperFace('🙂');

    // Create 8x8 Grid
    const grid: MineCell[][] = Array(8).fill(null).map(() =>
      Array(8).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Place 10 Random Mines
    let minesPlaced = 0;
    while (minesPlaced < 10) {
      const r = Math.floor(Math.random() * 8);
      const c = Math.floor(Math.random() * 8);
      if (!grid[r][c].isMine) {
        grid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Measure neighbor indices
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (grid[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              if (grid[nr][nc].isMine) count++;
            }
          }
        }
        grid[r][c].neighborMines = count;
      }
    }

    setMineGrid(grid);
  };

  const handleMinesweeperCellClick = (r: number, c: number) => {
    if (mineStatus !== 'playing') return;
    const cell = mineGrid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    const nextGrid = [...mineGrid.map(row => [...row])];

    if (cell.isMine) {
      // Boom! Game Over.
      setMineStatus('lost');
      setMinesweeperFace('😵');
      triggerNotification('Boom! You hit a mine!', 'warn');
      // Reveal all mines
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (nextGrid[i][j].isMine) nextGrid[i][j].isRevealed = true;
        }
      }
      setMineGrid(nextGrid);
      return;
    }

    // Helper to reveal cells (depth-first discovery)
    const reveal = (row: number, col: number, gridData: MineCell[][]) => {
      if (row < 0 || row >= 8 || col < 0 || col >= 8) return;
      const target = gridData[row][col];
      if (target.isRevealed || target.isFlagged || target.isMine) return;

      target.isRevealed = true;

      if (target.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(row + dr, col + dc, gridData);
          }
        }
      }
    };

    reveal(r, c, nextGrid);

    // Check Win requirements
    let win = true;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (!nextGrid[i][j].isMine && !nextGrid[i][j].isRevealed) win = false;
      }
    }

    if (win) {
      setMineStatus('won');
      setMinesweeperFace('😎');
      triggerNotification('Congratulations! Clean sweep!', 'success');
    }

    setMineGrid(nextGrid);
  };

  const handleMinesweeperRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (mineStatus !== 'playing') return;
    const cell = mineGrid[r][c];
    if (cell.isRevealed) return;

    const nextGrid = [...mineGrid.map(row => [...row])];
    const isNowFlagged = !cell.isFlagged;
    nextGrid[r][c].isFlagged = isNowFlagged;

    setRemainingMines(prev => isNowFlagged ? prev - 1 : prev + 1);
    setMineGrid(nextGrid);
  };

  // INITIALIZE ACTIVE MINESWEEPER GRID ON POWERUP
  useEffect(() => {
    startMinesweeperGame();
  }, [isPowerOn]);

  // LOCAL NOTEPAD STORAGE HELPER
  const selectNotepadFile = (idx: number) => {
    setSelectedNotepadIndex(idx);
    setNotepadEditorText(notepadFiles[idx].content);
  };

  const saveCurrentNotepadFile = () => {
    setNotepadFiles((prev) =>
      prev.map((file, idx) =>
        idx === selectedNotepadIndex ? { ...file, content: notepadEditorText } : file
      )
    );
    triggerNotification(`Saved changes to "${notepadFiles[selectedNotepadIndex].name}" securely inside VM!`, 'success');
  };

  const createNotepadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileNameInput.trim()) return;
    const formattedName = newFileNameInput.toLowerCase().endsWith('.txt') 
      ? newFileNameInput 
      : `${newFileNameInput}.txt`;

    const nextFile: NotepadFile = {
      name: formattedName,
      content: 'Write your notes or retro configuration specs here...',
      createdAt: 'Just now'
    };

    const newFilesList = [...notepadFiles, nextFile];
    setNotepadFiles(newFilesList);
    setNewFileNameInput('');
    setIsAddingNewFile(false);
    
    const nextIdx = newFilesList.length - 1;
    setSelectedNotepadIndex(nextIdx);
    setNotepadEditorText(nextFile.content);
    triggerNotification(`Created "${formattedName}" file inside retro registry!`, 'success');
  };

  // MOCK IE WEB BROWSER INTERACTION LOGIC
  const handleBrowserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = browserSearchQuery.trim();
    if (!query) return;

    setBrowserTabUrl(`http://www.google98.com/search?q=${encodeURIComponent(query)}`);
    setBrowserLoadedPage('search-results');
  };

  // DYNAMIC CONFIGURATOR AUTO-SHEET GENERATOR
  const getOptimalConfig = () => {
    // Dynamically calculate best settings based on Android specs to give real usable configurations
    const isLowEndDevice = androidRamCapacity <= 3;
    const isMidEndDevice = androidRamCapacity > 3 && androidRamCapacity <= 6;
    
    let targetVM_RAM = 64; 
    let recommendedCores = 1;

    if (androidVMOs === 'freedos') {
      targetVM_RAM = isLowEndDevice ? 16 : 64;
    } else if (androidVMOs === 'win98') {
      targetVM_RAM = isLowEndDevice ? 128 : isMidEndDevice ? 256 : 512;
      recommendedCores = 1; // Win98 only supports single core efficiently!
    } else if (androidVMOs === 'winxp') {
      targetVM_RAM = isLowEndDevice ? 256 : isMidEndDevice ? 512 : 1024;
      recommendedCores = isLowEndDevice ? 1 : 2;
    } else if (androidVMOs === 'alpine') {
      targetVM_RAM = isLowEndDevice ? 128 : isMidEndDevice ? 512 : 2048;
      recommendedCores = isLowEndDevice ? 1 : isMidEndDevice ? 2 : 4;
    } else if (androidVMOs === 'debian') {
      targetVM_RAM = isLowEndDevice ? 512 : isMidEndDevice ? 1024 : 3072;
      recommendedCores = isLowEndDevice ? 2 : isMidEndDevice ? 4 : 4;
    }

    // sound card model selection
    const audioCard = androidVMOs.startsWith('win') ? (androidVMOs === 'win98' ? 'sb16' : 'es1370') : 'ac97';
    // network adapter logic
    const networkDriver = 'rtl8139';

    // Construct tailored LIMBO PC Android parameters
    const codeLimboString = `Limbo PC Emulator Profile:
---------------------------
Profile Name: NovaVM-${androidVMOs.toUpperCase()}
Architecture: x86
CPU Model: ${androidVMOs === 'win98' ? 'pentium2' : 'qemu32'}
CPU Cores: ${recommendedCores}
RAM Memory: ${targetVM_RAM} MB
Disk Interface: ${vDiskType.toUpperCase()}
Network: ${isNetworkEnabled ? 'User mode ('+networkDriver+')' : 'None'}
Audio: ${isAudioEnabled ? 'Enabled ('+audioCard+')' : 'None'}
Host Port Redirect: tcp:2222->22 (Linux SSH)
User Speed hacks: High-Priority CPU threads, MTTCG=Enabled`;

    // Construct raw QEMU shell command for Termux
    const qemuTermuxCommand = `qemu-system-i386 \\
  -m ${targetVM_RAM} \\
  -smp ${recommendedCores} \\
  -cpu ${androidVMOs === 'win98' ? 'pentium2' : 'pentium3'} \\
  -drive file=/sdcard/NovaVM/disks/${androidVMOs}.img,format=raw,if=${vDiskType} \\
  -vga ${androidVMOs === 'win98' ? 'cirrus' : 'std'} \\
  ${isAudioEnabled ? `-soundhw ${audioCard}` : ''} \\
  ${isNetworkEnabled ? `-net nic,model=${networkDriver} -net user` : ''} \\
  -nographic -vnc :1`;

    return {
      ram: targetVM_RAM,
      cores: recommendedCores,
      audioCard,
      networkDriver,
      limboCfg: codeLimboString,
      termuxCmd: qemuTermuxCommand
    };
  };

  const calculatedOptions = getOptimalConfig();

  // BASH SHELL TERMINAL CMD ENGINE
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputClean = terminalInput.trim();
    if (!inputClean) return;

    const parts = inputClean.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const nextHistory = [...terminalHistory];
    
    // Add user typed command line
    nextHistory.push({ text: `guest@novavm:~$ ${inputClean}`, type: 'input' });

    switch (cmd) {
      case 'help':
        nextHistory.push({ text: 'NovaVM Linux Shell Utilities:', type: 'success' });
        nextHistory.push({ text: '  help       - List available sandbox instructions.', type: 'output' });
        nextHistory.push({ text: '  neofetch   - Displays fully designed retro statistics & Linux details.', type: 'output' });
        nextHistory.push({ text: '  ls         - Lists simulated active user directory files.', type: 'output' });
        nextHistory.push({ text: '  cat <file> - Decodes the content of specific simulated notes/files.', type: 'output' });
        nextHistory.push({ text: '  mkdir <dir>- Dynamically creates custom directories.', type: 'output' });
        nextHistory.push({ text: '  cowsay <msg>- Talkative retro ASCII cow generator.', type: 'output' });
        nextHistory.push({ text: '  js <code>  - Compiles and evaluates active sandboxed JavaScript statements!', type: 'success' });
        nextHistory.push({ text: '  python     - Opens our interactive simulated Python shell interpreter.', type: 'output' });
        nextHistory.push({ text: '  clear      - Resets screen log memory logs.', type: 'output' });
        break;

      case 'neofetch':
        nextHistory.push({
          text: `               ,---._
             /    _ \\
  _..---.._  |   (_) |
 .-\' _.._   \`-|   _  /
/  -\'    \`-._ \`-\'  _\\
|  |  (o) (o) | __((_))__        NovaVM @ Android 8.0+
|  \\_   __   /   \\ .  . /        Host SoC: ARM64 Cortex Octa-cores
 \\__ \`-\'__\'-'     \\    /         Linux Kernel: 6.1.0-8-nova-jit
    \`---'          \`--'          Shell: NodeSandbox/React-TS
                                 GPU Acceleration: Virtual VirGL JIT
                                 Active Alloc: ${calculatedOptions.ram}MB VM Sandbox`,
          type: 'ascii'
        });
        break;

      case 'ls':
        const fileNames = Object.keys(linuxFileTree).join('    ');
        nextHistory.push({ text: fileNames || '[Empty directory]', type: 'success' });
        break;

      case 'cat':
        if (!args[0]) {
          nextHistory.push({ text: 'Usage: cat <filename>', type: 'error' });
        } else if (linuxFileTree[args[0]]) {
          nextHistory.push({ text: linuxFileTree[args[0]], type: 'output' });
        } else {
          nextHistory.push({ text: `cat: ${args[0]}: No such file or directory`, type: 'error' });
        }
        break;

      case 'mkdir':
        if (!args[0]) {
          nextHistory.push({ text: 'Usage: mkdir <directory_name>', type: 'error' });
        } else {
          nextHistory.push({ text: `mkdir: created directory "/usr/guest/${args[0]}" successfully.`, type: 'success' });
        }
        break;

      case 'cowsay':
        const talk = args.join(' ') || 'Moo! Virtualizing Windows & Linux on Android 8+ is simple!';
        const dash = '-'.repeat(talk.length + 2);
        nextHistory.push({
          text: `  ${dash}
  < ${talk} >
  ${dash}
         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     |`,
          type: 'ascii'
        });
        break;

      case 'js':
        if (!args[0]) {
          nextHistory.push({ text: 'Usage: js <javascript_expression_statements>', type: 'error' });
        } else {
          try {
            const expression = args.join(' ');
            // Safe-ish evaluate inside sandboxed variables
            const result = new Function(`return (${expression})`)();
            nextHistory.push({ text: `Result: ${result}`, type: 'success' });
          } catch (err: any) {
            nextHistory.push({ text: `JavaScript Error: ${err?.message}`, type: 'error' });
          }
        }
        break;

      case 'python':
        nextHistory.push({ text: 'FakePython 3.10.4 (Simulated terminal runtime)', type: 'output' });
        nextHistory.push({ text: 'Type "exit()" or print calculations. Try python scripts inside JS tool.', type: 'output' });
        break;

      case 'clear':
        setTerminalHistory([
          { text: 'guest@novavm:~$ ', type: 'input' }
        ]);
        setTerminalInput('');
        return;

      default:
        nextHistory.push({ text: `bash: ${cmd}: command not found. Need options? Type "help".`, type: 'error' });
    }

    nextHistory.push({ text: 'guest@novavm:~$ ', type: 'input' });
    setTerminalHistory(nextHistory);
    setTerminalInput('');
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans flex-col md:flex-row">
      
      {/* GLOBAL HUD SYSTEM NOTIFICATION LAYER */}
      {sysNotification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border bg-slate-900 shadow-2xl animate-scale-up border-orange-500/30">
          <div className={`w-2 h-2 rounded-full ${
            sysNotification.type === 'success' ? 'bg-emerald-500 animate-ping' :
            sysNotification.type === 'warn' ? 'bg-rose-500 animate-ping' : 'bg-orange-500 animate-ping'
          }`} />
          <span className="text-xs font-semibold text-slate-100">{sysNotification.text}</span>
        </div>
      )}

      {/* COMPACT TOP NAVIGATION HEADER ON MOBILE / BRAND RECKONING */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col justify-between p-4 md:p-6 shrink-0 z-30">
        <div className="flex flex-row md:flex-col items-center md:items-start w-full justify-between md:justify-start gap-0 md:gap-8">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-600/20">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-slate-100 tracking-tight leading-none uppercase">NovaVM</h1>
              <p className="text-[10px] text-orange-500 font-bold tracking-widest uppercase mt-1">Retro Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row md:flex-col gap-1.5 mt-0 md:mt-2 w-auto md:w-full">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Monitor className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Boot Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('configurator')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'configurator'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">VM Script Maker</span>
            </button>

            <button
              onClick={() => setActiveTab('wiki')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'wiki'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Setup Wiki</span>
            </button>
          </nav>
        </div>

        {/* Info footer tag on Desktop side */}
        <div className="hidden md:block pt-4 border-t border-slate-800">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Android JIT Target:</span>
              <span className="text-emerald-500">8.0+ Ready</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Emulation core:</span>
              <span className="text-orange-500">QEMU V86</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CORE VIEW SCREEN PORT */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        
        {/* VIEW TAB 1: RETRO COMPUTER BOOTER SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
            
            {/* Introductory control title banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Live Operating System Sandbox</h2>
                <p className="text-xs text-slate-400 mt-1">Boot high-fidelity retro screens optimized with custom widgets for touch devices.</p>
              </div>

              {/* OS Quick Selector & Boot Lever */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Select Target OS:</span>
                  <select
                    value={selectedOS}
                    onChange={(e) => {
                      setSelectedOS(e.target.value as GuestOSType);
                      setIsPowerOn(false); // require rebooting
                    }}
                    disabled={isBooting}
                    className="bg-transparent text-xs font-bold text-orange-500 outline-hidden cursor-pointer"
                  >
                    <option value="win98" className="bg-slate-950 font-bold">Windows 98 SE</option>
                    <option value="winxp" className="bg-slate-950 font-bold">Windows XP Sp3</option>
                    <option value="alpine" className="bg-slate-950 font-bold">Linux Terminal Box</option>
                  </select>
                </div>

                <button
                  onClick={handlePowerOn}
                  disabled={isBooting}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPowerOn
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500'
                      : 'bg-orange-500 text-slate-950 hover:bg-orange-400 shadow-lg shadow-orange-500/20'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{isPowerOn ? 'Shut Down VM' : 'Boot Live Simulator'}</span>
                </button>
              </div>
            </div>

            {/* MAIN EMULATORY VENDOR SCREEN CONTAINER */}
            <div className={`crt-screen bg-black rounded-3xl overflow-hidden border-4 shadow-2xl transition-all duration-300 ${
              isPowerOn 
                ? 'border-slate-700 ring-4 ring-orange-500/10' 
                : 'border-slate-900 ring-1 ring-slate-800'
            }`}>
              
              {/* Retro top status strip containing simulated metrics */}
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isPowerOn ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                  <span className="font-bold text-slate-200">
                    {isPowerOn ? `NovaVM Engine: ${selectedOS.toUpperCase()}` : 'NovaVM Virtual monitor: Off'}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-6">
                  <span>RAM Alloc: <strong className="text-orange-500">{calculatedOptions.ram}MB</strong></span>
                  <span>CPU: <strong className="text-indigo-400">1.4GHz Translation</strong></span>
                  <span>Mouse Mapping: <strong className="text-emerald-400">{trackpadEnabled ? 'Dual Touch' : 'Precision'}</strong></span>
                </div>
              </div>

              {/* VIRTUAL SCREEN CANVAS DISPLAY FRAME */}
              <div className="relative aspect-video w-full bg-slate-900 select-none overflow-hidden crt-flicker min-h-[380px] md:min-h-[460px]">
                
                {/* 1. POWER IS COMPLETELY OFF SCREEN */}
                {!isPowerOn && !isBooting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-3xl mb-4 text-slate-500">
                      🖥️
                    </div>
                    <span className="font-vt text-lg text-slate-400 tracking-wider">VM IS IN A DEEP OFF STATE</span>
                    <p className="max-w-md text-xs text-slate-500 mt-2">
                       Select Windows 98, XP, or Linux to test in-browser simulation, or configure QEMU launchers inside the second tab.
                    </p>
                    <button
                      onClick={handlePowerOn}
                      className="mt-6 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold shadow-lg shadow-orange-600/15 cursor-pointer flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Click to Boot Sandbox</span>
                    </button>
                  </div>
                )}

                {/* 2. BIOS LOADING SCREEN / PROGRESS */}
                {isBooting && (
                  <div className="absolute inset-0 bg-black font-mono text-xs p-5 md:p-8 flex flex-col justify-between overflow-hidden">
                    <div className="space-y-1.5 text-amber-500 uppercase tracking-wide font-semibold">
                      {biosOutput.map((line, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-slate-600">&#62;</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>

                    {/* BIOS progress gauge */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-amber-500">
                        <span>NovaVM Memory Mapping: {bootProgress}% Complete</span>
                        <span className="animate-pulse">Loading ROM Floppy disks...</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-amber-500 h-full transition-all duration-200" 
                          style={{ width: `${bootProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SIMULATED OS ACTIVE RUNNING GUI */}
                {isPowerOn && (
                  <div className="absolute inset-0 flex flex-col h-full w-full select-none">
                    
                    {/* WINDOWS 98 / XP MAIN COMPONENT SIMULATOR DESKTOP AREA */}
                    {(selectedOS === 'win98' || selectedOS === 'winxp') && (
                      <div 
                        className={`flex-1 w-full relative overflow-hidden p-3 ${
                          selectedOS === 'win98' 
                            ? 'bg-[#008080]' // Classic win98 Teal color
                            : 'bg-radial from-[#1e61c3] to-[#0433a0] bg-cover' // XP Blue bliss
                        }`}
                        style={selectedOS === 'winxp' ? { backgroundImage: `url('https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=1200&q=80')` } : {}}
                      >
                        
                        {/* THE FAMOUS ICON GRIDS */}
                        <div className="absolute left-3 top-3 flex flex-col gap-5 text-center w-20">
                          
                          {/* Welcome text icon */}
                          <div 
                            onDoubleClick={() => toggleWindow('welcome')}
                            onTouchEnd={() => toggleWindow('welcome')}
                            className="group flex flex-col items-center gap-1 cursor-pointer"
                          >
                            <div className="text-3xl filter hover:drop-shadow-md transform hover:scale-105 transition-transform">💻</div>
                            <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-sm bg-black/30 truncate max-w-full">
                              My Computer
                            </span>
                          </div>

                          {/* Notepad icon */}
                          <div 
                            onDoubleClick={() => toggleWindow('notepad')}
                            onTouchEnd={() => toggleWindow('notepad')}
                            className="group flex flex-col items-center gap-1 cursor-pointer"
                          >
                            <div className="text-3xl">📝</div>
                            <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-sm bg-black/30 truncate max-w-full">
                              Editor Notes
                            </span>
                          </div>

                          {/* Paint icon */}
                          {selectedOS === 'win98' && (
                            <div 
                              onDoubleClick={() => toggleWindow('paint')}
                              onTouchEnd={() => toggleWindow('paint')}
                              className="group flex flex-col items-center gap-1 cursor-pointer"
                            >
                              <div className="text-3xl">🎨</div>
                              <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-sm bg-black/30 truncate max-w-full">
                                Paint 98
                              </span>
                            </div>
                          )}

                          {/* Minesweeper icon */}
                          <div 
                            onDoubleClick={() => toggleWindow('minesweeper')}
                            onTouchEnd={() => toggleWindow('minesweeper')}
                            className="group flex flex-col items-center gap-1 cursor-pointer"
                          >
                            <div className="text-3xl">💣</div>
                            <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-sm bg-black/30 truncate max-w-full">
                              Mine Sweep
                            </span>
                          </div>

                          {/* XP Media Player icon */}
                          {selectedOS === 'winxp' && (
                            <div 
                              onDoubleClick={() => toggleWindow('music')}
                              onTouchEnd={() => toggleWindow('music')}
                              className="group flex flex-col items-center gap-1 cursor-pointer"
                            >
                              <div className="text-3xl">🎧</div>
                              <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-sm bg-black/30 truncate max-w-full">
                                NovaPlayer
                              </span>
                            </div>
                          )}

                          {/* Internet Explorer icon */}
                          {selectedOS === 'win98' && (
                            <div 
                              onDoubleClick={() => toggleWindow('ie')}
                              onTouchEnd={() => toggleWindow('ie')}
                              className="group flex flex-col items-center gap-1 cursor-pointer"
                            >
                              <div className="text-3xl">🌐</div>
                              <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-sm bg-black/30 truncate max-w-full">
                                IE Explorer
                              </span>
                            </div>
                          )}
                        </div>

                        {/* WINDOWS RENDER LOOP MANAGER */}
                        {windows.map((win) => {
                          if (!win.isOpen) return null;

                          return (
                            <div
                              key={win.id}
                              onClick={() => focusWindow(win.id)}
                              className={`absolute ${
                                selectedOS === 'win98' ? 'win98-raised bg-[#c0c0c0] p-[3px]' : 'bg-slate-100 rounded-t-xl overflow-hidden shadow-2xl border border-slate-300'
                              } flex flex-col ${
                                win.isMaximized 
                                  ? '!inset-0 !w-full !h-full !transform-none !top-0 !left-0 z-50'
                                  : 'rounded-b-sm'
                              }`}
                              style={win.isMaximized ? {} : {
                                width: win.width,
                                height: win.height,
                                left: win.x,
                                top: win.y,
                                zIndex: win.zIndex
                              }}
                            >
                              
                              {/* Window blue top header */}
                              <div 
                                className={`px-2.5 py-1 flex items-center justify-between font-bold text-xs select-none cursor-grab active:cursor-grabbing ${
                                  selectedOS === 'win98'
                                    ? 'bg-linear-to-r from-[#000080] to-[#1084d0] text-white'
                                    : 'bg-linear-to-r from-[#1b5bd4] to-[#267cf2] text-white py-2 shadow-xs'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span>{win.id === 'welcome' ? 'ℹ️' : win.id === 'notepad' ? '📝' : win.id === 'paint' ? '🎨' : win.id === 'music' ? '🎵' : '🖥️'}</span>
                                  <span className="truncate">{win.title}</span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button 
                                    onClick={() => maximizeWindow(win.id)} 
                                    className={`${selectedOS === 'win98' ? 'win98-button p-0.5 h-5 w-5 text-slate-900 font-extrabold text-[9px]' : 'hover:bg-blue-600 p-1.5 rounded-md text-white'} flex items-center justify-center`}
                                    title="Resize window size"
                                  >
                                    {win.isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                                  </button>
                                  <button 
                                    onClick={() => toggleWindow(win.id)} 
                                    className={`${selectedOS === 'win98' ? 'win98-button p-0.5 h-5 w-5 text-rose-800 font-extrabold text-[9px]' : 'hover:bg-rose-500 p-1.5 rounded-md text-white'} flex items-center justify-center`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Window core content section */}
                              <div className="flex-1 overflow-auto bg-white text-slate-900 p-3 flex flex-col min-h-0">
                                
                                {/* A. WELCOME GUIDE APP */}
                                {win.id === 'welcome' && (
                                  <div className="space-y-3.5 text-xs">
                                    <div className="flex items-center gap-3.5 pb-2 border-b border-slate-100">
                                      <span className="text-3xl">🦕</span>
                                      <div>
                                        <h3 className="font-bold text-sm text-slate-800">You booted NovaVM Virtual Space!</h3>
                                        <p className="text-[10px] text-slate-400">Secure Web client sandbox running on Android targets</p>
                                      </div>
                                    </div>

                                    <p className="leading-relaxed text-slate-600">
                                      This high-fidelity interface recreates the most nostalgic operative systems directly in-browser. 
                                      You can fully drag, resize, and play games on any device.
                                    </p>

                                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 space-y-2">
                                      <p className="font-bold text-[10px] text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Testing options on mobile
                                      </p>
                                      <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-1">
                                        <li>Double-tap desktop icons to launch software!</li>
                                        <li>Open Paint to sketch custom digital art drafts.</li>
                                        <li>Listen to Synthesized XP melodies in NovaPlayer!</li>
                                        <li>Select the second tab to generate copy-paste QEMU configs!</li>
                                      </ul>
                                    </div>

                                    <button
                                      onClick={() => toggleWindow('welcome')}
                                      className="w-full text-center py-2 rounded-lg bg-orange-600 text-white font-bold text-xs"
                                    >
                                      Proceed to Desktop Space
                                    </button>
                                  </div>
                                )}

                                {/* B. NOTEPAD APPLICATION MODULE */}
                                {win.id === 'notepad' && (
                                  <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
                                    <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                                      {/* File explorer row */}
                                      <div className="flex items-center gap-1.5 overflow-x-auto">
                                        {notepadFiles.map((file, fidx) => (
                                          <button
                                            key={fidx}
                                            onClick={() => selectNotepadFile(fidx)}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-md shrink-0 border transition-all ${
                                              selectedNotepadIndex === fidx 
                                                ? 'bg-orange-50 border-orange-200 text-orange-600'
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                            }`}
                                          >
                                            {file.name}
                                          </button>
                                        ))}
                                      </div>

                                      <button
                                        onClick={() => setIsAddingNewFile(!isAddingNewFile)}
                                        className="p-1 hover:bg-slate-100 rounded-md text-orange-600"
                                        title="Create new file inside VM"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Create name dialogue */}
                                    {isAddingNewFile && (
                                      <form onSubmit={createNotepadFile} className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400">File Name:</span>
                                        <input
                                          type="text"
                                          placeholder="journal.txt"
                                          value={newFileNameInput}
                                          onChange={(e) => setNewFileNameInput(e.target.value)}
                                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-800"
                                        />
                                        <button type="submit" className="px-3 py-1 text-[10px] bg-orange-600 text-white font-bold rounded-md">
                                          Create
                                        </button>
                                      </form>
                                    )}

                                    {/* Text editor box */}
                                    <textarea
                                      value={notepadEditorText}
                                      onChange={(e) => setNotepadEditorText(e.target.value)}
                                      className="flex-1 w-full bg-[#fcfdfa] border border-slate-200 p-2.5 rounded-lg text-xs font-mono text-slate-800 outline-hidden focus:border-slate-300 resize-none min-h-0"
                                    />

                                    {/* Note saving controller */}
                                    <div className="flex gap-2.5">
                                      <button
                                        onClick={saveCurrentNotepadFile}
                                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-1"
                                      >
                                        <Save className="w-3 h-3" />
                                        <span>Save File</span>
                                      </button>
                                      
                                      <button
                                        onClick={() => {
                                          setNotepadEditorText('');
                                        }}
                                        className="p-1.5 rounded-lg bg-slate-150 text-slate-500 hover:bg-slate-200 text-[10px] font-bold"
                                      >
                                        Reset Form
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* C. MS PAINT CANVAS MODULE */}
                                {win.id === 'paint' && (
                                  <div className="flex-1 flex flex-col min-h-0 space-y-2">
                                    
                                    {/* Palette menu */}
                                    <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                                      
                                      <div className="flex items-center gap-1">
                                        {['#000000', '#d01010', '#10d010', '#1010d0', '#f1c40f', '#9b59b6', '#e67e22', '#7f8c8d'].map((color) => (
                                          <button
                                            key={color}
                                            onClick={() => setPaintColor(color)}
                                            style={{ backgroundColor: color }}
                                            className={`w-4 h-4 rounded-full border border-white cursor-pointer ${
                                              paintColor === color ? 'ring-2 ring-orange-500 scale-105' : 'hover:scale-105'
                                            }`}
                                          />
                                        ))}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-slate-400">BRUSH:</span>
                                        <input
                                          type="range"
                                          min="1"
                                          max="12"
                                          value={paintSize}
                                          onChange={(e) => setPaintSize(Number(e.target.value))}
                                          className="w-16 h-1 bg-slate-200 accent-orange-600"
                                        />

                                        <button
                                          onClick={clearPaintCanvas}
                                          className="text-[9px] bg-white border border-slate-300 font-extrabold text-slate-700 px-1 py-0.5 rounded-sm uppercase tracking-tight"
                                        >
                                          Clear
                                        </button>
                                      </div>
                                    </div>

                                    {/* Draw Canvas panel */}
                                    <div className="flex-1 border border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner relative min-h-0 flex items-center justify-center">
                                      <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={300}
                                        onMouseDown={handlePaintStart}
                                        onMouseMove={handlePaintDraw}
                                        onMouseUp={handlePaintStop}
                                        onMouseLeave={handlePaintStop}
                                        onTouchStart={handlePaintStart}
                                        onTouchMove={handlePaintDraw}
                                        onTouchEnd={handlePaintStop}
                                        className="max-full max-h-full aspect-video cursor-crosshair block"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* D. MINESWEEPER INTERACTIVE RUNTIME */}
                                {win.id === 'minesweeper' && (
                                  <div className="flex-1 flex flex-col items-center justify-between min-h-0 space-y-3">
                                    
                                    {/* System tray metrics details */}
                                    <div className="win98-raised bg-[#c0c0c0] w-full p-2 flex items-center justify-between font-mono text-xs">
                                      <div className="win98-sunken px-2 py-0.5 font-bold text-red-600 text-sm w-12 text-center bg-black leading-none">
                                        {remainingMines.toString().padStart(3, '0')}
                                      </div>

                                      <button
                                        onClick={startMinesweeperGame}
                                        className="win98-button p-1 text-lg leading-none cursor-pointer"
                                      >
                                        {minesweeperFace}
                                      </button>

                                      <button
                                        onClick={startMinesweeperGame}
                                        className="win98-button px-2 py-0.5 text-[9px] font-bold text-slate-700"
                                      >
                                        RETRY
                                      </button>
                                    </div>

                                    {/* Grid frame mapping */}
                                    <div className="p-1 bg-[#808080] rounded-sm shadow-inner overflow-auto max-w-full">
                                      <div className="grid grid-cols-8 gap-0.5" style={{ width: '192px' }}>
                                        {mineGrid.map((row, rIdx) => 
                                          row.map((cell, cIdx) => (
                                            <button
                                              key={`${rIdx}-${cIdx}`}
                                              onClick={() => handleMinesweeperCellClick(rIdx, cIdx)}
                                              onContextMenu={(e) => handleMinesweeperRightClick(e, rIdx, cIdx)}
                                              className={`w-6 h-6 border font-black text-xs flex items-center justify-center cursor-pointer ${
                                                cell.isRevealed
                                                  ? 'bg-[#c0c0c0] border-[#909090]'
                                                  : 'bg-[#c0c0c0] border-slate-50 border-r-slate-700 border-b-slate-700 active:border-[#909090]'
                                              }`}
                                            >
                                              {cell.isRevealed ? (
                                                cell.isMine ? (
                                                  '💣'
                                                ) : cell.neighborMines > 0 ? (
                                                  <span className={
                                                    cell.neighborMines === 1 ? 'text-blue-700' :
                                                    cell.neighborMines === 2 ? 'text-green-700' :
                                                    cell.neighborMines === 3 ? 'text-red-700' : 'text-purple-700'
                                                  }>
                                                    {cell.neighborMines}
                                                  </span>
                                                ) : ''
                                              ) : (
                                                cell.isFlagged ? '🚩' : ''
                                              )}
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    </div>

                                    <div className="text-[9px] font-bold text-slate-400 capitalize text-center leading-normal">
                                      <span>Tip: Right-click cell to place 🚩 Flag</span>
                                    </div>

                                  </div>
                                )}

                                {/* E. WINDOWS MEDIA PLAYER WITH REAL CHIPTUNE MELODY GENERATOR */}
                                {win.id === 'music' && (
                                  <div className="flex-1 flex flex-col justify-between min-h-0 space-y-4">
                                    
                                    {/* Media visualizer and display */}
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                                        <span className="truncate max-w-[200px]">
                                          {currentPlayingTrack ? `🔊 Now: ${currentPlayingTrack.title}` : '🔇 NovaSynth Ready'}
                                        </span>
                                        <span>Freq Mode: 44.1kHz</span>
                                      </div>

                                      {/* LED reactive visualizer bars */}
                                      <div className="h-10 flex items-end justify-center gap-1 bg-black/40 rounded-lg p-1.5">
                                        {synthVisualizerFreqs.map((val, idx) => (
                                          <div
                                            key={idx}
                                            className="bg-linear-to-t from-orange-600 via-indigo-500 to-cyan-400 transition-all duration-100 flex-1 rounded-sm"
                                            style={{ height: `${val}%` }}
                                          />
                                        ))}
                                      </div>
                                    </div>

                                    {/* Track list select */}
                                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[120px]">
                                      {RETRO_TRACKS.map((track) => (
                                        <div
                                          key={track.id}
                                          onClick={() => {
                                            playSynthMelody(track);
                                            triggerNotification(`Synthesizing retro MIDI: ${track.title}`, 'success');
                                          }}
                                          className={`px-3 py-1.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                            currentPlayingTrack?.id === track.id
                                              ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 font-bold'
                                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Music className="w-3.5 h-3.5 shrink-0" />
                                            <div className="truncate text-left max-w-[150px]">
                                              <p className="truncate font-bold leading-tight">{track.title}</p>
                                              <p className="text-[9px] text-slate-400 leading-none">{track.artist}</p>
                                            </div>
                                          </div>
                                          <span className="text-[10px] text-slate-400 font-mono">{track.duration}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Controls buttons row */}
                                    <div className="flex gap-2">
                                      <button
                                        onClick={stopSynthesizer}
                                        disabled={!audioSynthesizing}
                                        className="flex-1 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[10px] rounded-lg disabled:opacity-30"
                                      >
                                        STOPS SYNTH
                                      </button>
                                      
                                      <button
                                        onClick={() => setAudioMute(!audioMute)}
                                        className={`px-3.5 py-1.5 border rounded-lg text-xs font-bold ${
                                          audioMute 
                                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                                            : 'bg-slate-50 border-slate-200 text-slate-500'
                                        }`}
                                      >
                                        {audioMute ? 'Unmute' : 'Mute'}
                                      </button>
                                    </div>

                                  </div>
                                )}

                                {/* F. MICRO INTERNET EXPLORER BROWSER */}
                                {win.id === 'ie' && (
                                  <div className="flex-1 flex flex-col min-h-0 space-y-2">
                                    
                                    {/* Browser bar */}
                                    <form onSubmit={handleBrowserSearch} className="flex gap-1.5">
                                      <span className="text-sm self-center">🌐</span>
                                      <input
                                        type="text"
                                        placeholder="Type keyword e.g. 'Limbo PC', 'Windows 98 ISO'"
                                        value={browserSearchQuery}
                                        onChange={(e) => setBrowserSearchQuery(e.target.value)}
                                        className="flex-1 px-2 py-1 text-xs bg-slate-100 border rounded-md"
                                      />
                                      <button
                                        type="submit"
                                        className="px-3 bg-blue-600 text-white font-bold text-xs rounded-md"
                                      >
                                        Go
                                      </button>
                                    </form>

                                    {/* Mini mock Web Page content */}
                                    <div className="flex-1 bg-white border rounded-lg p-3 overflow-auto min-h-0 border-slate-200 text-left text-xs text-slate-700 leading-relaxed font-mono">
                                      
                                      {browserLoadedPage === 'home' && (
                                        <div className="space-y-3">
                                          <div className="bg-blue-600 text-white p-3 rounded-lg text-center font-bold">
                                            <h1>🌐 Nova Search Portal (1999)</h1>
                                          </div>
                                          <p>Enter search query above. Popular searches:</p>
                                          <div className="grid grid-cols-2 gap-2">
                                            <button 
                                              onClick={() => {
                                                setBrowserSearchQuery('Limbo Emulator setup guides');
                                                setBrowserLoadedPage('search-results');
                                              }}
                                              type="button"
                                              className="border p-1.5 rounded bg-slate-50 text-[10px] text-blue-600 hover:underline"
                                            >
                                              Limbo Guide
                                            </button>
                                            <button 
                                              onClick={() => {
                                                setBrowserSearchQuery('Best Windows 2000 light ISO');
                                                setBrowserLoadedPage('search-results');
                                              }}
                                              type="button"
                                              className="border p-1.5 rounded bg-slate-50 text-[10px] text-blue-600 hover:underline"
                                            >
                                              Win 2000 ROMs
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {browserLoadedPage === 'search-results' && (
                                        <div className="space-y-4">
                                          <h4 className="font-bold border-b pb-1 text-slate-800">Search Results: "{browserSearchQuery}"</h4>
                                          
                                          <div className="space-y-3 text-[11px]">
                                            <div className="border-b border-dashed pb-1">
                                              <p className="font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => setBrowserLoadedPage('limbo-wiki')}>
                                                Official Limbo Android Setup Guide Ver 8.1
                                              </p>
                                              <p className="text-slate-500">Discover optimal RAM buffers and CPU core layouts specifically targeted at Android 8, 9, 10, 11 phones.</p>
                                            </div>

                                            <div className="border-b border-dashed pb-1">
                                              <p className="font-bold text-blue-600 hover:underline">
                                                Lightweight Win 98 ISO Collection (Clean OEM Edition)
                                              </p>
                                              <p className="text-slate-500">Mirror repositories containing safe, fully bootable Windows 95, 98 SE, and MS-DOS floppy images totaling under 70MB.</p>
                                            </div>
                                          </div>

                                          <button 
                                            onClick={() => setBrowserLoadedPage('home')}
                                            className="px-2 py-1 bg-slate-200 rounded text-[9px] font-bold"
                                          >
                                            Back Home
                                          </button>
                                        </div>
                                      )}

                                      {browserLoadedPage === 'limbo-wiki' && (
                                        <div className="space-y-2">
                                          <h4 className="font-bold text-blue-800">Limbo PC Android Setup Guide</h4>
                                          <p className="text-[11px]">To install actual bootable ISOs on your Android 8+ device:</p>
                                          <ol className="list-decimal pl-4 space-y-1 text-[10px]">
                                            <li>Download and install the Limbo PC Emulator APK.</li>
                                            <li>Place your Windows 98 SE ISO inside your phone storage folder.</li>
                                            <li>Initialize a new machine profile named Windows98.</li>
                                            <li>Allocate 256MB of RAM buffer and select single Core qemu32 CPU.</li>
                                            <li>Mount the ISO file inside the CDROM drive.</li>
                                            <li>Click Start to initiate Windows Setup.</li>
                                          </ol>
                                          <button 
                                            onClick={() => setBrowserLoadedPage('search-results')}
                                            className="mt-3 px-2 py-1 bg-slate-200 rounded text-[9px] font-bold"
                                          >
                                            Back to Search Results
                                          </button>
                                        </div>
                                      )}

                                    </div>
                                  </div>
                                )}

                              </div>

                            </div>
                          );
                        })}

                        {/* WINDOWS 98 / XP BOTTOM TASK BAR SEGMENT */}
                        <div 
                          className={`absolute bottom-0 left-0 right-0 h-11 flex items-center justify-between border-t select-none z-40 ${
                            selectedOS === 'win98' 
                              ? 'bg-[#c0c0c0] border-white' 
                              : 'bg-linear-to-r from-[#245dd9] via-[#245dd9] to-[#0f34aa] border-t-blue-400 font-sans'
                          }`}
                        >
                          {/* Start menu button */}
                          <div className="flex items-center h-full pl-1">
                            <button
                              onClick={() => {
                                // Toggle welcome popup as a start action
                                toggleWindow('welcome');
                                triggerNotification('Opening Nova Start Launcher...', 'info');
                              }}
                              className={`h-8 font-black text-xs px-3 hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ${
                                selectedOS === 'win98'
                                  ? 'win98-raised bg-[#c0c0c0] text-[#0a0a0a]'
                                  : 'bg-linear-to-r from-emerald-600 to-emerald-500 rounded-r-lg text-white font-serif italic shadow-sm px-4'
                              }`}
                            >
                              <span>⚡</span>
                              <span>{selectedOS === 'win98' ? 'Start' : 'start'}</span>
                            </button>

                            {/* Active task shortcuts */}
                            <div className="hidden sm:flex items-center gap-1.5 ml-2">
                              {['welcome', 'notepad', 'minesweeper'].map((id) => (
                                <button
                                  key={id}
                                  onClick={() => toggleWindow(id)}
                                  className={`px-3 py-1 text-[10px] font-semibold border rounded-sm truncate max-w-[80px] cursor-pointer ${
                                    selectedOS === 'win98'
                                      ? 'bg-[#c0c0c0] border-white text-slate-900 border-r-slate-700 border-b-slate-700'
                                      : 'bg-blue-600/30 border-blue-500 text-slate-100 rounded'
                                  }`}
                                >
                                  {id.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Clock indicator tray */}
                          <div 
                            className={`h-7 px-3.5 mr-1 flex items-center gap-2 font-mono text-[10px] ${
                              selectedOS === 'win98' 
                                ? 'win98-sunken text-slate-900 bg-[#c0c0c0]' 
                                : 'bg-[#0f3299]/50 border border-[#245dd9] rounded-lg text-slate-200'
                            }`}
                          >
                            <span>🔊</span>
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* ALPINE / DEBIAN LINUX INTERACTIVE BASH TERMINAL PORT */}
                    {selectedOS === 'alpine' && (
                      <div className="flex-1 bg-black font-mono text-xs flex flex-col p-4 overflow-hidden text-left relative">
                        
                        {/* Interactive terminal output history block */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 leading-relaxed min-h-0 pb-12">
                          {terminalHistory.map((line, idx) => (
                            <div key={idx} className="whitespace-pre-wrap select-text">
                              {line.type === 'input' && (
                                <p className="text-[#00ff00] font-bold">{line.text}</p>
                              )}
                              {line.type === 'error' && (
                                <p className="text-rose-500 font-semibold">{line.text}</p>
                              )}
                              {line.type === 'success' && (
                                <p className="text-cyan-400 font-semibold">{line.text}</p>
                              )}
                              {line.type === 'ascii' && (
                                <p className="text-orange-400 leading-normal font-sans text-[11px] bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 my-1">{line.text}</p>
                              )}
                              {line.type === 'output' && (
                                <p className="text-slate-350">{line.text}</p>
                              )}
                            </div>
                          ))}
                          <div ref={terminalBottomRef} />
                        </div>

                        {/* Interactive actual bash input terminal entry frame */}
                        <form onSubmit={handleTerminalSubmit} className="absolute bottom-2 left-4 right-4 bg-black/90 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs z-10 gap-1.5">
                          <span className="text-[#00ff00] font-bold shrink-0">guest@novavm:~$</span>
                          <input
                            type="text"
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            placeholder="Type commands like 'help', 'neofetch' or 'ls'..."
                            className="flex-1 bg-transparent text-slate-100 outline-hidden font-mono border-0 p-0 text-xs focus:ring-0 focus:ring-offset-0"
                            autoComplete="off"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] px-3.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer"
                          >
                            RUN
                          </button>
                        </form>

                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>

            {/* SCREEN OVERLAY MOBILE TOOLBAR PANEL */}
            <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-wrap gap-4.5 justify-between items-center text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 sm:mb-0 mr-1">
                  📲 Virtual Input Helpers (Android/Touch Optimized):
                </span>
                
                {/* Keyboard trigger display */}
                <button
                  onClick={() => {
                    setKeyboardToolbarOpen(!keyboardToolbarOpen);
                    triggerNotification(keyboardToolbarOpen ? 'Mobile keyboard closed' : 'Hardware shortcut keys deployed!', 'info');
                  }}
                  className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    keyboardToolbarOpen 
                      ? 'bg-orange-600 text-white border-orange-500' 
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{keyboardToolbarOpen ? 'Hide Hotkeys' : 'Show Tool Keys'}</span>
                </button>

                {/* Reboot button */}
                <button
                  onClick={handleResetEmulator}
                  disabled={!isPowerOn}
                  className="px-3 py-1.5 rounded-xl border bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reboot VM</span>
                </button>
              </div>

              {/* Volume details toggle */}
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">SYS AUDIO:</span>
                <button
                  onClick={() => {
                    setAudioMute(!audioMute);
                    triggerNotification(audioMute ? 'Synthesizer Audio Enabled!' : 'MIDI Synthesizer muted.', 'info');
                  }}
                  className="text-orange-500 font-semibold"
                >
                  {audioMute ? '🔴 MUTED' : '🟢 ENABLED'}
                </button>
              </div>
            </div>

            {/* DYNAMIC SHORTCUT TOOL KEYS ROW */}
            {keyboardToolbarOpen && (
              <div className="bg-slate-950 border border-orange-500/10 p-3 rounded-2xl grid grid-cols-5 sm:flex gap-1.5 animate-scale-up">
                {['ESC', 'TAB', 'CTRL', 'ALT', 'SHIFT', 'ENTER', 'SPACE', '↑', '↓', '←', '→'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      triggerNotification(`Emulated "${key}" click sent to VM kernel.`, 'info');
                      if (selectedOS === 'alpine') {
                        // send fake control input directly to command bar
                        if (key === 'ENTER') {
                          handleTerminalSubmit(new Event('submit') as any);
                        } else {
                          setTerminalInput(prev => `${prev} ${key}`.trim());
                        }
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-800 font-semibold text-center"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW TAB 2: ACTIVE ANDROID VM CONFIGURATION ENGINE & SCRIPT MAKER */}
        {activeTab === 'configurator' && (
          <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full animate-fadeIn text-left">
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>🛠️</span> Android VM Configurator & Script Generator
              </h2>
              <p className="text-xs text-slate-400">
                Instantly calculate and optimize VM settings for running native Operating Systems inside actual mobile hardware. 
                Produces ready-to-run configurations for **Limbo Emulator** and **QEMU command-lines for Termux**.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form Input parameters */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-5">
                <h3 className="font-bold text-xs text-orange-500 uppercase tracking-widest pb-2 border-b border-slate-800">
                  Phone Configuration Spec parameters:
                </h3>

                {/* Host RAM Select */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold flex justify-between">
                    <span>📱 Host Mobile RAM Capacity:</span>
                    <strong className="text-orange-500">{androidRamCapacity} GB RAM</strong>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="18"
                    step="1"
                    value={androidRamCapacity}
                    onChange={(e) => setAndroidRamCapacity(Number(e.target.value))}
                    className="w-full accent-orange-500 bg-slate-950 h-1.5 rounded"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>2GB (Low)</span>
                    <span>6GB (Average)</span>
                    <span>16GB+ (Heavy Dev Option)</span>
                  </div>
                </div>

                {/* Target Guest OS */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-350 font-semibold">🏁 Guest Operating System Target:</label>
                  <select
                    value={androidVMOs}
                    onChange={(e) => setAndroidVMOs(e.target.value as GuestOSType)}
                    className="w-full text-xs bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300 outline-hidden"
                  >
                    <option value="win98">Windows 98 Second Edition</option>
                    <option value="winxp">Windows XP Professional SP3</option>
                    <option value="alpine">Alpine Linux (Command Shell Console)</option>
                    <option value="debian">Debian Linux Desktop GUI</option>
                    <option value="freedos">FreeDOS v1.3 Retro DOS</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* CPU Cores */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-350 font-semibold">⚙️ Virtual Cores:</label>
                    <select
                      value={cpuCoreAllocation}
                      onChange={(e) => setCpuCoreAllocation(Number(e.target.value))}
                      className="w-full text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-305 outline-hidden"
                    >
                      <option value="1">1 Core (Safest for Win98)</option>
                      <option value="2">2 Cores (XP Recommended)</option>
                      <option value="4">4 Cores (Highly accelerated)</option>
                    </select>
                  </div>

                  {/* Virtual Disk Bus */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-350 font-semibold">💾 Disk Interface Bus:</label>
                    <select
                      value={vDiskType}
                      onChange={(e) => setVDiskType(e.target.value as any)}
                      className="w-full text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-305 outline-hidden"
                    >
                      <option value="ide">IDE (Classic Compat)</option>
                      <option value="scsi">SCSI Controller</option>
                      <option value="virtio">VirtIO (Highly optimized)</option>
                    </select>
                  </div>
                </div>

                {/* Toggles details config */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/60">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Enable Net internet Card</span>
                      <span className="text-[9px] text-slate-500">Virtual host network tunnel forwarding</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isNetworkEnabled}
                      onChange={(e) => setIsNetworkEnabled(e.target.checked)}
                      className="w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/60">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Enable Sound SB16 Blaster</span>
                      <span className="text-[9px] text-slate-500">Enable synthesized wave outputs</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isAudioEnabled}
                      onChange={(e) => setIsAudioEnabled(e.target.checked)}
                      className="w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              {/* Dynamic Optimized output sheet */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-xs text-emerald-400 uppercase tracking-widest">
                       Optimal JVM Settings Calculated:
                    </h3>
                    <span className="bg-emerald-500/10 text-emerald-400 font-bold text-[8px] px-2 py-0.5 rounded-full uppercase">
                      Dynamic Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 font-mono text-[11px] text-slate-300">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] uppercase block">Recommended VM RAM:</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{calculatedOptions.ram} MB</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] uppercase block">Best Sound hardware:</span>
                      <span className="text-amber-400 font-semibold">{isAudioEnabled ? calculatedOptions.audioCard : 'No Sound'}</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] uppercase block">Emulated Cores:</span>
                      <span className="text-indigo-400 font-semibold">{calculatedOptions.cores} Thread CPU</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] uppercase block">Low RAM protection:</span>
                      <span className="text-emerald-500 font-semibold">Active OK</span>
                    </div>
                  </div>

                  {/* Android low memory killer protection warnings */}
                  {androidRamCapacity <= 3 && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] leading-relaxed">
                      ⚠️ <strong>Warning for low-RAM device specs:</strong> To preserve Android runtime memory paging, keep emulated RAM restricted below 256MB. Overloads can prompt Android process shutdowns.
                    </div>
                  )}

                  {androidRamCapacity >= 8 && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px]">
                      🚀 <strong>High Specs detected:</strong> Your device RAM capacity supports heavy desktop targets smoothly with multi-core emulation. Try booting Windows XP Professional easily!
                    </div>
                  )}

                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOS(androidVMOs);
                      setActiveTab('sandbox');
                      triggerNotification(`Active OS changed to ${androidVMOs}! Ready to boot.`, 'success');
                    }}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>⚡ Mount & Boot on Live Monitor</span>
                  </button>
                </div>

              </div>

            </div>

            {/* LIVE EXPORT SCRIPT PANELS (QEMU & LIMBO EMULATOR CFG) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box A: LIMBO CONFIGURATION LIST */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    📑 copyable LIMBO PC Layout Sheet:
                  </h4>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(calculatedOptions.limboCfg);
                      triggerNotification('Limbo configuration sheet copied!', 'success');
                    }}
                    className="p-1 hover:bg-slate-800 rounded bg-slate-950 border border-slate-800 font-semibold text-slate-300 text-[10px] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Config</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 h-56 overflow-auto">
                  <pre className="text-[10px] font-mono text-cyan-400 leading-relaxed whitespace-pre font-medium text-left">
                    {calculatedOptions.limboCfg}
                  </pre>
                </div>
              </div>

              {/* Box B: TERMUX RAW QEMU LAUNCH COMMAND */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    ⚙️ Termux raw QEMU Terminal command:
                  </h4>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(calculatedOptions.termuxCmd);
                      triggerNotification('Termux command copied to clipboard!', 'success');
                    }}
                    className="p-1 hover:bg-slate-800 rounded bg-slate-950 border border-slate-800 font-semibold text-slate-300 text-[10px] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy command</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 h-56 overflow-auto">
                  <p className="text-[9px] text-slate-400 font-mono italic mb-2"># Copy and paste directly inside a Termux root layout after acquiring QEMU binaries:</p>
                  <pre className="text-[10.5px] font-mono text-emerald-400 leading-relaxed whitespace-pre font-medium text-left">
                    {calculatedOptions.termuxCmd}
                  </pre>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW TAB 3: STEP-BY-STEP SETUP WIKI & ISO LINKS */}
        {activeTab === 'wiki' && (
          <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full animate-fadeIn text-left">
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-100">📖 Retro Emulation Masterclass Wiki</h2>
              <p className="text-xs text-slate-400">Step-by-step masterguides detailing precise configurations to achieve optimized boot times.</p>
            </div>

            {/* Expander list containing VM resources */}
            <div className="space-y-4">
              
              {/* Blueprint A: Limbo PC Emulator Setup */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-orange-500 uppercase tracking-widest flex items-center gap-2">
                  <span>💾</span> Method 1: Limbo PC Emulator (GUI Path)
                </h3>
                <p className="text-xs text-slate-305 leading-relaxed">
                  Limbo is an open-source QEMU port for Android. It operates with a friendly visual interface, making it perfect for booting older versions of Windows and lightweight Linux ISOs without compiling code.
                </p>

                <div className="p-4 bg-slate-950 rounded-xl space-y-2 text-xs border border-slate-850 text-slate-300">
                  <h4 className="font-bold text-slate-100">Installation Steps checklist:</h4>
                  <ul className="list-decimal pl-4.5 space-y-1.5 font-medium">
                    <li>Download Limbo PC Emulator (X86 variant) from verified GitHub releases.</li>
                    <li>Open Limbo, select <strong>"Load Machine"</strong> and configure a new system profile named "Windows98".</li>
                    <li>Set CPU Architecture to `x86`, select `pentium2` or `qemu32` for best JIT compilation capabilities.</li>
                    <li>Set memory limits carefully based on our **Configurator tool calculator**. For Win 98, allocate 128MB. For Windows XP, allocate 512MB RAM.</li>
                    <li>Mount your clean operating system boot file inside CDROM/Hard disk tabs.</li>
                    <li>Configure Graphics to `vmware` (for high resolution color scaling) or `cirrus` (for faster redraw speeds on low-tier screens).</li>
                    <li>Deploy sound settings to `sb16` to get the nostalgic Windows Wave synthesizer.</li>
                  </ul>
                </div>
              </div>

              {/* Blueprint B: Termux Linux Setup */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <span>🌀</span> Method 2: Termux + PRoot CLI Shell (Highest Speed Linux Desktop)
                </h3>
                <p className="text-xs text-slate-305 leading-relaxed">
                  For running actual modern operating systems (Ubuntu, Debian, Arch Linux) on Android 8+ with zero hardware overhead, Termux is highly superior. Using a PRoot workspace translates Linux calls to your phone processor directly at 100% speed!
                </p>

                <div className="p-4 bg-slate-950 rounded-xl space-y-2 text-xs border border-slate-850 text-slate-300 font-mono">
                  <h4 className="font-bold text-slate-100 font-sans">Sequence of console commands:</h4>
                  <pre className="text-emerald-400 text-[10.5px] p-2 bg-black rounded-lg leading-relaxed whitespace-pre scroll overflow-auto">
{`# 1. Update packaging listings
pkg update -y && pkg upgrade -y

# 2. Acquire root directory tools
pkg install proot-distro -y

# 3. Mount Debian or Ubuntu distribution
proot-distro install debian

# 4. Initiate secure Linux micro-session
proot-distro login debian`}
                  </pre>
                  <p className="font-sans text-[11px] text-slate-400 mt-2">
                     To deploy full graphical desktops, simply type `tasksel` inside the Debian shell and configure XFCE4 combined with a VNC Server (e.g. TigerVNC). You can then view the complete desktop using any free Android VNC Viewer client app!
                  </p>
                </div>
              </div>

              {/* Blueprint C: Safe ISO Image ROM Resources */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <span>📀</span> Reliable OS ROM Repositories & Utilities
                </h3>
                <p className="text-xs text-[#a3b3cc] leading-relaxed">
                  Searching for clean operating system files often leads to risky malware links. Always prioritize verified, open-source weightless repositories for emulatory testing on mobile devices.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="font-bold text-[11px] text-slate-100">WinWorld Retro ROMs</p>
                    <p className="text-[10px] text-slate-500 mt-1">Excellent archive of historical operating system disks, floppies, and BIOS loaders.</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="font-bold text-[11px] text-slate-100">Alpine Linux Virtual</p>
                    <p className="text-[10px] text-slate-500 mt-1">The official tiny Musl/Busybox ISO. Download sizes are under 40MB, booted in seconds.</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="font-bold text-[11px] text-slate-100">Puppy Linux Desktop</p>
                    <p className="text-[10px] text-slate-500 mt-1">Lightweight desktop distributions that boot completely in memory RAM buffers.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
