import React from 'react';
import { Home, RotateCcw, Trophy, Clock, Sparkles, Dumbbell } from 'lucide-react';
import { DailyLeaderboard } from '@/components/DailyLeaderboard';
import type { DailyRun, LeaderboardEntry, RunType } from '@/types/dailyTimeAttack';

interface DailyTimeAttackResultsProps {
  runResult: DailyRun;
  globalLeaderboard: LeaderboardEntry[];
  onTryAgain: () => void;
  onHome: () => void;
}

export const DailyTimeAttackResults: React.FC<DailyTimeAttackResultsProps> = ({
  runResult,
  globalLeaderboard,
  onTryAgain,
  onHome
}) => {
  const formatTime = (ms: number) => (ms / 1000).toFixed(1);
  const completedAll = runResult.completed_all_12;

  return (
    <div className="min-h-screen flex flex-col p-6 safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onHome}
          className="p-2 rounded-full glass-card hover:bg-muted/50 transition-colors"
        >
          <Home className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">
          {runResult.run_type === 'practice' ? '🏋️ ריצת אימון' : '🏆 ריצה רשמית'}
        </span>
      </div>

      {/* Results Card */}
      <div className="glass-card-glow p-6 text-center mb-6">
        <h1 className="text-3xl font-black mb-4">
          {completedAll ? '🎉 מושלם!' : '⏱️ נגמר הזמן!'}
        </h1>
        
        <div className="text-5xl font-black text-primary mb-2">
          {runResult.correct_count}
        </div>
        <p className="text-muted-foreground mb-4">שירים נפתרו</p>

        {completedAll && (
          <div className="flex items-center justify-center gap-2 text-green-500 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">בונוס סיום: -4 שניות!</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            זמן תחרות: <span className="font-bold text-foreground">{formatTime(runResult.effective_ms)}s</span>
          </span>
        </div>

        {runResult.run_type === 'practice' && (
          <div className="mt-4 text-sm text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full inline-block">
            שיא אישי נשמר ✅ (לא עודכן בדירוג)
          </div>
        )}
      </div>

      {/* Leaderboard */}
      {runResult.run_type === 'official' && (
        <DailyLeaderboard entries={globalLeaderboard} className="mb-6" />
      )}

      {/* Actions */}
      <div className="mt-auto space-y-3">
        <button
          onClick={onTryAgain}
          className="btn-secondary w-full flex items-center justify-center gap-2 py-4"
        >
          <Dumbbell className="w-5 h-5" />
          <span>נסה שוב לשפר</span>
        </button>
        
        <button
          onClick={onHome}
          className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
        >
          <Home className="w-5 h-5" />
          <span>חזרה לתפריט</span>
        </button>
      </div>
    </div>
  );
};
