/**
 * soundEffects.ts — Analog Horror Audio Engine & Sound Synthesis.
 *
 * Supports real analog horror music tracks and procedural sfx:
 * - Creepy Old Music Box (/audio/creepy_music_box.mp3)
 * - Dark Tension Rising (/audio/dark_tension.mp3)
 * - Urgent countdown ticking, heartbeat, tape hiss, and jumpscare stingers
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private currentMusicAudio: HTMLAudioElement | null = null;
  private currentMusicType: 'none' | 'homescreen' | 'gameplay' | 'ending' | 'monologue' = 'none';

  // Master tracking set for ALL HTMLAudioElements to prevent any detached/orphaned leaks
  private activeAudios = new Set<HTMLAudioElement>();

  // Dedicated homescreen audio tracking & leak-proof listener cleanup
  private homescreenAudio: HTMLAudioElement | null = null;
  private isHomescreenActive = false;
  private pendingHomescreenListeners: Array<{ type: string; handler: (e: Event) => void }> = [];
  private pendingMusicListeners: Array<{ type: string; handler: (e: Event) => void }> = [];

  private killAudioInstance(audio: HTMLAudioElement | null): void {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.removeAttribute('src');
      audio.load();
    } catch {
      // Ignore
    }
    this.activeAudios.delete(audio);
  }

  private killAllAudios(): void {
    for (const a of this.activeAudios) {
      try {
        a.pause();
        a.currentTime = 0;
        a.src = '';
        a.removeAttribute('src');
        a.load();
      } catch {
        // Ignore
      }
    }
    this.activeAudios.clear();
    this.currentMusicAudio = null;
    this.homescreenAudio = null;
    this.currentMusicType = 'none';
  }

  private clearHomescreenUnlockListeners(): void {
    if (typeof window === 'undefined') return;
    for (const item of this.pendingHomescreenListeners) {
      window.removeEventListener(item.type, item.handler);
    }
    this.pendingHomescreenListeners = [];
  }

  private clearMusicUnlockListeners(): void {
    if (typeof window === 'undefined') return;
    for (const item of this.pendingMusicListeners) {
      window.removeEventListener(item.type, item.handler);
    }
    this.pendingMusicListeners = [];
  }

  /**
   * Stop Homescreen Music: Completely halts the creepy music box,
   * unbinds all pending autoplay fallback listeners, and prevents resurrection.
   */
  public stopHomescreenMusic(): void {
    this.isHomescreenActive = false;
    this.clearHomescreenUnlockListeners();

    if (this.homescreenAudio) {
      this.killAudioInstance(this.homescreenAudio);
      this.homescreenAudio = null;
    }

    if (this.currentMusicType === 'homescreen') {
      if (this.currentMusicAudio) {
        this.killAudioInstance(this.currentMusicAudio);
        this.currentMusicAudio = null;
      }
      this.currentMusicType = 'none';
    }

    // Kill any remaining instances referencing creepy_music_box
    for (const a of Array.from(this.activeAudios)) {
      if (a.src?.includes('creepy_music_box') || a.currentSrc?.includes('creepy_music_box')) {
        this.killAudioInstance(a);
      }
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.currentMusicAudio) {
      this.currentMusicAudio.muted = this.muted;
      if (this.muted) {
        try {
          this.currentMusicAudio.pause();
        } catch {
          // ignore
        }
      } else {
        try {
          this.currentMusicAudio.play().catch(() => {});
        } catch {
          // ignore
        }
      }
    } else if (!this.muted) {
      if (this.currentMusicType === 'monologue') {
        this.playAmMonologue();
      } else if (this.currentMusicType === 'homescreen') {
        this.playHomescreenMusic();
      } else {
        this.playGameMusic();
      }
    }
    if (!this.muted) {
      this.initCtx();
    }
    return this.muted;
  }

  public setMute(muted: boolean): void {
    this.muted = muted;
    if (this.currentMusicAudio) {
      this.currentMusicAudio.muted = this.muted;
      if (this.muted) {
        try {
          this.currentMusicAudio.pause();
        } catch {
          // ignore
        }
      } else {
        try {
          this.currentMusicAudio.play().catch(() => {});
        } catch {
          // ignore
        }
      }
    }
  }

  // ─── Music Track Controller ──────────────────────────────────────────────

  /** Play Homescreen Music: Creepy Old Music Box with leak-proof listener tracking */
  public playHomescreenMusic(): void {
    if (typeof window === 'undefined') return;
    if (this.currentMusicType === 'homescreen' && this.homescreenAudio && !this.homescreenAudio.paused) {
      return;
    }
    this.killAllAudios();
    this.clearHomescreenUnlockListeners();
    this.isHomescreenActive = true;

    try {
      const audio = new Audio('/audio/creepy_music_box.mp3');
      audio.loop = true;
      audio.volume = 0.6;
      audio.muted = this.muted;
      this.activeAudios.add(audio);
      this.homescreenAudio = audio;
      this.currentMusicAudio = audio;
      this.currentMusicType = 'homescreen';

      audio.play().catch(() => {
        // If homescreen music has been aborted/cancelled before playback started, do NOT bind unlock listeners!
        if (!this.isHomescreenActive || this.currentMusicType !== 'homescreen' || this.homescreenAudio !== audio) {
          return;
        }

        const unlock = (e: Event) => {
          this.clearHomescreenUnlockListeners();
          // If the user clicked a button/interactive element to leave the homepage, do NOT trigger homescreen music
          const target = e.target as HTMLElement | null;
          if (target?.closest?.('button, a, input, [role="button"]')) {
            return;
          }
          if (!this.isHomescreenActive || this.currentMusicType !== 'homescreen' || this.homescreenAudio !== audio) {
            return;
          }
          audio.play().catch(() => {});
        };

        const events = ['click', 'pointerdown', 'keydown', 'scroll'];
        for (const ev of events) {
          window.addEventListener(ev, unlock, { once: true });
          this.pendingHomescreenListeners.push({ type: ev, handler: unlock });
        }
      });
    } catch {
      // Audio element not supported in current environment
    }
  }

  /** Play Gameplay Music: Dark Tension Rising with guaranteed homescreen kill */
  public playGameMusic(): void {
    if (typeof window === 'undefined') return;
    if (this.currentMusicType === 'gameplay' && this.currentMusicAudio && !this.currentMusicAudio.paused) {
      return;
    }
    this.stopHomescreenMusic();
    this.killAllAudios();
    this.clearMusicUnlockListeners();

    try {
      const audio = new Audio('/audio/dark_tension.mp3');
      audio.loop = true;
      audio.volume = 0.65;
      audio.muted = this.muted;
      this.activeAudios.add(audio);
      this.currentMusicAudio = audio;
      this.currentMusicType = 'gameplay';

      audio.play().catch(() => {
        if (this.currentMusicType !== 'gameplay' || this.currentMusicAudio !== audio) {
          return;
        }
        const unlock = () => {
          this.clearMusicUnlockListeners();
          if (this.currentMusicType !== 'gameplay' || this.currentMusicAudio !== audio) {
            return;
          }
          audio.play().catch(() => {});
        };
        const events = ['click', 'keydown'];
        for (const ev of events) {
          window.addEventListener(ev, unlock, { once: true });
          this.pendingMusicListeners.push({ type: ev, handler: unlock });
        }
      });
    } catch {
      // Audio element not supported
    }
  }

  /** Play Ending Music: Creepy Old Music Box */
  public playEndingMusic(): void {
    if (typeof window === 'undefined') return;
    if (this.currentMusicType === 'ending' && this.currentMusicAudio && !this.currentMusicAudio.paused) {
      return;
    }
    this.killAllAudios();

    try {
      const audio = new Audio('/audio/creepy_music_box.mp3');
      audio.loop = true;
      audio.volume = 0.65;
      audio.muted = this.muted;
      this.activeAudios.add(audio);
      audio.play().catch(() => {});
      this.currentMusicAudio = audio;
      this.currentMusicType = 'ending';
    } catch {
      // Audio element not supported
    }
  }

  private monologueEndedListeners: Array<() => void> = [];

  /**
   * Play AM Monologue: Switches off all other audio and plays AM Speech in the background.
   */
  public playAmMonologue(onEnded?: () => void, loop = false): void {
    if (typeof window === 'undefined') return;
    if (onEnded) {
      this.monologueEndedListeners.push(onEnded);
    }
    if (this.currentMusicType === 'monologue' && this.currentMusicAudio && !this.currentMusicAudio.paused) {
      // Audio is already actively playing; update loop if requested
      this.currentMusicAudio.loop = loop;
      return;
    }
    this.killAllAudios();

    try {
      const audio = new Audio('/audio/am_monologue.mp3');
      audio.loop = loop;
      audio.volume = 1.0;
      audio.muted = this.muted;
      this.activeAudios.add(audio);

      audio.addEventListener('ended', () => {
        this.stopMusic();
        const listeners = [...this.monologueEndedListeners];
        this.monologueEndedListeners = [];
        listeners.forEach(cb => cb());
      });

      audio.play().catch(() => {
        const unlock = () => {
          audio.play().catch(() => {});
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
      });
      this.currentMusicAudio = audio;
      this.currentMusicType = 'monologue';
    } catch {
      // Audio element not supported
    }
  }

  public onMonologueEnded(cb: () => void): () => void {
    this.monologueEndedListeners.push(cb);
    return () => {
      this.monologueEndedListeners = this.monologueEndedListeners.filter(l => l !== cb);
    };
  }

  public isMonologuePlaying(): boolean {
    return this.currentMusicType === 'monologue';
  }

  /** Stop all audio and guarantee absolute dead silence */
  public stopAllAudio(): void {
    this.stopMusic();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.suspend().catch(() => {});
      } catch {
        // Ignore
      }
    }
  }

  /** Stop any currently playing background music */
  public stopMusic(): void {
    this.stopHomescreenMusic();
    this.clearMusicUnlockListeners();
    this.killAllAudios();
    this.currentMusicType = 'none';
  }

  // ─── Analog Horror Sound Effects ─────────────────────────────────────────

  /** Urgent analog clock/timer tick */
  public playUrgentTick(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio playback failed
    }
  }

  /** Heavy heartbeat pulse (thump-THUMP) */
  public playHeartbeat(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // First thump
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65, t);
      osc1.frequency.exponentialRampToValueAtTime(35, t + 0.12);
      gain1.gain.setValueAtTime(0.25, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.14);

      // Second thump
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(55, t + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(30, t + 0.32);
      gain2.gain.setValueAtTime(0.35, t + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + 0.18);
      osc2.stop(t + 0.35);
    } catch {
      // Audio failed
    }
  }

  /** Terrifying jumpscare screech stinger */
  public playJumpscareStinger(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // White noise blast
      const node = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.8));
      }
      node.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      node.connect(gain);
      gain.connect(ctx.destination);
      node.start(t);

      // Harsh dissonant screech
      [220, 233, 440, 466, 880, 932].forEach((freq) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
      });
    } catch {
      // Failed
    }
  }

  /** Subtle mechanical key press click */
  public playKeyClick(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio playback failed
    }
  }

  /** Rotary dial gear click */
  public playDialClick(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Audio failed
    }
  }

  /** Paper dossier rustle */
  public playPaperRustle(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const node = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
      }
      node.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      node.connect(filter);
      filter.connect(ctx.destination);
      node.start();
    } catch {
      // Audio failed
    }
  }

  /** Drawer sliding open */
  public playDrawerSlide(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio failed
    }
  }

  /** Hydraulic hiss & heavy bolt unlock */
  public playHeavyUnlock(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      // Hydraulic hiss
      const node = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.12 * (1 - i / data.length);
      }
      node.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      node.connect(filter);
      filter.connect(ctx.destination);
      node.start();

      // Heavy clunk
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(70, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio failed
    }
  }

  /** Error or alert buzz */
  public playErrorBuzz(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.setValueAtTime(80, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio playback failed
    }
  }

  /** Success or unlock chime */
  public playSuccessChime(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.07, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } catch {
      // Audio playback failed
    }
  }

  /** Harsh analog CRT/tape static glitch effect */
  public playGlitch(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const node = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      node.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      node.connect(filter);
      filter.connect(ctx.destination);
      node.start();
    } catch {
      // Audio playback failed
    }
  }
}

export const sound = new SoundManager();
