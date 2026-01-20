import React from 'react';
import { Home, Calendar, SkipForward } from 'lucide-react';
import { DailyTimer } from '@/components/DailyTimer';
import { Piano } from '@/components/Piano';
import { PlayButton } from '@/components/PlayButton';
import { DailyLetterSlots } from '@/components/DailyLetterSlots';
import { DailyLetterBubbles } from '@/components/DailyLetterBubbles';
import { MessageDisplay } from '@/components/MessageDisplay';
import { useDeviceType } from '@/hooks/useDeviceType';
import type { DailySong, Slot, Bubble, SlotState, RunType, MessageType } from '@/types/dailyTimeAttack';
import { cn } from '@/lib/utils';

interface DailyTimeAttackRunProps {
  runType: RunType;
  totalSongs: number;
  timeLeftMs: number;
  correctCount: number;
  skipUsed: boolean;
  yearHintUsed: boolean;
  currentSong: DailySong | null;
  slots: Slot[];
  bubbles: Bubble[];
  slotState: SlotState;
  isPlaying: boolean;
  activePianoKeys: number[];
  message: string | null;
  messageType: MessageType;
  onBubbleClick: (bubbleId: number) => void;
  onSlotClick: (slotId: number) => void;
  onSkip: () => void;
  onYearHint: () => void;
  onTogglePlay: () => void;
  onQuit: () => void;
}

export const DailyTimeAttackRun: React.FC<DailyTimeAttackRunProps> = ({
  runType,
  totalSongs,
  timeLeftMs,
  correctCount,
  skipUsed,
  yearHintUsed,
  currentSong,
  slots,
  bubbles,
  slotState,
  isPlaying,
  activePianoKeys,
  message,
  messageType,
  onBubbleClick,
  onSlotClick,
  onSkip,
  onYearHint,
  onTogglePlay,
  onQuit
}) => {
  const { safeAreaTop } = useDeviceType();
  
  const questionText = currentSong?.type === 'artist' 
    ? '🎤 נחש/י את שם האמן'
    : '🎵 נחש/י את שם השיר';

  return (
    <div 
      className="min-h-screen flex flex-col p-4 safe-area-bottom"
      style={{ paddingTop: `${Math.max(safeAreaTop + 8, 48)}px` }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onQuit}
          className="p-2 rounded-full glass-card hover:bg-destructive/20 transition-colors"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {runType === 'practice' && '🏋️ אימון'}
          </span>
          <span className="text-lg font-bold">
            פתרת: {correctCount}/{totalSongs}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-6">
        <DailyTimer timeLeftMs={timeLeftMs} />
      </div>

      {/* Piano */}
      <div className="flex justify-center mb-4">
        <Piano activeKeys={activePianoKeys} />
      </div>

      {/* Play Button */}
      <div className="flex justify-center mb-4">
        <PlayButton isPlaying={isPlaying} onPlay={onTogglePlay} />
      </div>

      {/* Question */}
      <p className="text-center text-lg font-medium mb-4">{questionText}</p>

      {/* Letter Slots */}
      <div className="flex justify-center mb-4">
        <DailyLetterSlots 
          slots={slots} 
          onSlotClick={onSlotClick}
          className={cn(
            "transition-all duration-300 p-2 rounded-lg",
            slotState === 'correct' && "ring-2 ring-green-500 bg-green-500/10",
            slotState === 'wrong' && "ring-2 ring-red-500 bg-red-500/10 animate-shake"
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={onYearHint}
          disabled={yearHintUsed}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
            yearHintUsed 
              ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              : "glass-card hover:bg-muted/50"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>שנה ({yearHintUsed ? '0' : '1'})</span>
        </button>
        
        <button
          onClick={onSkip}
          disabled={skipUsed}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
            skipUsed 
              ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              : "glass-card hover:bg-muted/50"
          )}
        >
          <SkipForward className="w-4 h-4" />
          <span>דלג ({skipUsed ? '0' : '1'})</span>
        </button>
      </div>

      {/* Message Display - above bubbles */}
      <div className="flex justify-center mb-4 min-h-[40px]">
        <MessageDisplay message={message} type={messageType} />
      </div>

      {/* Letter Bubbles */}
      <div className="flex-1 flex items-end pb-4">
        <DailyLetterBubbles bubbles={bubbles} onBubbleClick={onBubbleClick} />
      </div>
    </div>
  );
};
