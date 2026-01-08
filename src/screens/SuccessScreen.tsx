import React from "react";
import { Trophy, ArrowLeft, Home } from "lucide-react";
import { CoinDisplay } from "@/components/CoinDisplay";

interface SuccessScreenProps {
  levelNumber: number;
  totalLevels: number;
  coins: number;
  songTitle: string;
  onNextLevel: () => void;
  onHome: () => void;
  isLastLevel: boolean;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  levelNumber,
  totalLevels,
  coins,
  songTitle,
  onNextLevel,
  onHome,
  isLastLevel,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background celebration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-56 h-56 bg-success/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-coin/15 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Coins display */}
      <div className="absolute top-6 left-6 safe-area-top">
        <CoinDisplay coins={coins} />
      </div>

      {/* Main content */}
      <div className="glass-card-glow p-8 sm:p-12 flex flex-col items-center gap-8 max-w-md w-full">
        {/* Trophy with glow */}
        <div className="relative animate-success-glow">
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-70"
            style={{ 
              background: 'radial-gradient(circle, hsl(145 70% 45% / 0.5) 0%, transparent 70%)',
              transform: 'scale(1.5)'
            }}
          />
          <div 
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(145deg, hsl(145 70% 50%), hsl(145 65% 40%))',
              boxShadow: '0 8px 40px hsl(145 70% 45% / 0.5), inset 0 2px 0 hsl(145 80% 70% / 0.4)'
            }}
          >
            <Trophy className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
          </div>
        </div>

        {/* Success message */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-3 text-success">
            כל הכבוד! 🎉
          </h1>
          <p className="text-xl text-foreground font-bold mb-2">
            {songTitle}
          </p>
          <p className="text-muted-foreground">
            שלב {levelNumber}/{totalLevels} הושלם
          </p>
          <div 
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full"
            style={{
              background: 'linear-gradient(145deg, hsl(45 100% 50% / 0.2), hsl(42 100% 50% / 0.1))',
              border: '1px solid hsl(45 100% 50% / 0.4)'
            }}
          >
            <span className="text-coin font-bold text-lg">+5 מטבעות</span>
            <span>🪙</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          {!isLastLevel ? (
            <button 
              onClick={onNextLevel} 
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-5"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>לשלב הבא</span>
            </button>
          ) : (
            <div 
              className="text-center p-5 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, hsl(145 70% 45% / 0.2), hsl(145 60% 40% / 0.1))',
                border: '1px solid hsl(145 70% 45% / 0.4)'
              }}
            >
              <p className="text-xl font-bold text-success">
                🏆 סיימת את כל השלבים!
              </p>
            </div>
          )}

          <button 
            onClick={onHome} 
            className="btn-secondary w-full flex items-center justify-center gap-3 py-4"
          >
            <Home className="w-5 h-5" />
            <span>חזרה לבית</span>
          </button>
        </div>
      </div>
    </div>
  );
};