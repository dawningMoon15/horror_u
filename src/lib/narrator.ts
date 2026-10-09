/**
 * narrator.ts — Interactive Voice Narrator for THE CONTEXT.
 *
 * Utilizes the browser's native Web Speech Synthesis API:
 * - 100% FREE with ZERO latency and ZERO network requests.
 * - Complies strictly with zero-server and zero-telemetry privacy requirements.
 * - Provides eerie, pitch-modulated voice transmission of room anomalies and clues,
 *   reducing text-heaviness and turning the game into an interactive audio experience.
 */

class HorrorNarrator {
  private enabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer deeper, darker-sounding English voices
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Daniel') ||
          v.name.includes('Fred') ||
          v.name.includes('Zarvox') ||
          v.name.includes('George') ||
          v.name.includes('Male'))
    );
    this.voice = preferred ?? voices.find((v) => v.lang.startsWith('en')) ?? null;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isNarratorEnabled(): boolean {
    return this.enabled;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) this.stop();
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.enabled || !this.isSupported() || !text.trim()) return;

    this.stop();

    const cleanText = text
      .replace(/>/g, '')
      .replace(/\/\//g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    // Deep, suspenseful psychological horror cadence
    utterance.pitch = 0.72;
    utterance.rate = 0.9;
    utterance.volume = 0.95;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const narrator = new HorrorNarrator();
