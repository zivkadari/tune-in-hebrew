import React, { useState } from 'react';
import { Clock, Play, Trophy, Users, Home, CheckCircle, Dumbbell } from 'lucide-react';
import { PracticeWarningDialog } from '@/components/PracticeWarningDialog';
import { useDeviceType } from '@/hooks/useDeviceType';
import type { RunType } from '@/types/dailyTimeAttack';

interface DailyTimeAttackHomeProps {
  isLoading: boolean;
  hasPlayedOfficialToday: boolean;
  onStartRun: (type: RunType) => void;
  onLeaderboard: () => void;
  onGroups: () => void;
  onBack: () => void;
}

export const DailyTimeAttackHome: React.FC<DailyTimeAttackHomeProps> = ({
  isLoading,
  hasPlayedOfficialToday,
  onStartRun,
  onLeaderboard,
  onGroups,
  onBack
}) => {
  const { safeAreaTop } = useDeviceType();
  const [showPracticeWarning, setShowPracticeWarning] = useState(false);

  const handlePracticeClick = () => {
    setShowPracticeWarning(true);
  };

  const handleConfirmPractice = () => {
    setShowPracticeWarning(false);
    onStartRun('practice');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-5 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <button 
        onClick={onBack}
        className="absolute left-6 p-2 rounded-full glass-card hover:bg-muted/50 transition-colors"
        style={{ top: `${Math.max(safeAreaTop + 8, 48)}px` }}
      >
        <Home className="w-5 h-5" />
      </button>

      {/* Main card */}
      <div className="glass-card-glow p-8 sm:p-12 flex flex-col items-center gap-6 max-w-md w-full">
        {/* Icon */}
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{ 
              background: 'radial-gradient(circle, hsl(200 100% 50% / 0.5) 0%, transparent 70%)',
              transform: 'scale(1.5)'
            }}
          />
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(145deg, hsl(200 100% 55%), hsl(200 100% 40%))',
              boxShadow: '0 8px 40px hsl(200 100% 50% / 0.5)'
            }}
          >
            <Clock className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">⏱️ Time Attack יומי</h1>
          <p className="text-muted-foreground">60 שניות • 12 שירים • דירוג גלובלי</p>
        </div>

        {/* Status message if already played */}
        {hasPlayedOfficialToday && (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">הריצה הרשמית שלך נשמרה!</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {!hasPlayedOfficialToday && (
            <button 
              onClick={() => onStartRun('official')}
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-5"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              <span>התחל ריצה רשמית</span>
            </button>
          )}

          <button 
            onClick={handlePracticeClick}
            className="btn-secondary w-full flex items-center justify-center gap-2 py-4"
          >
            <Dumbbell className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>נסה שוב לשפר</span>
              <span className="text-xs text-muted-foreground">(שיא אישי בלבד)</span>
            </div>
          </button>

          <div className="flex gap-3">
            <button 
              onClick={onLeaderboard}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <Trophy className="w-5 h-5" />
              <span>דירוג</span>
            </button>
            <button 
              onClick={onGroups}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <Users className="w-5 h-5" />
              <span>קבוצות</span>
            </button>
          </div>
        </div>
      </div>

      <PracticeWarningDialog 
        open={showPracticeWarning}
        onOpenChange={setShowPracticeWarning}
        onConfirm={handleConfirmPractice}
      />
    </div>
  );
};
