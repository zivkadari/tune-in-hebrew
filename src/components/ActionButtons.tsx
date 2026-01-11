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
    <div className="action-bar">
      {/* Clear all button */}
      <button 
        onClick={onClearAll} 
        disabled={!hasFilledSlots}
        className="btn-action px-3"
        title="מחק הכל"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Hint: Reveal letter - 4 coins */}
      <button
        onClick={onHintRevealLetter}
        disabled={!canAffordRevealLetter}
        className="btn-action px-3 gap-1"
        title={!canAffordRevealLetter ? "צריך 4 מטבעות" : "גלה אות (4 מטבעות)"}
      >
        <Type className="w-5 h-5 text-primary" />
        <span className="text-sm text-coin font-bold">4</span>
      </button>

      {/* Hint: Remove fakes - 7 coins */}
      <button
        onClick={onHintRemoveFakes}
        disabled={!canAffordRemoveFakes || !hasFakeBubbles}
        className="btn-action px-3 gap-1"
        title={!canAffordRemoveFakes ? "צריך 7 מטבעות" : !hasFakeBubbles ? "אין אותיות מיותרות" : "הסר אותיות מיותרות (7 מטבעות)"}
      >
        <Eraser className="w-5 h-5 text-orange-400" />
        <span className="text-sm text-coin font-bold">7</span>
      </button>

      {/* Hint: Solve all - 18 coins */}
      <button
        onClick={onHintSolveAll}
        disabled={!canAffordSolveAll}
        className="btn-action px-3 gap-1"
        title={!canAffordSolveAll ? "צריך 18 מטבעות" : "פתור הכל (18 מטבעות)"}
      >
        <Sparkles className="w-5 h-5 text-purple-400" />
        <span className="text-sm text-coin font-bold">18</span>
      </button>
    </div>
  );
};
