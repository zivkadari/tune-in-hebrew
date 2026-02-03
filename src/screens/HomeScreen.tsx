import React, { useState } from "react";
import { Music, Play, RotateCcw, LayoutGrid, Clock, Users } from "lucide-react";
import { CoinDisplay } from "@/components/CoinDisplay";
import { SettingsDialog } from "@/components/SettingsDialog";
import { StagesMenuDialog } from "@/components/StagesMenuDialog";
import { useButtonFeedback } from "@/hooks/useButtonFeedback";

interface HomeScreenProps {
  coins: number;
  isFirstTime: boolean;
  onStart: () => void;
  onContinue: () => void;
  onRestart: () => void;
  onLevels: () => void;
  onFullReset: () => void;
  onTimeAttack: () => void;
  onPartyMode: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  coins,
  isFirstTime,
  onStart,
  onContinue,
  onRestart,
  onLevels,
  onFullReset,
  onTimeAttack,
  onPartyMode,
}) => {
  const { withFeedback } = useButtonFeedback();
  const [showStagesMenu, setShowStagesMenu] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-5 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
      </div>

      {/* Settings & Coins HUD - top with higher z-index */}
      <div className="absolute top-6 left-6 safe-area-top flex items-center gap-3 z-20">
        <SettingsDialog onFullReset={onFullReset} />
        <CoinDisplay coins={coins} />
      </div>

      {/* Main card - increased top margin to avoid overlap */}
      <div className="glass-card-glow p-8 sm:p-12 flex flex-col items-center gap-8 max-w-md w-full relative mt-24 z-10">
        {/* Glowing icon */}
        <div className="relative">
          {/* Glow effect behind icon */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{ 
              background: 'radial-gradient(circle, hsl(42 100% 50% / 0.5) 0%, transparent 70%)',
              transform: 'scale(1.5)'
            }}
          />
          <div 
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(145deg, hsl(42 100% 58%), hsl(42 100% 45%))',
              boxShadow: '0 8px 40px hsl(42 100% 50% / 0.5), inset 0 2px 0 hsl(45 100% 80% / 0.4)'
            }}
          >
            <Music className="w-14 h-14 sm:w-18 sm:h-18 text-primary-foreground" />
          </div>
        </div>

        {/* Title & description */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-3 text-foreground">
            נחש את השיר
          </h1>
          <p className="text-muted-foreground text-lg">
            האזינו לקטע והרכיבו את שם השיר
          </p>
        </div>

        {/* Buttons - 4 main options */}
        <div className="flex flex-col gap-4 w-full">
          {/* כפתור ראשי: המשך/התחל משחק */}
          <button 
            onClick={withFeedback(isFirstTime ? onStart : onContinue)} 
            className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-5"
          >
            {isFirstTime ? (
              <>
                <Play className="w-6 h-6" fill="currentColor" />
                <span>התחל משחק</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-6 h-6" />
                <span>המשך משחק</span>
              </>
            )}
          </button>

          {/* חידון בשלבים - פותח דיאלוג */}
          <button 
            onClick={withFeedback(() => setShowStagesMenu(true))} 
            className="btn-secondary w-full flex items-center justify-center gap-3 py-4"
          >
            <LayoutGrid className="w-5 h-5" />
            <span>חידון בשלבים</span>
          </button>

          {/* נחש כמה שיותר (Time Attack) */}
          <button 
            onClick={withFeedback(onTimeAttack)} 
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all
                       bg-gradient-to-r from-cyan-500 to-blue-500 text-white
                       hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/30
                       active:scale-[0.98]"
          >
            <Clock className="w-5 h-5" />
            <span>נחש כמה שיותר</span>
          </button>

          {/* משחק חברתי (Party Mode) */}
          <button 
            onClick={withFeedback(onPartyMode)} 
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all
                       bg-gradient-to-r from-pink-500 to-purple-500 text-white
                       hover:from-pink-400 hover:to-purple-400 hover:shadow-lg hover:shadow-pink-500/30
                       active:scale-[0.98]"
          >
            <Users className="w-5 h-5" />
            <span>משחק חברתי</span>
          </button>
        </div>
      </div>

      {/* Stages Menu Dialog */}
      <StagesMenuDialog
        open={showStagesMenu}
        onOpenChange={setShowStagesMenu}
        onContinue={onContinue}
        onRestart={onRestart}
        onLevels={onLevels}
      />
    </div>
  );
};
