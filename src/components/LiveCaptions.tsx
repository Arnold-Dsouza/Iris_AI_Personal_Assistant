import React, { useState, useEffect } from 'react';

interface LiveCaptionsProps {
  isVisible: boolean;
}

const LiveCaptions: React.FC<LiveCaptionsProps> = ({ isVisible }) => {
  const [currentUserText, setCurrentUserText] = useState<string>('');
  const [currentAssistantText, setCurrentAssistantText] = useState<string>('');
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string>('');

  // Expose functions to the window for SpeechService to call
  useEffect(() => {
    (window as any).liveCaptions = {
      showUserSpeech: (text: string, isFinal: boolean) => {
        if (isFinal) {
          // Store final user message and clear current
          setLastUserMessage(text);
          setCurrentUserText('');
        } else {
          // Show interim user text
          setCurrentUserText(text);
        }
      },
      
      showAssistantSpeech: (text: string, isActive: boolean) => {
        if (isActive) {
          // Show current assistant speaking
          setCurrentAssistantText(text);
        } else {
          // Store final assistant message and clear current
          setLastAssistantMessage(text);
          setCurrentAssistantText('');
        }
      },
      
      clear: () => {
        setCurrentUserText('');
        setCurrentAssistantText('');
        setLastUserMessage('');
        setLastAssistantMessage('');
      }
    };

    return () => {
      delete (window as any).liveCaptions;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto z-40">
      <div className="bg-black/80 backdrop-blur-md rounded-lg border border-gray-700/50">
        
        {/* Last completed user message */}
        {lastUserMessage && !currentUserText && (
          <div className="p-3 border-b border-gray-700/30 text-blue-300/60">
            <div className="flex items-start space-x-2">
              <span className="text-xs text-gray-500 mt-1 flex-shrink-0">
                👤 You:
              </span>
              <p className="text-sm leading-relaxed">{lastUserMessage}</p>
            </div>
          </div>
        )}
        
        {/* Current user speech (interim) */}
        {currentUserText && (
          <div className="p-3 border-b border-gray-700/30 text-blue-300">
            <div className="flex items-start space-x-2">
              <span className="text-xs text-gray-400 mt-1 flex-shrink-0">
                👤 You:
              </span>
              <p className="text-sm leading-relaxed">{currentUserText}...</p>
            </div>
          </div>
        )}
        
        {/* Last completed assistant message */}
        {lastAssistantMessage && !currentAssistantText && (
          <div className="p-3 border-b border-gray-700/30 text-green-300/60">
            <div className="flex items-start space-x-2">
              <span className="text-xs text-gray-500 mt-1 flex-shrink-0">
                🤖 Iris:
              </span>
              <p className="text-sm leading-relaxed">{lastAssistantMessage}</p>
            </div>
          </div>
        )}
        
        {/* Current assistant speech */}
        {currentAssistantText && (
          <div className="p-3 text-green-300">
            <div className="flex items-start space-x-2">
              <span className="text-xs text-gray-400 mt-1 flex-shrink-0">
                🤖 Iris:
              </span>
              <p className="text-sm leading-relaxed">{currentAssistantText}</p>
              <div className="flex space-x-1 ml-2 mt-1">
                <div className="w-1 h-1 bg-green-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {!currentUserText && !currentAssistantText && !lastUserMessage && !lastAssistantMessage && (
          <div className="p-4 text-center text-gray-400 text-sm">
            Live captions will appear here...
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCaptions;
