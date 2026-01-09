import React from "react";
import { Slot } from "@/hooks/useGameState";

interface LetterSlotsProps {
  slots: Slot[];
  onSlotClick: (slotIndex: number) => void;
}

export const LetterSlots: React.FC<LetterSlotsProps> = ({ slots, onSlotClick }) => {
  // Group slots into words (split by fixed spaces)
  const words: Slot[][] = [];
  let currentWord: Slot[] = [];

  slots.forEach((slot) => {
    if (slot.type === "fixed" && slot.char === " ") {
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
    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 px-2">
      {words.map((word, wordIdx) => (
        <div key={wordIdx} className="flex gap-1.5">
          {word.map((slot) => {
            const globalIdx = slots.indexOf(slot);
            
            if (slot.type === "fixed") {
              return (
                <div
                  key={globalIdx}
                  className="letter-slot letter-slot-fixed"
                >
                  {slot.char}
                </div>
              );
            }

            if (slot.value) {
              return (
                <button
                  key={globalIdx}
                  onClick={() => onSlotClick(globalIdx)}
                  className="letter-slot letter-slot-filled animate-bounce-in cursor-pointer 
                             hover:ring-2 hover:ring-primary/50 active:scale-95 transition-all"
                >
                  {slot.value}
                </button>
              );
            }

            return (
              <div
                key={globalIdx}
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