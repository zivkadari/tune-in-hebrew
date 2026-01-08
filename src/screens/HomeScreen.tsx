import React from "react";
import { Music, Play, RotateCcw } from "lucide-react";
import { CoinDisplay } from "@/components/CoinDisplay";

interface HomeScreenProps {
  coins: number;
  canContinue: boolean;
  onStart: () => void;
  onContinue: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  coins,
  canContinue,
  onStart,
  onContinue,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-bubble/10 rounded-full blur-2xl" />
      </div>

      {/* Coins display */}
      <div className="absolute top-6 left-6">
        <CoinDisplay coins={coins} />
      </div>

      {/* Main content */}
      <div className="glass-card p-8 sm:p-12 flex flex-col items-center gap-8 max-w-md w-full">
        {/* Logo/Icon */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary via-coin to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
          <Music className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-primary via-coin to-accent bg-clip-text text-transparent">
            נחש את השיר
          </h1>
          <p className="text-muted-foreground">
            האזיני לקטע והרכיבי את שם השיר
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <button onClick={onStart} className="btn-primary w-full flex items-center justify-center gap-3">
            <Play className="w-6 h-6" fill="currentColor" />
            <span>התחל משחק</span>
          </button>

          {canContinue && (
            <button onClick={onContinue} className="btn-secondary w-full flex items-center justify-center gap-3">
              <RotateCcw className="w-5 h-5" />
              <span>המשך שלב אחרון</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-sm text-muted-foreground">
        🎵 10 שירים ישראליים אהובים
      </p>
    </div>
  );
};
