import React from "react";
import { Home } from "lucide-react";
import { CoinDisplay } from "@/components/CoinDisplay";
import { PlayButton } from "@/components/PlayButton";
import { LetterSlots } from "@/components/LetterSlots";
import { LetterBubbles } from "@/components/LetterBubbles";
import { ActionButtons } from "@/components/ActionButtons";
import { MessageDisplay } from "@/components/MessageDisplay";
import { Piano } from "@/components/Piano";
import { Slot, Bubble } from "@/hooks/useGameState";

interface LevelScreenProps {
  levelNumber: number;
  totalLevels: number;
  coins: number;
  slots: Slot[];
  bubbles: Bubble[];
  message: string | null;
  messageType: "error" | "warning" | "success" | null;
  isPlaying: boolean;
  activePianoKeys: number[];
  onPlay: () => void;
  onBubbleClick: (bubbleId: string) => void;
  onUndo: () => void;
  onSubmit: () => void;
  onHint: () => void;
  onHome: () => void;
}

export const LevelScreen: React.FC<LevelScreenProps> = ({
  levelNumber,
  totalLevels,
  coins,
  slots,
  bubbles,
  message,
  messageType,
  isPlaying,
  activePianoKeys,
  onPlay,
  onBubbleClick,
  onUndo,
  onSubmit,
  onHint,
  onHome,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-6">
        <button onClick={onHome} className="btn-action p-2">
          <Home className="w-5 h-5" />
        </button>
        
        <div className="text-lg font-bold text-muted-foreground">
          שלב {levelNumber}/{totalLevels}
        </div>
        
        <CoinDisplay coins={coins} />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-between p-4 gap-6 pb-0">
        {/* Play button */}
        <div className="flex-shrink-0">
          <PlayButton isPlaying={isPlaying} onPlay={onPlay} />
        </div>

        {/* Letter slots */}
        <div className="w-full">
          <LetterSlots slots={slots} />
        </div>

        {/* Message */}
        <div className="w-full max-w-md">
          <MessageDisplay message={message} type={messageType} />
        </div>

        {/* Action buttons */}
        <div className="w-full">
          <ActionButtons
            onUndo={onUndo}
            onSubmit={onSubmit}
            onHint={onHint}
            coins={coins}
          />
        </div>

        {/* Letter bubbles */}
        <div className="w-full">
          <LetterBubbles bubbles={bubbles} onBubbleClick={onBubbleClick} />
        </div>

        {/* Piano - always at bottom */}
        <div className="w-full mt-auto">
          <Piano activeKeys={activePianoKeys} />
        </div>
      </main>
    </div>
  );
};
