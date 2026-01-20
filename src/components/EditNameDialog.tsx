import React, { useState, useEffect } from "react";
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

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (newName: string) => Promise<void>;
  title?: string;
  description?: string;
  saveButtonText?: string;
  showCancel?: boolean;
}

export const EditNameDialog: React.FC<EditNameDialogProps> = ({
  open,
  onOpenChange,
  currentName,
  onSave,
  title = "שינוי שם",
  description = "הזינו שם חדש שיופיע בטבלת הדירוג",
  saveButtonText = "שמור",
  showCancel = true,
}) => {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setError(null);
    }
  }, [open, currentName]);

  const handleSave = async () => {
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
      onOpenChange(false);
    } catch (err) {
      setError("שגיאה בשמירת השם, נסו שוב");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
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
                handleSave();
              }
            }}
          />
          
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
          
          <div className="flex gap-3">
            {showCancel && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                ביטול
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                saveButtonText
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
