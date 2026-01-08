import React from "react";
import { Play, Pause } from "lucide-react";

interface PlayButtonProps {
  isPlaying: boolean;
  onPlay: () => void;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onPlay }) => {
  return (
    <button 
      onClick={onPlay} 
      className={`play-button ${isPlaying ? 'play-button-playing' : ''}`}
    >
      {isPlaying ? (
        <Pause className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" fill="currentColor" />
      ) : (
        <Play className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground mr-[-3px]" fill="currentColor" />
      )}
    </button>
  );
};