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
  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      <button onClick={onUndo} className="btn-action">
        <Undo2 className="w-5 h-5" />
        <span className="hidden sm:inline">בטל</span>
      </button>

      <button onClick={onSubmit} className="btn-primary flex items-center gap-2">
        <Check className="w-5 h-5" />
        <span>בדוק</span>
      </button>

      <button
        onClick={onHint}
        className="btn-action"
        title={coins < 3 ? "צריך 3 מטבעות" : "רמז (3 מטבעות)"}
      >
        <Lightbulb className="w-5 h-5 text-coin" />
        <span className="text-sm text-muted-foreground">3</span>
      </button>
    </div>
  );
};
