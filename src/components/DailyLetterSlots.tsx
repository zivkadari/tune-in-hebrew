import React from "react";
import type { Slot } from "@/types/dailyTimeAttack";
import { cn } from "@/lib/utils";

interface DailyLetterSlotsProps {
  slots: Slot[];
  onSlotClick: (slotId: number) => void;
  className?: string;
}

export const DailyLetterSlots: React.FC<DailyLetterSlotsProps> = ({ 
  slots, 
  onSlotClick,
  className 
}) => {
  // Group slots into words (split by spaces)
  const words: Slot[][] = [];
  let currentWord: Slot[] = [];

  slots.forEach((slot) => {
    if (slot.isSpace) {
      if (currentWord.length > 0) {
        words.push(currentWord);
        currentWord = [];
      }
    } else {
      currentWord.push(slot);
    }
  });
  if (currentWord.length > 0) {
    words.push(currentWord);
  }

  // Calculate slot size based on longest word length
  const maxWordLength = Math.max(...words.map(word => word.length), 0);
  const slotSizeClass = maxWordLength > 8 
    ? "w-7 h-9 text-base sm:w-8 sm:h-10 sm:text-lg"   // Small for very long words
    : maxWordLength > 6 
      ? "w-8 h-10 text-lg sm:w-9 sm:h-11 sm:text-xl"  // Medium
      : "w-10 h-12 text-xl sm:w-11 sm:h-13 sm:text-2xl"; // Normal

  return (
    <div className={cn("flex flex-wrap justify-center gap-4 sm:gap-6 px-2 max-w-full", className)}>
      {words.map((word, wordIdx) => (
        <div key={wordIdx} className="flex flex-wrap gap-1 sm:gap-1.5 justify-center max-w-full">
          {word.map((slot) => {
            if (slot.letter) {
              return (
                <button
                  key={slot.id}
                  onClick={() => onSlotClick(slot.id)}
                  className={cn(
                    "letter-slot letter-slot-filled animate-bounce-in cursor-pointer",
                    "hover:ring-2 hover:ring-primary/50 active:scale-95 transition-all",
                    slotSizeClass
                  )}
                >
                  {slot.letter}
                </button>
              );
            }

            return (
              <div
                key={slot.id}
                className={cn("letter-slot letter-slot-empty", slotSizeClass)}
              >
                {""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
