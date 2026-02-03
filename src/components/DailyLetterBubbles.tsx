import React from "react";
import type { Bubble } from "@/types/dailyTimeAttack";
import { playTapSound } from "@/lib/sounds";

interface DailyLetterBubblesProps {
  bubbles: Bubble[];
  onBubbleClick: (bubbleId: number) => void;
}

export const DailyLetterBubbles: React.FC<DailyLetterBubblesProps> = ({
  bubbles,
  onBubbleClick,
}) => {
  return (
    <div className="grid grid-cols-7 gap-2 sm:gap-3 px-2 w-full">
      {bubbles.map((bubble) => (
        <button
          key={bubble.id}
          onClick={() => {
            if (!bubble.isUsed) {
              playTapSound();
              onBubbleClick(bubble.id);
            }
          }}
          disabled={bubble.isUsed}
          className={`letter-bubble ${
            bubble.isUsed ? "letter-bubble-used" : "letter-bubble-active"
          }`}
        >
          {bubble.letter}
        </button>
      ))}
    </div>
  );
};
