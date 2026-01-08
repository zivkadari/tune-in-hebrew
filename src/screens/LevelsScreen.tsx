import React from "react";
import { ArrowRight, Lock, Check } from "lucide-react";
import { CoinDisplay } from "@/components/CoinDisplay";
import { Level } from "@/data/levels";

interface LevelsScreenProps {
  coins: number;
  levels: Level[];
  completedLevelIds: number[];
  maxUnlockedLevel: number;
  onSelectLevel: (levelId: number) => void;
  onHome: () => void;
}

export const LevelsScreen: React.FC<LevelsScreenProps> = ({
  coins,
  levels,
  completedLevelIds,
  maxUnlockedLevel,
  onSelectLevel,
  onHome,
}) => {
  return (
    <div className="min-h-screen flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-5">
        <button
          onClick={onHome}
          className="w-10 h-10 rounded-xl bg-muted/50 border border-border/40 
                     flex items-center justify-center transition-all duration-200 active:scale-[0.96]"
        >
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>

        <div className="text-xl font-bold text-foreground">שלבים</div>

        <CoinDisplay coins={coins} />
      </header>

      {/* Levels Grid */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {levels.map((level) => {
            const isCompleted = completedLevelIds.includes(level.id);
            const isUnlocked = level.id <= maxUnlockedLevel;

            return (
              <button
                key={level.id}
                onClick={() => isUnlocked && onSelectLevel(level.id)}
                disabled={!isUnlocked}
                className={`
                  relative p-4 sm:p-5 rounded-2xl border transition-all duration-200
                  flex flex-col items-center justify-center gap-2 min-h-[100px]
                  ${
                    isUnlocked
                      ? isCompleted
                        ? "bg-primary/10 border-primary/30 hover:bg-primary/20 active:scale-[0.97]"
                        : "bg-muted/50 border-border/40 hover:bg-muted active:scale-[0.97]"
                      : "bg-muted/20 border-border/20 opacity-60 cursor-not-allowed"
                  }
                `}
              >
                {/* Level number */}
                <span
                  className={`text-2xl font-bold ${
                    isCompleted ? "text-primary" : "text-foreground"
                  }`}
                >
                  {level.id}
                </span>

                {/* Status icon */}
                {isCompleted ? (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                ) : !isUnlocked ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : null}

                {/* Song title (only for completed levels) */}
                {isCompleted && (
                  <span className="text-xs text-muted-foreground text-center line-clamp-1">
                    {level.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
