import React from 'react';
import { BlobState } from './BlobVisualization';
import SpeechService from '../services/SpeechService';

interface FooterProps {
  blobState: BlobState;
}

const Footer: React.FC<FooterProps> = ({ blobState }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-3 flex flex-col items-center justify-center backdrop-blur-sm bg-opacity-5 bg-black border-t border-gray-800/20">
      {/* Instructions based on mode */}
      <div className="text-xs mb-2 text-gray-300 text-center px-4">
        {SpeechService.isContinuousMode() ? (
          <span>🎤 Continuous listening active - Click blob to stop</span>
        ) : (
          <span>Click the blob to start continuous listening</span>
        )}
      </div>
      
    </footer>
  );
};

export default Footer; 