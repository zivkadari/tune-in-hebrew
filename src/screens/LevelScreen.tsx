import React from "react";
import { Home, ChevronRight } from "lucide-react";
import { CoinDisplay } from "@/components/CoinDisplay";
import { PlayButton } from "@/components/PlayButton";
import { LetterSlots } from "@/components/LetterSlots";
import { LetterBubbles } from "@/components/LetterBubbles";
import { ActionButtons } from "@/components/ActionButtons";
import { MessageDisplay } from "@/components/MessageDisplay";
import { Piano } from "@/components/Piano";
import { Slot, Bubble } from "@/hooks/useGameState";

interface LevelScreenProps {
  songNumber: number;
  stageNumber: number;
  totalLevels: number;
  coins: number;
  slots: Slot[];
  bubbles: Bubble[];
  message: string | null;
  messageType: "error" | "warning" | "success" | null;
  isPlaying: boolean;
  activePianoKeys: number[];
  audioProgress: number;
  questionType: "song" | "artist";
  onPlay: () => void;
  onBubbleClick: (bubbleId: string) => void;
  onSlotClick: (slotIndex: number) => void;
  onClearAll: () => void;
  onHintRevealLetter: () => void;
  onHintRemoveFakes: () => void;
  onHintSolveAll: () => void;
  onHome: () => void;
  onPreviousLevel: () => void;
  canGoPrevious: boolean;
  hasFilledSlots: boolean;
  hasFakeBubbles: boolean;
}

export const LevelScreen: React.FC<LevelScreenProps> = ({
  songNumber,
  stageNumber,
  totalLevels,
  coins,
  slots,
  bubbles,
  message,
  messageType,
  isPlaying,
  activePianoKeys,
  audioProgress,
  questionType,
  onPlay,
  onBubbleClick,
  onSlotClick,
  onClearAll,
  onHintRevealLetter,
  onHintRemoveFakes,
  onHintSolveAll,
  onHome,
  onPreviousLevel,
  canGoPrevious,
  hasFilledSlots,
  hasFakeBubbles,
}) => {
  return (
    <div className="min-h-screen flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <button 
            onClick={onHome} 
            className="w-10 h-10 rounded-xl bg-muted/50 border border-border/40 
                       flex items-center justify-center transition-all duration-200 active:scale-[0.96]"
          >
            <Home className="w-5 h-5 text-foreground" />
          </button>
          
          <button 
            onClick={onPreviousLevel}
            disabled={!canGoPrevious}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200
              ${canGoPrevious 
                ? "bg-muted/50 border-border/40 active:scale-[0.96]" 
                : "bg-muted/20 border-border/20 opacity-40 cursor-not-allowed"
              }`}
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold text-foreground">
            שלב {stageNumber}
          </div>
          <div className="text-sm text-muted-foreground">
            שיר {songNumber}
          </div>
        </div>
        
        <CoinDisplay coins={coins} />
      </header>

      {/* Feedback floats outside the game layout so one or two lines never shift controls. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        dir="rtl"
        className="pointer-events-none fixed inset-x-4 top-[calc(env(safe-area-inset-top)+8rem)] z-50 mx-auto max-w-[520px] leading-snug [&_.message-card]:w-full [&_.message-card]:shadow-xl"
      >
        <MessageDisplay message={message} type={messageType} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 gap-5 pb-4">
        {/* Piano in card - centered at top */}
        <div className="w-full max-w-[520px]">
          <div className="piano-card">
            <Piano activeKeys={activePianoKeys} />
            {/* Audio progress bar */}
            <div className="audio-progress-bar mt-3">
              <div 
                className="audio-progress-fill" 
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Play button */}
        <div className="flex flex-col items-center gap-3">
          <PlayButton isPlaying={isPlaying} onPlay={onPlay} />
        </div>

        {/* Task header - above letter slots */}
        <div className="w-full max-w-[520px] text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <span className="text-lg">
              {questionType === "artist" ? "🎤" : "🎵"}
            </span>
            <span className="text-lg font-bold text-foreground">
              {questionType === "artist" ? "נחש/י את האמן" : "נחש/י את שם השיר"}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              questionType === "artist" 
                ? "bg-purple-500/20 text-purple-300" 
                : "bg-primary/20 text-primary"
            }`}>
              {questionType === "artist" ? "אמן" : "שיר"}
            </span>
          </div>
        </div>

        {/* Letter slots */}
        <div className="w-full max-w-[520px]">
          <LetterSlots slots={slots} onSlotClick={onSlotClick} />
        </div>

        {/* Action buttons in bar */}
        <div className="w-full max-w-[520px]">
          <ActionButtons
            onClearAll={onClearAll}
            onHintRevealLetter={onHintRevealLetter}
            onHintRemoveFakes={onHintRemoveFakes}
            onHintSolveAll={onHintSolveAll}
            coins={coins}
            hasFilledSlots={hasFilledSlots}
            hasFakeBubbles={hasFakeBubbles}
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
