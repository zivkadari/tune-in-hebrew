import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/dailyTimeAttack';

interface DailyLeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  className?: string;
}

export const DailyLeaderboard: React.FC<DailyLeaderboardProps> = ({ 
  entries, 
  title = "דירוג גלובלי",
  className 
}) => {
  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-mono">{rank}</span>;
    }
  };

  // Show top 5 + current player if not in top 5
  const currentPlayerEntry = entries.find(e => e.is_current_player);
  const top5 = entries.slice(0, 5);
  const showCurrentPlayer = currentPlayerEntry && currentPlayerEntry.rank > 5;

  return (
    <div className={cn("glass-card p-4", className)}>
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        {title}
      </h3>
      
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">אין תוצאות עדיין</p>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_50px_60px] gap-2 text-xs text-muted-foreground pb-2 border-b border-border/50">
            <span>#</span>
            <span>שחקן</span>
            <span className="text-center">✓</span>
            <span className="text-left">זמן</span>
          </div>
          
          {/* Top 5 */}
          {top5.map((entry) => (
            <div 
              key={entry.player_id}
              className={cn(
                "grid grid-cols-[40px_1fr_50px_60px] gap-2 items-center py-2 rounded-lg transition-colors",
                entry.is_current_player && "bg-primary/10 border border-primary/30"
              )}
            >
              <div className="flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <span className={cn(
                "truncate",
                entry.is_current_player && "font-bold text-primary"
              )}>
                {entry.is_current_player ? "👉 " : ""}{entry.display_name}
              </span>
              <span className="text-center font-bold">{entry.correct_count}</span>
              <span className="text-left text-sm text-muted-foreground">
                {formatTime(entry.effective_ms)}
              </span>
            </div>
          ))}
          
          {/* Separator if showing current player below top 5 */}
          {showCurrentPlayer && (
            <>
              <div className="text-center text-muted-foreground text-sm py-1">• • •</div>
              <div 
                className="grid grid-cols-[40px_1fr_50px_60px] gap-2 items-center py-2 rounded-lg bg-primary/10 border border-primary/30"
              >
                <div className="flex justify-center">
                  <span className="text-muted-foreground font-mono">{currentPlayerEntry.rank}</span>
                </div>
                <span className="truncate font-bold text-primary">
                  👉 {currentPlayerEntry.display_name}
                </span>
                <span className="text-center font-bold">{currentPlayerEntry.correct_count}</span>
                <span className="text-left text-sm text-muted-foreground">
                  {formatTime(currentPlayerEntry.effective_ms)}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
