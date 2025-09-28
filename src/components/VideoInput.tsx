import React, { useState, useRef, useEffect } from 'react';

interface VideoInputProps {
  isEnabled: boolean;
}

const VideoInput: React.FC<VideoInputProps> = ({ isEnabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startVideo = async () => {
      try {
        if (!isEnabled) {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
          return;
        }
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user" 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setError(null);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied. Please check permissions.");
      }
    };

    startVideo();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div className="video-input">
      {error ? (
        <div className="video-error p-4 bg-red-500/20 text-red-100 rounded-lg text-center">
          {error}
        </div>
      ) : (
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-xl shadow-lg border border-#ffffff-500/30"
          style={{ width: '100%', maxWidth: '480px' }}
        />
      )}
    </div>
  );
};

export default VideoInput;
