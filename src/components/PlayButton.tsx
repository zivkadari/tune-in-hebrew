import React from "react";
import { Play, Pause } from "lucide-react";

interface PlayButtonProps {
  isPlaying: boolean;
  onPlay: () => void;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onPlay }) => {
  return (
    <button onClick={onPlay} className="play-button">
      {isPlaying ? (
        <Pause className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground" fill="currentColor" />
      ) : (
        <Play className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground mr-[-4px]" fill="currentColor" />
      )}
    </button>
  );
};
