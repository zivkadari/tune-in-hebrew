import React from "react";
import { Undo2, Lightbulb, Check } from "lucide-react";

interface ActionButtonsProps {
  onUndo: () => void;
  onSubmit: () => void;
  onHint: () => void;
  coins: number;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onUndo,
  onSubmit,
  onHint,
  coins,
}) => {
  const canAffordHint = coins >= 3;

  return (
    <div className="action-bar">
      <button 
        onClick={onUndo} 
        className="btn-action px-5"
      >
        <Undo2 className="w-5 h-5" />
        <span className="hidden sm:inline">בטל</span>
      </button>

      <button 
        onClick={onSubmit} 
        className="btn-primary flex items-center gap-2 px-6 py-3"
      >
        <Check className="w-5 h-5" />
        <span>בדוק</span>
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