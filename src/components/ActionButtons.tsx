import React from "react";
import { Trash2, Lightbulb } from "lucide-react";

interface ActionButtonsProps {
  onClearAll: () => void;
  onHint: () => void;
  coins: number;
  hasFilledSlots: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClearAll,
  onHint,
  coins,
  hasFilledSlots,
}) => {
  const canAffordHint = coins >= 3;

  return (
    <div className="action-bar">
      <button 
        onClick={onClearAll} 
        disabled={!hasFilledSlots}
        className="btn-action px-5"
        title="מחק הכל"
      >
        <Trash2 className="w-5 h-5" />
        <span className="hidden sm:inline">מחק הכל</span>
      </button>

      <button
        onClick={onHint}
        disabled={!canAffordHint}
        className="btn-action px-5"
        title={!canAffordHint ? "צריך 3 מטבעות" : "רמז (3 מטבעות)"}
      >
        <Lightbulb className="w-5 h-5 text-coin" />
        <span className="text-sm text-muted-foreground">3</span>
      </button>
    </div>
  );
};