import React from 'react';
import { cn } from '@/lib/utils';

interface CountdownOverlayProps {
  seconds: number;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ seconds }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center">
        <div
          key={seconds}
          className={cn(
            "text-9xl font-bold text-primary animate-scale-in",
            seconds === 0 && "text-green-500"
          )}
        >
          {seconds === 0 ? '!התחל' : seconds}
        </div>
        <p className="mt-4 text-xl text-muted-foreground">
          {seconds > 0 ? 'התכונן...' : ''}
        </p>
      </div>
    </div>
  );
};
