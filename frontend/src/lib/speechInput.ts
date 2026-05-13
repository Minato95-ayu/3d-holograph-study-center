// Speech Input Engine — "Hey ARIO" detection and Action Commands

type SpeechCallback = (transcript: string, isFinal: boolean) => void;
type QueryCallback = (query: string) => void;
type CommandCallback = (command: 'explode' | 'assemble' | 'stop_talking') => void;

class SpeechInputEngine {
  private recognition: any = null;
  private isListening = false;
  private wakeWord: string;
  private supported: boolean;

  public onTranscript: SpeechCallback | null = null;
  public onWakeWord: (() => void) | null = null;
  public onQuery: QueryCallback | null = null;
  public onChat: ((text: string) => void) | null = null;
  public onCommand: CommandCallback | null = null;
  public onError: ((msg: string) => void) | null = null;
  public onStatusChange: ((listening: boolean) => void) | null = null;

  constructor(wakeWord = 'ario') {
    this.wakeWord = wakeWord.toLowerCase();
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    this.supported = !!SR;

    if (!this.supported) {
      console.warn('⚠️ Speech Recognition not supported in this browser.');
      return;
    }

    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.toLowerCase().trim();
      const isFinal = result.isFinal;

      this.onTranscript?.(transcript, isFinal);

      if (isFinal) {
        this.processTranscript(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return; // normal silence
      if (event.error === 'aborted') return; // intentional stop
      console.error('🎤 Speech error:', event.error);
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      // Auto-restart if still should be listening
      if (this.isListening) {
        setTimeout(() => {
          try {
            this.recognition?.start();
          } catch (_) {}
        }, 300);
      }
    };
  }

  private processTranscript(transcript: string) {
    // Also accept 'hello' as a wake word just in case they don't say Ario
    const wakeWords = [this.wakeWord, 'areo', 'mario', 'audio', 'jarvis', 'computer', 'hello'];
    const foundWakeWord = wakeWords.find(w => transcript.includes(w));

    if (foundWakeWord) {
      this.onWakeWord?.();
      
      const textAfterWake = transcript.split(foundWakeWord)[1]?.trim() || '';
      console.log(`🤖 ARIO activated via '${foundWakeWord}'! Heard: "${textAfterWake}"`);

      // 1. Check for Action Commands
      if (textAfterWake.includes('explode') || textAfterWake.includes('open model') || textAfterWake.includes('kholo')) {
        this.onCommand?.('explode');
        return;
      }
      if (textAfterWake.includes('assemble') || textAfterWake.includes('close model') || textAfterWake.includes('reset') || textAfterWake.includes('band karo')) {
        this.onCommand?.('assemble');
        return;
      }
      if (textAfterWake.includes('stop') || textAfterWake.includes('quiet') || textAfterWake.includes('chup')) {
        this.onCommand?.('stop_talking');
        return;
      }

      // 2. Otherwise, check if it's a Search Query or General Chat
      const searchRegex = new RegExp(
        `^(show me|tell me about|explain|load|what is|dikhao|batao|search for)\\s+(.+)`,
        'i'
      );
      
      const match = textAfterWake.match(searchRegex);
      if (match && match[2]) {
        // It's a search query
        this.onQuery?.(match[2].trim());
      } else if (textAfterWake.length > 1) {
        // It's a conversational chat
        this.onChat?.(textAfterWake);
      } else {
        // If they just said "Hello" or "Ario" with nothing else
        this.onChat?.("Hello ARIO");
      }
    }
  }

  get isSupported() {
    return this.supported;
  }

  get active() {
    return this.isListening;
  }

  start() {
    if (!this.supported) {
      alert("❌ Speech Recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    if (this.isListening) return;
    
    try {
      this.isListening = true;
      this.recognition.start();
      this.onStatusChange?.(true);
      console.log('🎤 ARIO listening for wake word "Hey ARIO"...');
    } catch (e: any) {
      console.error('Speech start error:', e);
      alert(`❌ Microphone error: ${e.message || 'Check browser permissions'}`);
      this.isListening = false;
      this.onStatusChange?.(false);
    }
  }

  stop() {
    if (!this.supported) return;
    this.isListening = false;
    try {
      this.recognition.stop();
    } catch (_) {}
    this.onStatusChange?.(false);
  }

  toggle() {
    if (!this.supported) {
      alert("❌ Speech Recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }
}

export const speechInput = new SpeechInputEngine('ario');
