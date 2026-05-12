// ARIO — AI Voice Engine for STUDO Spatial OS
// Tony Stark FRIDAY-style voice assistant (Edge TTS Backend)

export type ArioState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface ArioCallbacks {
  onStateChange?: (state: ArioState) => void;
  onSpeakStart?: (text: string) => void;
  onSpeakEnd?: () => void;
}

class ArioEngine {
  private queue: string[] = [];
  private isSpeaking = false;
  private callbacks: ArioCallbacks = {};
  private _state: ArioState = 'idle';
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {}

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

  // Play audio directly from base64 (used by ario_chat)
  playBase64(base64Audio: string, text: string) {
    this.stop();
    
    this.isSpeaking = true;
    this.setState('speaking');
    this.callbacks.onSpeakStart?.(text);
    
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
    this.currentAudio = new Audio(audioUrl);
    
    this.currentAudio.onended = () => {
      this.isSpeaking = false;
      this.setState('idle');
      this.callbacks.onSpeakEnd?.();
    };
    
    this.currentAudio.play().catch(e => {
      console.error("Audio playback error:", e);
      this.isSpeaking = false;
      this.setState('idle');
      this.callbacks.onSpeakEnd?.();
    });
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
      this.stop();
    }

    this.queue.push(cleanText);
    if (!this.isSpeaking) this.processQueue();
  }

  private async processQueue() {
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

    try {
      const url = `${import.meta.env.VITE_WS_URL || 'http://localhost:8000'}/api/tts?text=${encodeURIComponent(text)}`;
      this.currentAudio = new Audio(url);
      
      this.currentAudio.onended = () => this.processQueue();
      this.currentAudio.onerror = () => this.processQueue();
      
      await this.currentAudio.play();
    } catch (e) {
      console.error('Failed to play ARIO audio:', e);
      this.processQueue(); // skip to next
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.queue = [];
    this.isSpeaking = false;
    this.setState('idle');
    this.callbacks.onSpeakEnd?.();
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
