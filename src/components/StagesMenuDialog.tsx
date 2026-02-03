import React from "react";
import { RotateCcw, RefreshCw, LayoutGrid, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useButtonFeedback } from "@/hooks/useButtonFeedback";

interface StagesMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onRestart: () => void;
  onLevels: () => void;
}

export const StagesMenuDialog: React.FC<StagesMenuDialogProps> = ({
  open,
  onOpenChange,
  onContinue,
  onRestart,
  onLevels,
}) => {
  const { withFeedback } = useButtonFeedback();

  const handleAction = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-foreground">
            חידון בשלבים
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            בחרו כיצד להמשיך
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={withFeedback(() => handleAction(onContinue))}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4"
          >
            <RotateCcw className="w-5 h-5" />
            <span>המשך משחק</span>
          </button>

          <button
            onClick={withFeedback(() => handleAction(onRestart))}
            className="btn-secondary w-full flex items-center justify-center gap-3 py-4"
          >
            <RefreshCw className="w-5 h-5" />
            <span>התחל מחדש</span>
          </button>

          <button
            onClick={withFeedback(() => handleAction(onLevels))}
            className="btn-secondary w-full flex items-center justify-center gap-3 py-4"
          >
            <LayoutGrid className="w-5 h-5" />
            <span>בחירת שלב</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
