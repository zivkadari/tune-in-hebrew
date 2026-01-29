import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Music, Lightbulb } from 'lucide-react';

interface ClassicTutorialOfferDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ClassicTutorialOfferDialog: React.FC<ClassicTutorialOfferDialogProps> = ({
  open,
  onAccept,
  onDecline,
}) => {
  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Music className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center">
            ברוכים הבאים למשחק!
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            לפני שמתחילים, רוצים הדרכה קצרה?
          </DialogDescription>
        </DialogHeader>
        
        {/* Important tip */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-2">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-600 dark:text-amber-400">טיפ חשוב: </span>
            <span className="text-muted-foreground">
              לפעמים צריך לנחש את שם השיר ולפעמים את שם האמן!
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={onAccept}
            className="w-full text-lg py-6"
          >
            כן, תראה לי! 🎓
          </Button>
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="w-full"
          >
            לא, תודה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
