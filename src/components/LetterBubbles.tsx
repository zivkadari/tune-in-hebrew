import React from "react";
import { Bubble } from "@/hooks/useGameState";

interface LetterBubblesProps {
  bubbles: Bubble[];
  onBubbleClick: (bubbleId: string) => void;
}

export const LetterBubbles: React.FC<LetterBubblesProps> = ({
  bubbles,
  onBubbleClick,
}) => {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 sm:gap-3 px-2 max-w-md mx-auto">
      {bubbles.map((bubble) => (
        <button
          key={bubble.id}
          onClick={() => !bubble.used && onBubbleClick(bubble.id)}
          disabled={bubble.used}
          className={`letter-bubble ${
            bubble.used ? "letter-bubble-used" : "letter-bubble-active"
          }`}
        >
          {bubble.letter}
        </button>
      ))}
    </div>
  );
};
