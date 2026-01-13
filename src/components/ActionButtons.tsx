import React from "react";
import { Trash2, Type, Eraser, Sparkles } from "lucide-react";

interface ActionButtonsProps {
  onClearAll: () => void;
  onHintRevealLetter: () => void;
  onHintRemoveFakes: () => void;
  onHintSolveAll: () => void;
  coins: number;
  hasFilledSlots: boolean;
  hasFakeBubbles: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClearAll,
  onHintRevealLetter,
  onHintRemoveFakes,
  onHintSolveAll,
  coins,
  hasFilledSlots,
  hasFakeBubbles,
}) => {
  const canAffordRevealLetter = coins >= 4;
  const canAffordRemoveFakes = coins >= 7;
  const canAffordSolveAll = coins >= 18;

  return (
    <div className="action-bar flex flex-wrap justify-center gap-4">
      {/* Clear all button */}
      <div className="flex flex-col items-center gap-1">
        <button 
          onClick={onClearAll} 
          disabled={!hasFilledSlots}
          className={`btn-action w-12 h-12 flex items-center justify-center ${
            !hasFilledSlots ? "opacity-40" : ""
          }`}
          title="מחק הכל"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <span className="text-xs text-muted-foreground">נקה</span>
      </div>

      {/* Hint: Reveal letter - 4 coins */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={onHintRevealLetter}
          disabled={!canAffordRevealLetter}
          className={`btn-action w-12 h-12 flex items-center justify-center ${
            !canAffordRevealLetter ? "opacity-40" : ""
          }`}
          title={!canAffordRevealLetter ? "צריך 4 מטבעות" : "גלה אות (4 מטבעות)"}
        >
          <Type className="w-5 h-5 text-primary" />
        </button>
        <span className={`text-xs flex items-center gap-1 ${
          !canAffordRevealLetter ? "text-red-400" : "text-muted-foreground"
        }`}>
          <span>אות</span>
          <span className="text-coin font-bold">4🪙</span>
        </span>
      </div>

      {/* Hint: Remove fakes - 7 coins */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={onHintRemoveFakes}
          disabled={!canAffordRemoveFakes || !hasFakeBubbles}
          className={`btn-action w-12 h-12 flex items-center justify-center ${
            (!canAffordRemoveFakes || !hasFakeBubbles) ? "opacity-40" : ""
          }`}
          title={!canAffordRemoveFakes ? "צריך 7 מטבעות" : !hasFakeBubbles ? "אין אותיות מיותרות" : "הסר אותיות מיותרות (7 מטבעות)"}
        >
          <Eraser className="w-5 h-5 text-orange-400" />
        </button>
        <span className={`text-xs flex items-center gap-1 ${
          !canAffordRemoveFakes ? "text-red-400" : "text-muted-foreground"
        }`}>
          <span>פייק</span>
          <span className="text-coin font-bold">7🪙</span>
        </span>
      </div>

      {/* Hint: Solve all - 18 coins */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={onHintSolveAll}
          disabled={!canAffordSolveAll}
          className={`btn-action w-12 h-12 flex items-center justify-center ${
            !canAffordSolveAll ? "opacity-40" : ""
          }`}
          title={!canAffordSolveAll ? "צריך 18 מטבעות" : "פתור הכל (18 מטבעות)"}
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
        </button>
        <span className={`text-xs flex items-center gap-1 ${
          !canAffordSolveAll ? "text-red-400" : "text-muted-foreground"
        }`}>
          <span>פתרון</span>
          <span className="text-coin font-bold">18🪙</span>
        </span>
      </div>
    </div>
  );
};
