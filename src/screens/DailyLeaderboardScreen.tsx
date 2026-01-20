import React from 'react';
import { ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { DailyLeaderboard } from '@/components/DailyLeaderboard';
import { useDeviceType } from '@/hooks/useDeviceType';
import type { LeaderboardEntry } from '@/types/dailyTimeAttack';

interface DailyLeaderboardScreenProps {
  isLoading: boolean;
  leaderboard: LeaderboardEntry[];
  onBack: () => void;
  onRefresh: () => void;
}

export const DailyLeaderboardScreen: React.FC<DailyLeaderboardScreenProps> = ({
  isLoading,
  leaderboard,
  onBack,
  onRefresh
}) => {
  const { safeAreaTop } = useDeviceType();

  return (
    <div 
      className="min-h-screen flex flex-col p-6 safe-area-bottom"
      style={{ paddingTop: `${Math.max(safeAreaTop + 16, 56)}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full glass-card hover:bg-muted/50 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">דירוג גלובלי</h1>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-full glass-card hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading state */}
      {isLoading && leaderboard.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">טוען דירוג...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <DailyLeaderboard 
            entries={leaderboard} 
            title=""
            className="bg-transparent"
          />
        </div>
      )}
    </div>
  );
};
