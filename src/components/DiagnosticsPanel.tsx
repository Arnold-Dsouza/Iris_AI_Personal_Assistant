import React, { useEffect, useState } from 'react';

interface BrowserCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  mediaDevices: boolean;
  isSecureContext: boolean;
  protocol: string;
}

const DiagnosticsPanel: React.FC = () => {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkCapabilities = async () => {
      const caps: BrowserCapabilities = {
        speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        speechSynthesis: 'speechSynthesis' in window,
        mediaDevices: 'mediaDevices' in navigator,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol
      };

      setCapabilities(caps);

      // Check microphone permission
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionStatus(permission.state);
        } catch (error) {
          console.log('Permission query not supported');
        }
      }
    };

    checkCapabilities();
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      alert('Microphone permission granted! Try using the voice assistant now.');
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionStatus('denied');
    }
  };

  if (!capabilities) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button 
          className="flex items-center justify-center w-10 h-10 bg-gray-800/80 hover:bg-gray-700/80 rounded-full text-white shadow-lg transition-all duration-300 ease-in-out border border-gray-600/50"
          disabled
        >
          <span className="text-lg">⏳</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-16 z-50">
      {/* Info Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-gray-800/80 hover:bg-gray-700/80 rounded-full text-white shadow-lg transition-all duration-300 ease-in-out border border-gray-600/50 hover:border-blue-500/50"
        title="Browser Diagnostics"
      >
        <span className="text-lg">ℹ️</span>
      </button>

      {/* Diagnostics Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-lg shadow-xl border border-gray-700/50 max-w-sm w-80 md:w-96 transform -translate-x-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="mr-2">🔍</span>
              Browser Diagnostics
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Speech Recognition:</span>
              <span className={capabilities.speechRecognition ? 'text-green-400' : 'text-red-400'}>
                {capabilities.speechRecognition ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Speech Synthesis:</span>
              <span className={capabilities.speechSynthesis ? 'text-green-400' : 'text-red-400'}>
                {capabilities.speechSynthesis ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Media Devices:</span>
              <span className={capabilities.mediaDevices ? 'text-green-400' : 'text-red-400'}>
                {capabilities.mediaDevices ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Secure Context:</span>
              <span className={capabilities.isSecureContext ? 'text-green-400' : 'text-red-400'}>
                {capabilities.isSecureContext ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Protocol:</span>
              <span className="text-blue-400">{capabilities.protocol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Microphone Permission:</span>
              <span className={
                permissionStatus === 'granted' ? 'text-green-400' : 
                permissionStatus === 'denied' ? 'text-red-400' : 'text-yellow-400'
              }>
                {permissionStatus}
              </span>
            </div>
          </div>
          
          {permissionStatus !== 'granted' && (
            <button 
              onClick={requestMicrophonePermission}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm font-medium"
            >
              Request Microphone Permission
            </button>
          )}
          
          {!capabilities.speechRecognition && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md">
              <div className="text-red-400 text-sm">
                ⚠️ Speech Recognition not supported. Use Chrome, Edge, or Safari.
              </div>
            </div>
          )}
          
          {!capabilities.isSecureContext && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md">
              <div className="text-red-400 text-sm">
                ⚠️ HTTPS required for speech recognition.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPanel;