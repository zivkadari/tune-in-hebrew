import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface NewGameNoticeDialogProps {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export const NewGameNoticeDialog: React.FC<NewGameNoticeDialogProps> = ({
  open,
  onClose,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-sm text-center"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">משחק חדש! 😊</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-lg py-4">
          מטבעות תקבלו רק על שירים שעדיין לא זיהיתם.
        </p>
        <div className="flex items-center justify-center gap-3 py-2">
          <Checkbox 
            id="dontShowAgain"
            checked={dontShowAgain} 
            onCheckedChange={(checked) => setDontShowAgain(!!checked)} 
          />
          <label 
            htmlFor="dontShowAgain" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            אל תציג שוב
          </label>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose} className="w-full">
            הבנתי
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
