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

  return (
    <div className={cn("flex flex-wrap justify-center gap-6 sm:gap-8 px-2", className)}>
      {words.map((word, wordIdx) => (
        <div key={wordIdx} className="flex gap-1.5">
          {word.map((slot) => {
            if (slot.letter) {
              return (
                <button
                  key={slot.id}
                  onClick={() => onSlotClick(slot.id)}
                  className="letter-slot letter-slot-filled animate-bounce-in cursor-pointer 
                             hover:ring-2 hover:ring-primary/50 active:scale-95 transition-all"
                >
                  {slot.letter}
                </button>
              );
            }

            return (
              <div
                key={slot.id}
                className="letter-slot letter-slot-empty"
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
