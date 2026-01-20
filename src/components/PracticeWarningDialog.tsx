import React from 'react';
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
import { Dumbbell } from 'lucide-react';

interface PracticeWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const PracticeWarningDialog: React.FC<PracticeWarningDialogProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 justify-center">
            <Dumbbell className="w-6 h-6 text-amber-500" />
            ריצה לשיפור אישי
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            הריצה הזו לא תתעדכן בדירוג הגלובלי או בדירוגי הקבוצות.
            <br />
            <span className="text-muted-foreground">התוצאה תישמר רק כשיא אישי.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 sm:justify-center">
          <AlertDialogCancel className="flex-1">ביטול</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="flex-1 bg-amber-500 hover:bg-amber-600"
          >
            התחל
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
