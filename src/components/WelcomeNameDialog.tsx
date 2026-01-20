import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WelcomeNameDialogProps {
  open: boolean;
  defaultName: string;
  onSave: (name: string) => Promise<void>;
}

export const WelcomeNameDialog: React.FC<WelcomeNameDialogProps> = ({
  open,
  defaultName,
  onSave,
}) => {
  const [name, setName] = useState(defaultName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const trimmedName = name.trim();
    
    if (trimmedName.length < 1) {
      setError("השם לא יכול להיות ריק");
      return;
    }
    
    if (trimmedName.length > 50) {
      setError("השם ארוך מדי (עד 50 תווים)");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(trimmedName);
    } catch (err) {
      setError("שגיאה בשמירת השם, נסו שוב");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-sm" 
        dir="rtl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">👋 ברוכים הבאים!</DialogTitle>
          <DialogDescription className="text-center text-base">
            בחרו שם שיופיע בטבלת הדירוג
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הכניסו שם..."
            className="text-center text-lg"
            maxLength={50}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleContinue();
              }
            }}
          />
          
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
          
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full text-lg py-6"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "המשך למשחק 🎮"
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            תוכלו לשנות את השם בכל עת דרך ההגדרות
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
