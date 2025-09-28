import React, { useState, useEffect, useCallback, useRef } from 'react';
import BlobVisualization, { BlobState } from './BlobVisualization';
import Footer from './Footer';
import LiveCaptions from './LiveCaptions';
import VideoInput from './VideoInput';
import SpeechService, { SupportedLanguage } from '../services/SpeechService';
import AIService from '../services/AIService';
import { handleAIRequest } from '../services/AIProxyService';
import FaviconService from '../services/FaviconService';

// Language display names and flags
const LANGUAGE_DISPLAY = {
  'en-US': { name: 'English', flag: '🇺🇸' },
  // 'hi-IN': { name: 'Hindi', flag: 'IN' },
};

const VoiceAssistant: React.FC = () => {
  // State for the blob visualization
  const [blobState, setBlobState] = useState<BlobState>('idle');
  const [amplitude, setAmplitude] = useState<number>(0.5);
  const [isClickMode, setIsClickMode] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en-US');
  const [showLanguageMenu, setShowLanguageMenu] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const hasGreeted = useRef<boolean>(false);

  // Get time-appropriate greeting in English
  const getTimeBasedGreeting = (): { text: string; language: SupportedLanguage } => {
    const hour = new Date().getHours();
    
    // Always use English for greeting
    const language: SupportedLanguage = 'en-US';
    
    // Morning greeting (5 AM - 12 PM)
    if (hour >= 5 && hour < 12) {
      return { 
        text: 'Good morning. I\'m Iris, your voice assistant.',
        language: 'en-US'
      };
    } 
    // Afternoon greeting (12 PM - 5 PM)
    else if (hour >= 12 && hour < 17) {
      return { 
        text: 'Good afternoon. I\'m Iris, your voice assistant.',
        language: 'en-US'
      };
    } 
    // Evening/Night greeting (5 PM - 5 AM)
    else {
      return { 
        text: 'Good evening. I\'m Iris, your voice assistant.',
        language: 'en-US'
      };
    }
  };

  // Update favicon when blob state changes
  const updateBlobState = useCallback((newState: BlobState) => {
    setBlobState(newState);
    FaviconService.updateState(newState);
  }, []);

  // Handle blob click to start/stop continuous listening
  const handleBlobClick = useCallback(() => {
    // If already in continuous mode, stop it
    if (SpeechService.isContinuousMode()) {
      SpeechService.setContinuousMode(false);
      SpeechService.stopListening();
      updateBlobState('idle');
      setIsProcessing(false);
      return;
    }
    
    // Clear previous captions when starting new session
    if ((window as any).liveCaptions) {
      (window as any).liveCaptions.clear();
    }
    
    // Always stop any current speech when the blob is clicked
    SpeechService.stopSpeaking();
    
    // Reset processing state
    setIsProcessing(false);
    
    // Enable continuous mode
    SpeechService.setContinuousMode(true);
    
    // Update blob to listening state
    updateBlobState('listening');
    
    // Start listening
    try {
      SpeechService.startListening();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      updateBlobState('idle');
      SpeechService.setContinuousMode(false);
    }
  }, [updateBlobState]);

  // Handle hotword detection (keeping for backward compatibility)
  const handleHotwordDetected = useCallback(() => {
    if (isProcessing) return;
    
    // Hotword detected! Listening for query...
    updateBlobState('listening');
    setIsClickMode(false);
  }, [isProcessing, updateBlobState]);

  // Handle speech start (for user and assistant)
  const handleSpeechStart = useCallback(() => {
    updateBlobState('speaking');
    setAmplitude(0.8);
  }, [updateBlobState]);

  // Handle speech end
  const handleSpeechEnd = useCallback(() => {
    // Speech ended callback
    // If continuous mode is active, stay in listening state, otherwise go to idle
    if (SpeechService.isContinuousMode()) {
      updateBlobState('listening');
    } else {
      updateBlobState('idle');
    }
    setAmplitude(0.5);
    
    // Wait a bit to set processing to false to prevent race conditions
    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  }, [updateBlobState]);

  // Handle voice commands for language switching
  const handleLanguageCommand = useCallback((text: string, currentLanguage: SupportedLanguage) => {
    const lowerText = text.toLowerCase();
    
    // Handle language switching commands
    if ((currentLanguage === 'en-US' && lowerText.includes('speak hindi')) ||
        (currentLanguage === 'en-US' && lowerText.includes('switch to hindi'))) {
      SpeechService.setLanguage('hi-IN');
      SpeechService.speak('हिंदी में बदल गया', 'hi-IN');
      return true;
    }
    else if ((currentLanguage === 'hi-IN' && lowerText.includes('अंग्रेजी बोलो')) ||
             (currentLanguage === 'hi-IN' && lowerText.includes('speak english'))) {
      SpeechService.setLanguage('en-US');
      SpeechService.speak('Switched to English', 'en-US');
      return true;
    }
    
    return false;
  }, []);

  // Process the speech recognition result
  const handleSpeechResult = useCallback(async ({ text, language }) => {
    // Prevent processing if we're already handling a request
    if (isProcessing) {
      return;
    }
    
    // If text is too short, ignore it (likely noise)
    if (text.trim().length < 2) {
      return;
    }
    
    // Set processing state
    setIsProcessing(true);
    SpeechService.setProcessing(true);
    
    // Process query with AI
    try {
      updateBlobState('responding');
      
      // Determine the appropriate system message based on current language
      let systemMessage = '';
      if (currentLanguage === 'hi-IN') {
        systemMessage = 'आप एक बुद्धिमान व्यक्तिगत सहायक हैं जिसका नाम इरिस है। बिना परिचय और बिना स्पष्टीकरण प्रश्न पूछे सीधे प्रश्नों का उत्तर दें। संक्षिप्त और सटीक रहें। उपयोगकर्ता से न पूछें कि वे क्या चाहते हैं - बस उनके प्रश्न का सीधा उत्तर दें।';
      } else {
        systemMessage = 'You are an intelligent personal assistant named Iris. Answer questions directly without introductions or asking clarifying questions back. Be concise and accurate. Do not ask the user what they want - simply provide a direct answer to their query.';
      }
      
      // Call the AI service with the current language
      const aiResponse = await handleAIRequest({
        query: text,
        language: currentLanguage,
        systemMessage
      });
      
      // Speak the AI response
      if (aiResponse && aiResponse.responseText) {
        SpeechService.speak(aiResponse.responseText, currentLanguage);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      
      // Provide error feedback in current language
      const errorMessage = currentLanguage === 'hi-IN'
        ? 'क्षमा करें, एक त्रुटि हुई है। कृपया अपना इंटरनेट कनेक्शन जांचें और फिर से कोशिश करें।'
        : 'Sorry, there was an error. Please check your internet connection and try again.';
      
      SpeechService.speak(errorMessage, currentLanguage);
    } finally {
      setIsProcessing(false);
      SpeechService.setProcessing(false);
      
      // In continuous mode, go back to listening after response
      if (SpeechService.isContinuousMode()) {
        updateBlobState('listening');
      } else {
        updateBlobState('idle');
      }
    }
  }, [handleLanguageCommand, isProcessing, updateBlobState, currentLanguage]);

  // Initialize speech service and favicon
  useEffect(() => {
    // Initialize the favicon service
    FaviconService.initialize();
    
    // Set up event listeners
    SpeechService.onSpeechStart(handleSpeechStart);
    SpeechService.onSpeechEnd(handleSpeechEnd);
    SpeechService.onResult(handleSpeechResult);
    SpeechService.onError((error) => {
      updateBlobState('idle');
      setIsProcessing(false);
    });

    // Show greeting only once when component mounts
    if (!hasGreeted.current) {
      const greeting = getTimeBasedGreeting();
      
      // Wait for voices to load before speaking
      const loadVoicesAndGreet = async () => {
        // Wait for voices to load
        if (window.speechSynthesis.getVoices().length === 0) {
          await new Promise(resolve => {
            window.speechSynthesis.onvoiceschanged = resolve;
          });
        }
        
        // Initial greeting after voices are loaded
        updateBlobState('responding');
        await SpeechService.speak(greeting.text, greeting.language);
        hasGreeted.current = true;
        
        // Reset to idle state after greeting
        setTimeout(() => {
          updateBlobState('idle');
          setIsProcessing(false);
        }, 500);
      };

      // Start loading voices and greeting after a delay
      const timer = setTimeout(() => {
        loadVoicesAndGreet();
      }, 2000);

      return () => clearTimeout(timer);
    }
    
    return () => {
      // Cleanup
      SpeechService.stopListening();
      SpeechService.stopSpeaking();
    };
  }, [handleSpeechStart, handleSpeechEnd, handleSpeechResult, updateBlobState]);

  // Subscribe to language changes from SpeechService
  useEffect(() => {
    const handleLanguageChange = (newLanguage: SupportedLanguage) => {
      setCurrentLanguage(newLanguage);
    };
    
    // Add event listener for language changes
    const originalSetLanguage = SpeechService.setLanguage;
    SpeechService.setLanguage = (language: SupportedLanguage) => {
      originalSetLanguage.call(SpeechService, language);
      handleLanguageChange(language);
    };
    
    // Initialize with English as default language
    const currentLang = SpeechService.getCurrentLanguage();
    if (currentLang !== 'en-US') {
      SpeechService.setLanguage('en-US');
    } else {
      setCurrentLanguage('en-US');
    }

    // Cleanup
    return () => {
      SpeechService.setLanguage = originalSetLanguage;
    };
  }, []);

  // Language selector click handler
  const handleLanguageClick = useCallback(() => {
    setShowLanguageMenu(prev => !prev);
  }, []);

  // Handle language selection
  const handleLanguageSelect = useCallback((language: SupportedLanguage) => {
    SpeechService.setLanguage(language);
    setCurrentLanguage(language);
    setShowLanguageMenu(false);
    
    // Provide feedback for language change
    const messages = {
      'en-US': 'Switched to English',
      'ar-LB': 'تم التحويل إلى اللغة العربية',
      'fr-FR': 'Passé au français',
    };
    
    SpeechService.speak(messages[language], language);
  }, []);

  return (
    <div className="voice-assistant">
      {/* Continuous mode indicator */}
      {SpeechService.isContinuousMode() && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center bg-green-600/80 hover:bg-green-500/80 px-3 py-2 rounded-full text-sm shadow-lg transition-all duration-300 ease-in-out border border-green-500/50">
            <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
            <span className="text-white font-medium hidden sm:inline">Continuous Listening</span>
            <span className="text-white font-medium sm:hidden">Listening</span>
          </div>
        </div>
      )}
      
      {/* Captions and video toggles */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <button 
          onClick={() => setShowCaptions(!showCaptions)}
          className={`flex items-center px-3 py-2 rounded-full text-sm shadow-lg transition-all duration-300 ease-in-out border ${
            showCaptions 
              ? 'bg-blue-600/80 hover:bg-blue-500/80 border-blue-500/50 text-white' 
              : 'bg-gray-800/80 hover:bg-gray-700/80 border-gray-600/50 text-gray-300'
          }`}
          title={showCaptions ? 'Hide Captions' : 'Show Captions'}
        >
          <span className="mr-1">💬</span>
          {showCaptions ? 'CC On' : 'CC Off'}
        </button>
        
        <button 
          onClick={() => setShowVideo(!showVideo)}
          className={`flex items-center px-3 py-2 rounded-full text-sm shadow-lg transition-all duration-300 ease-in-out border ${
            showVideo 
              ? 'bg-green-600/80 hover:bg-green-500/80 border-green-500/50 text-white' 
              : 'bg-gray-800/80 hover:bg-gray-700/80 border-gray-600/50 text-gray-300'
          }`}
          title={showVideo ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          <span className="mr-1">📹</span>
          {showVideo ? 'Camera On' : 'Camera Off'}
        </button>
      </div>
      
      {/* Language selector */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={handleLanguageClick}
          className="flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/80 p-3 rounded-full text-lg shadow-lg transition-all duration-300 ease-in-out border border-purple-500/50 hover:border-purple-400"
          title={`Current language: ${LANGUAGE_DISPLAY[currentLanguage].name}`}
        >
          <span className="text-2xl">{LANGUAGE_DISPLAY[currentLanguage].flag}</span>
        </button>
        
        {showLanguageMenu && (
          <div className="absolute top-full mt-2 right-0 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-700/50 transition-all duration-300 ease-in-out">
            {Object.entries(LANGUAGE_DISPLAY).map(([langCode, langInfo]) => (
              <button
                key={langCode}
                onClick={() => handleLanguageSelect(langCode as SupportedLanguage)}
                className={`flex items-center w-full px-4 py-3 text-left text-white hover:bg-gray-700/80 transition-all duration-300 ease-in-out
                           ${currentLanguage === langCode ? 'bg-gray-900/80 font-medium border-l-2 border-purple-500/70' : ''}`}
              >
                <span className="mr-3 text-2xl">{langInfo.flag}</span>
                <span className="text-lg">{langInfo.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        {/* Empty space on the left to balance layout */}
        <div className="hidden md:block w-1/3"></div>
        
        {/* Blob visualization in the center */}
        <div className="flex-1 flex items-center justify-center">
          <BlobVisualization 
            state={blobState} 
            amplitude={amplitude} 
            onClick={handleBlobClick}
          />
        </div>
        
        {/* Video input on the right side (hidden on mobile) */}
        <div className={`hidden md:flex w-1/3 pt-[300px] px-10 ${showVideo ? 'visible' : 'invisible'}`}>
          {showVideo && <VideoInput isEnabled={showVideo} />}
        </div>
      </div>
      
      {/* Video display for mobile - shown below blob when active */}
      <div className="md:hidden mt-4 flex justify-center px-4 w-full">
        {showVideo && <VideoInput isEnabled={showVideo} />}
      </div>
      
      <LiveCaptions isVisible={showCaptions} />
      
      <Footer blobState={blobState} />
    </div>
  );
};

export default VoiceAssistant;
