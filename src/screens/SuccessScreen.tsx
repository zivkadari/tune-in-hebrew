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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background celebration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-40 h-40 bg-success/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-coin/20 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Coins display */}
      <div className="absolute top-6 left-6">
        <CoinDisplay coins={coins} />
      </div>

      {/* Main content */}
      <div className="glass-card p-8 sm:p-12 flex flex-col items-center gap-8 max-w-md w-full success-glow">
        {/* Trophy */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-success via-success to-coin flex items-center justify-center shadow-2xl shadow-success/40 animate-bounce-in">
          <Trophy className="w-14 h-14 sm:w-18 sm:h-18 text-primary-foreground" />
        </div>

        {/* Success message */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 text-success">
            כל הכבוד! 🎉
          </h1>
          <p className="text-xl text-foreground font-bold mb-2">
            {songTitle}
          </p>
          <p className="text-muted-foreground">
            שלב {levelNumber}/{totalLevels} הושלם
          </p>
          <p className="text-coin font-bold mt-2">
            +5 מטבעות 🪙
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          {!isLastLevel ? (
            <button onClick={onNextLevel} className="btn-primary w-full flex items-center justify-center gap-3">
              <ArrowLeft className="w-6 h-6" />
              <span>לשלב הבא</span>
            </button>
          ) : (
            <div className="text-center p-4 rounded-xl bg-success/20 border border-success/50">
              <p className="text-lg font-bold text-success">
                🏆 סיימת את כל השלבים!
              </p>
            </div>
          )}

          <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-3">
            <Home className="w-5 h-5" />
            <span>חזרה לבית</span>
          </button>
        </div>
      </div>
    </div>
  );
};
