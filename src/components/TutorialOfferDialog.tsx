import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap } from 'lucide-react';

interface TutorialOfferDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const TutorialOfferDialog: React.FC<TutorialOfferDialogProps> = ({
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
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center">
            ברוך הבא ל-Time Attack!
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            זוהי הפעם הראשונה שלך במוד הזה.
            <br />
            רוצה הדרכה קצרה לפני שמתחילים?
          </DialogDescription>
        </DialogHeader>
        
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
