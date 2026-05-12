// ARIO — AI Voice Engine for STUDO Spatial OS
// Tony Stark FRIDAY-style voice assistant

export type ArioState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface ArioCallbacks {
  onStateChange?: (state: ArioState) => void;
  onSpeakStart?: (text: string) => void;
  onSpeakEnd?: () => void;
}

class ArioEngine {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private queue: string[] = [];
  private isSpeaking = false;
  private callbacks: ArioCallbacks = {};
  private _state: ArioState = 'idle';

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    // Prefer Google US English voices (best quality in browser)
    this.selectedVoice =
      this.voices.find((v) => v.name === 'Google US English') ||
      this.voices.find((v) => v.name.includes('Google') && v.lang === 'en-US') ||
      this.voices.find((v) => v.lang === 'en-US') ||
      this.voices.find((v) => v.lang.startsWith('en')) ||
      null;
  }

  private setState(state: ArioState) {
    this._state = state;
    this.callbacks.onStateChange?.(state);
  }

  getState(): ArioState {
    return this._state;
  }

  onCallbacks(callbacks: ArioCallbacks) {
    this.callbacks = callbacks;
  }

  // Speak text — priority=true interrupts current speech
  speak(text: string, priority = false) {
    // Clean text: remove markdown, LaTeX, special chars for speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\$[^$]+\$/g, '') // remove LaTeX
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) return;

    if (priority) {
      this.synth.cancel();
      this.queue = [];
      this.isSpeaking = false;
    }

    this.queue.push(cleanText);
    if (!this.isSpeaking) this.processQueue();
  }

  private processQueue() {
    if (this.queue.length === 0) {
      this.isSpeaking = false;
      this.setState('idle');
      this.callbacks.onSpeakEnd?.();
      return;
    }

    this.isSpeaking = true;
    const text = this.queue.shift()!;
    this.setState('speaking');
    this.callbacks.onSpeakStart?.(text);

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.rate = 0.92;
    utterance.pitch = 0.95;
    utterance.volume = 1.0;

    utterance.onend = () => this.processQueue();
    utterance.onerror = () => this.processQueue();

    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
    this.queue = [];
    this.isSpeaking = false;
    this.setState('idle');
    this.callbacks.onSpeakEnd?.();
  }

  getVoices() {
    return this.voices.filter((v) => v.lang.startsWith('en'));
  }

  setVoice(name: string) {
    const voice = this.voices.find((v) => v.name === name);
    if (voice) this.selectedVoice = voice;
  }

  // ARIO greeting messages by context
  greet() {
    this.speak(
      'ARIO online. Holographic systems ready. What would you like to explore today?',
      true
    );
  }

  announceHologram(subject: string) {
    this.speak(`Loading holographic model for ${subject}.`, false);
  }

  announceComponent(name: string, detail: string) {
    this.speak(`${name}. ${detail}`, false);
  }

  announceError(msg: string) {
    this.speak(`System alert. ${msg}`, true);
  }
}

export const ario = new ArioEngine();
