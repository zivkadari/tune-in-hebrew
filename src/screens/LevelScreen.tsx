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
    <div className="min-h-screen flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-5">
        <button 
          onClick={onHome} 
          className="w-10 h-10 rounded-xl bg-muted/50 border border-border/40 
                     flex items-center justify-center transition-all duration-200 active:scale-[0.96]"
        >
          <Home className="w-5 h-5 text-foreground" />
        </button>
        
        <div className="text-lg font-bold text-muted-foreground">
          שלב {levelNumber}/{totalLevels}
        </div>
        
        <CoinDisplay coins={coins} />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 gap-5 pb-4">
        {/* Piano in card - centered at top */}
        <div className="w-full max-w-[520px]">
          <div className="piano-card">
            <Piano activeKeys={activePianoKeys} />
          </div>
        </div>

        {/* Play button with equalizer */}
        <div className="flex flex-col items-center gap-3">
          <PlayButton isPlaying={isPlaying} onPlay={onPlay} />
          {isPlaying && (
            <div className="equalizer">
              <div className="equalizer-bar"></div>
              <div className="equalizer-bar"></div>
              <div className="equalizer-bar"></div>
              <div className="equalizer-bar"></div>
            </div>
          )}
        </div>

        {/* Letter slots */}
        <div className="w-full max-w-[520px]">
          <LetterSlots slots={slots} />
        </div>

        {/* Message */}
        <div className="w-full max-w-[520px]">
          <MessageDisplay message={message} type={messageType} />
        </div>

        {/* Action buttons in bar */}
        <div className="w-full max-w-[520px]">
          <ActionButtons
            onUndo={onUndo}
            onSubmit={onSubmit}
            onHint={onHint}
            coins={coins}
          />
        </div>

        {/* Letter bubbles - pushed to bottom */}
        <div className="w-full max-w-[520px] mt-auto pt-2">
          <LetterBubbles bubbles={bubbles} onBubbleClick={onBubbleClick} />
        </div>
      </main>
    </div>
  );
};