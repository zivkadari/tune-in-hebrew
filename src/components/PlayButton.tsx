import React from "react";
import { Play, Pause } from "lucide-react";

interface PlayButtonProps {
  isPlaying: boolean;
  onPlay: () => void;
  disabled?: boolean;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onPlay, disabled = false }) => {
  return (
    <button 
      onClick={onPlay} 
      disabled={disabled}
      className={`play-button ${isPlaying ? 'play-button-playing' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isPlaying ? (
        <Pause className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" fill="currentColor" />
      ) : (
        <Play className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground mr-[-3px]" fill="currentColor" />
      )}
    </button>
  );
};