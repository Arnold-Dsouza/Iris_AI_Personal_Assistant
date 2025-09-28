export type SupportedLanguage = 'en-US' | 'hi-IN';

interface SpeechRecognitionResult {
  text: string;
  language: SupportedLanguage;
}

interface SpeechServiceState {
  isListening: boolean;
  recognizedLanguage: SupportedLanguage;
  continuousMode: boolean;
  isProcessing: boolean;
}

class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private state: SpeechServiceState = {
    isListening: false,
    recognizedLanguage: 'en-US',
    continuousMode: false,
    isProcessing: false,
  };
  
  // Event callbacks
  private onSpeechStartCallback: (() => void) | null = null;
  private onSpeechEndCallback: (() => void) | null = null;
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private startListeningTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported by this browser');
      alert('Speech recognition is not supported by your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognitionAPI = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.state.recognizedLanguage;
    
    this.synthesis = window.speechSynthesis;

    this.setupRecognitionEvents();
  }

  private setupRecognitionEvents() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('Recognition started');
      this.state.isListening = true;
    };

    this.recognition.onend = () => {
      console.log('Recognition ended, continuous mode:', this.state.continuousMode, 'processing:', this.state.isProcessing);
      this.state.isListening = false;
      
      if (this.startListeningTimeout) {
        clearTimeout(this.startListeningTimeout);
        this.startListeningTimeout = null;
      }
      
      // If we're in continuous mode and not currently processing a response, restart listening
      if (this.state.continuousMode && !this.state.isProcessing) {
        console.log('Restarting listening in continuous mode...');
        this.startListeningTimeout = setTimeout(() => {
          this.startListeningInternal();
        }, 1000); // Small delay before restarting
      }
    };

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      
      // Send to live captions
      if ((window as any).liveCaptions) {
        (window as any).liveCaptions.showUserSpeech(transcript, result.isFinal);
      }

      if (!result.isFinal) {
        if (this.onSpeechStartCallback) {
          this.onSpeechStartCallback();
        }
      }
      else {
        if (this.onSpeechEndCallback) {
          this.onSpeechEndCallback();
        }
        
        if (this.onResultCallback) {
          this.onResultCallback({
            text: transcript.toLowerCase(),
            language: this.state.recognizedLanguage
          });
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
      
      this.state.isListening = false;
      
      if (this.startListeningTimeout) {
        clearTimeout(this.startListeningTimeout);
        this.startListeningTimeout = null;
      }
    };
  }

  public startListening() {
    console.log('startListening called');
    if (!this.recognition) {
      console.error('No speech recognition available');
      return;
    }
    
    if (this.startListeningTimeout) {
      clearTimeout(this.startListeningTimeout);
      this.startListeningTimeout = null;
    }
    
    if (this.state.isListening) {
      console.log('Already listening, stopping first...');
      this.stopListening();
      this.startListeningTimeout = setTimeout(() => {
        this.startListeningInternal();
      }, 250);
      return;
    }
    
    console.log('Starting listening immediately');
    this.startListeningInternal();
  }

  private startListeningInternal() {
    console.log('startListeningInternal called, isListening:', this.state.isListening);
    if (!this.recognition || this.state.isListening) return;
    
    try {
      console.log('Calling recognition.start()...');
      this.recognition.start();
      console.log('Recognition.start() called successfully');
    } catch (error) {
      console.error('Error starting recognition:', error);
      this.state.isListening = false;
      
      if (this.onErrorCallback) {
        this.onErrorCallback('Failed to start recognition');
      }
    }
  }

  public stopListening() {
    if (!this.recognition) return;
    
    if (this.startListeningTimeout) {
      clearTimeout(this.startListeningTimeout);
      this.startListeningTimeout = null;
    }
    
    try {
      if (this.state.isListening) {
        this.recognition.stop();
      }
    } catch (error) {
      console.error('Error stopping recognition:', error);
      this.state.isListening = false;
    }
  }

  public speak(text: string, language: SupportedLanguage) {
    if (!this.synthesis) return;
    
    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    // Get voices and wait if they're not loaded yet
    let voices = this.synthesis.getVoices();
    if (voices.length === 0) {
      return new Promise((resolve) => {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = this.synthesis.getVoices();
          this.setVoiceAndSpeak(utterance, voices, language);
          resolve(null);
        };
      });
    } else {
      this.setVoiceAndSpeak(utterance, voices, language);
    }
  }

  private setVoiceAndSpeak(utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[], language: SupportedLanguage) {
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    
    // Preferred voice names for each language
    const preferredVoices = {
      'en-US': ['Google US English Female', 'Google US English', 'en-US-Standard-F'],
      'ar-LB': [
        'Laila', 'Microsoft Hoda', 'ar-XA-Standard-A', 
        'Microsoft Amira', 'Arabic Female', 'Fatima',
        'Google العربية', // Moved Google Arabic higher in priority for Chrome
        'Amina', 'Salma', 'Noura',
        'Microsoft Naayf',
        'Microsoft Ali'
      ],
      'fr-FR': ['Amélie', 'Google français Female', 'Microsoft Julie', 'Audrey', 'Marie', 'Jolie', 'fr-FR-Standard-A', 'fr-FR-Standard-C']
    };

    // Map of language fallbacks for voice selection
    const languageFallbacks = {
      'ar-LB': ['ar', 'ar-SA', 'ar-EG', 'ar-*'], // Simplified Arabic fallbacks
      'fr-FR': ['fr-CA', 'fr', 'fr-*'],
      'en-US': ['en-GB', 'en', 'en-*']
    };

    let selectedVoice: SpeechSynthesisVoice | null = null;

    // Function to check if a voice matches a language code
    const matchesLanguage = (voice: SpeechSynthesisVoice, langCode: string): boolean => {
      if (langCode.endsWith('*')) {
        const prefix = langCode.slice(0, -1);
        return voice.lang.startsWith(prefix);
      }
      return voice.lang === langCode || voice.lang.startsWith(langCode + '-');
    };

    // Try to find preferred voice first
    selectedVoice = voices.find(voice => 
      preferredVoices[language].some(preferred => 
        voice.name.includes(preferred)
      )
    );

    // If no preferred voice, try to find any voice for the language or its fallbacks
    if (!selectedVoice) {
      // Try exact language first
      selectedVoice = voices.find(voice => matchesLanguage(voice, language));

      // If no voice found, try fallbacks
      if (!selectedVoice && languageFallbacks[language]) {
        for (const fallbackLang of languageFallbacks[language]) {
          // Try to find any voice that matches the fallback language
          selectedVoice = voices.find(voice => matchesLanguage(voice, fallbackLang));
          if (selectedVoice) break;
        }
      }

      // Special case for Hindi: if still no voice, try any Hindi voice
      if (!selectedVoice && language === 'hi-IN') {
        selectedVoice = voices.find(voice => voice.lang.startsWith('hi'));
      }
    }

    // If still no voice found, try Google voices as a last resort
    if (!selectedVoice) {
      const googleVoiceMap = {
        'hi-IN': 'Google हिन्दी',
        'en-US': 'Google US English'
      };
      
      selectedVoice = voices.find(voice => voice.name.includes(googleVoiceMap[language]));
    }

    if (selectedVoice) {
      console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
      utterance.voice = selectedVoice;
      
      // Set the language to match the selected voice's exact language
      utterance.lang = selectedVoice.lang;
    } else {
      console.warn('No suitable voice found for language:', language);
      // Use default system voice as last resort with the generic language code
      utterance.lang = language.split('-')[0];
    }

    // Adjust voice parameters based on language and selected voice
    switch (language) {
      case 'hi-IN':
        utterance.pitch = selectedVoice?.name.toLowerCase().includes('male') ? 1.2 : 1.1;
        utterance.rate = 0.9; // Slightly slower for Hindi clarity
        utterance.volume = 1.0; // Ensure full volume
        break;
      case 'en-US':
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        break;
    }

    // If the selected voice seems to be male, adjust pitch
    if (selectedVoice && 
        (selectedVoice.name.toLowerCase().includes('male') || 
         selectedVoice.name.toLowerCase().includes('thomas') ||
         selectedVoice.name.toLowerCase().includes('nicolas') ||
         selectedVoice.name.toLowerCase().includes('jean') ||
         selectedVoice.name.toLowerCase().includes('ravi') ||
         selectedVoice.name.toLowerCase().includes('amit'))) {
      utterance.pitch *= language === 'hi-IN' ? 1.3 : 1.2;
    }

    utterance.onstart = () => {
      // Temporarily stop listening while speaking to avoid feedback
      if (this.state.isListening) {
        this.stopListening();
      }
      
      // Send to live captions
      if ((window as any).liveCaptions) {
        (window as any).liveCaptions.showAssistantSpeech(utterance.text, true);
      }
      
      if (this.onSpeechStartCallback) {
        this.onSpeechStartCallback();
      }
    };
    
    utterance.onend = () => {
      // Send final caption
      if ((window as any).liveCaptions) {
        (window as any).liveCaptions.showAssistantSpeech(utterance.text, false);
      }
      
      if (this.onSpeechEndCallback) {
        this.onSpeechEndCallback();
      }
      
      // Resume listening after speech ends if in continuous mode and not processing
      if (this.state.continuousMode && !this.state.isProcessing) {
        this.startListeningTimeout = setTimeout(() => {
          this.startListeningInternal();
        }, 500); // Short delay after speech ends
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      // If we get a not-allowed error, try to get user interaction
      if (event.error === 'not-allowed') {
        console.warn('Speech synthesis not allowed. Requesting user interaction...');
      }
    };
    
    // Add a small delay before speaking to ensure proper initialization
    setTimeout(() => {
      try {
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        // Resume synthesis if it's paused
        if (this.synthesis.paused) {
          this.synthesis.resume();
        }
        
        // Clear any pending timeouts
        if (this.startListeningTimeout) {
          clearTimeout(this.startListeningTimeout);
        }
        
        // Speak with a small delay to ensure proper voice loading
        setTimeout(() => {
          this.synthesis.speak(utterance);
        }, 50);
      } catch (error) {
        console.error('Error speaking:', error);
      }
    }, 100);
  }

  public onSpeechStart(callback: () => void) {
    this.onSpeechStartCallback = callback;
  }
  
  public onSpeechEnd(callback: () => void) {
    this.onSpeechEndCallback = callback;
  }
  
  public onResult(callback: (result: SpeechRecognitionResult) => void) {
    this.onResultCallback = callback;
  }
  
  public onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }
  
  public setLanguage(language: SupportedLanguage) {
    this.state.recognizedLanguage = language;
    
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }
  
  public setContinuousMode(enabled: boolean) {
    this.state.continuousMode = enabled;
    
    if (!enabled) {
      // Stop listening if continuous mode is disabled
      this.stopListening();
    }
  }
  
  public setProcessing(isProcessing: boolean) {
    this.state.isProcessing = isProcessing;
    
    // If we finished processing and we're in continuous mode, restart listening
    if (!isProcessing && this.state.continuousMode && !this.state.isListening) {
      this.startListeningTimeout = setTimeout(() => {
        this.startListeningInternal();
      }, 1500); // Wait a bit longer after AI response
    }
  }
  
  public isContinuousMode(): boolean {
    return this.state.continuousMode;
  }
  
  public isProcessing(): boolean {
    return this.state.isProcessing;
  }
  
  public getCurrentLanguage(): SupportedLanguage {
    return this.state.recognizedLanguage;
  }

  public stopSpeaking() {
    if (!this.synthesis) return;
    this.synthesis.cancel();
  }
}

export default new SpeechService();
