import React from 'react';
import { cn } from '@/lib/utils';

interface DailyTimerProps {
  timeLeftMs: number;
  className?: string;
}

export const DailyTimer: React.FC<DailyTimerProps> = ({ timeLeftMs, className }) => {
  const seconds = Math.ceil(timeLeftMs / 1000);
  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;
  
  return (
    <div 
      className={cn(
        "text-6xl font-black tabular-nums transition-colors duration-300",
        isLow && !isCritical && "text-amber-500 animate-pulse",
        isCritical && "text-red-500 animate-pulse",
        !isLow && "text-foreground",
        className
      )}
    >
      {seconds}
    </div>
  );
};
