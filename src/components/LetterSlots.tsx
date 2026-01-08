import React from "react";
import { Slot } from "@/hooks/useGameState";

interface LetterSlotsProps {
  slots: Slot[];
}

export const LetterSlots: React.FC<LetterSlotsProps> = ({ slots }) => {
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
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
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

            return (
              <div
                key={globalIdx}
                className={`letter-slot ${
                  slot.value 
                    ? "letter-slot-filled animate-bounce-in" 
                    : "letter-slot-empty"
                }`}
              >
                {slot.value || ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};