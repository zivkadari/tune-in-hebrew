import React, { useState } from "react";
import { Settings, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SettingsDialogProps {
  onFullReset: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ onFullReset }) => {
  const [open, setOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    onFullReset();
    setShowResetConfirm(false);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="p-2 rounded-full bg-card/50 backdrop-blur border border-border/50 hover:bg-card/80 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">⚙️ הגדרות</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-3 text-red-400"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">איפוס מלא של המשחק</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">
              ⚠️ איפוס מלא?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base leading-relaxed">
              הפעולה תמחק את כל ההתקדמות שלך מהמכשיר: מטבעות, שלבים שנפתרו ורמזים שנוצלו.
              <br /><br />
              לאחר אישור המשחק יתחיל מחדש מהשלב הראשון עם 0 מטבעות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:justify-center">
            <AlertDialogCancel className="flex-1">ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              כן, לאפס
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
