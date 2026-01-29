import React, { useState } from "react";
import { ArrowRight, Lock, Check, ChevronDown, ChevronUp, Music } from "lucide-react";
import { CoinDisplay } from "@/components/CoinDisplay";
import { Level, SONGS_PER_STAGE, getTotalStages } from "@/data/levels";
import { useButtonFeedback } from "@/hooks/useButtonFeedback";

interface LevelsScreenProps {
  coins: number;
  levels: Level[];
  completedLevelIds: number[];
  maxUnlockedLevel: number;
  onSelectLevel: (levelId: number) => void;
  onHome: () => void;
}

interface StageData {
  stageNumber: number;
  songs: Level[];
  isUnlocked: boolean;
  isCompleted: boolean;
  completedCount: number;
}

export const LevelsScreen: React.FC<LevelsScreenProps> = ({
  coins,
  levels,
  completedLevelIds,
  maxUnlockedLevel,
  onSelectLevel,
  onHome,
}) => {
  const { withFeedback } = useButtonFeedback();
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  // Group songs into stages
  const totalStages = getTotalStages(levels.length);
  const stages: StageData[] = [];

  for (let stageNum = 1; stageNum <= totalStages; stageNum++) {
    const startIdx = (stageNum - 1) * SONGS_PER_STAGE;
    const endIdx = Math.min(startIdx + SONGS_PER_STAGE, levels.length);
    const stageSongs = levels.slice(startIdx, endIdx);
    
    const completedCount = stageSongs.filter(song => completedLevelIds.includes(song.id)).length;
    const isCompleted = completedCount === stageSongs.length;
    
    // A stage is unlocked if the previous stage is completed or it's the first stage
    const previousStageCompleted = stageNum === 1 || 
      stages[stageNum - 2]?.isCompleted;
    const isUnlocked = previousStageCompleted || stageSongs.some(s => s.id <= maxUnlockedLevel);

    stages.push({
      stageNumber: stageNum,
      songs: stageSongs,
      isUnlocked,
      isCompleted,
      completedCount,
    });
  }

  const toggleStage = (stageNumber: number, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    setExpandedStage(expandedStage === stageNumber ? null : stageNumber);
  };

  return (
    <div className="min-h-screen flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-5">
        <button
          onClick={withFeedback(onHome)}
          className="w-10 h-10 rounded-xl bg-muted/50 border border-border/40 
                     flex items-center justify-center transition-all duration-200 active:scale-[0.96]"
        >
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>

        <div className="text-xl font-bold text-foreground">שלבים</div>

        <CoinDisplay coins={coins} />
      </header>

      {/* Stages List */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          {stages.map((stage) => (
            <div key={stage.stageNumber} className="rounded-2xl border border-border/40 overflow-hidden">
              {/* Stage Header */}
              <button
                onClick={() => toggleStage(stage.stageNumber, stage.isUnlocked)}
                disabled={!stage.isUnlocked}
                className={`
                  w-full p-4 flex items-center justify-between transition-all duration-200
                  ${stage.isUnlocked
                    ? stage.isCompleted
                      ? "bg-primary/10 hover:bg-primary/15"
                      : "bg-muted/50 hover:bg-muted"
                    : "bg-muted/20 opacity-60 cursor-not-allowed"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Stage status icon */}
                  {stage.isCompleted ? (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  ) : !stage.isUnlocked ? (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">{stage.stageNumber}</span>
                    </div>
                  )}

                  <div className="text-right">
                    <div className={`font-bold ${stage.isCompleted ? "text-primary" : "text-foreground"}`}>
                      שלב {stage.stageNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stage.completedCount}/{stage.songs.length} שירים
                    </div>
                  </div>
                </div>

                {stage.isUnlocked && (
                  <div className="text-muted-foreground">
                    {expandedStage === stage.stageNumber ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                )}
              </button>

              {/* Songs List (Expandable) */}
              {expandedStage === stage.stageNumber && stage.isUnlocked && (
                <div className="border-t border-border/40 bg-background/50">
                  {stage.songs.map((song, idx) => {
                    const isCompleted = completedLevelIds.includes(song.id);
                    const isSongUnlocked = song.id <= maxUnlockedLevel;

                    return (
                      <button
                        key={song.id}
                        onClick={() => isSongUnlocked && onSelectLevel(song.id)}
                        disabled={!isSongUnlocked}
                        className={`
                          w-full p-3 flex items-center gap-3 border-b border-border/20 last:border-b-0
                          transition-all duration-200
                          ${isSongUnlocked
                            ? "hover:bg-muted/50 active:bg-muted"
                            : "opacity-50 cursor-not-allowed"
                          }
                        `}
                      >
                        {/* Song number */}
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isSongUnlocked
                              ? "bg-muted text-foreground"
                              : "bg-muted/50 text-muted-foreground"
                          }
                        `}>
                          {isCompleted ? <Check className="w-4 h-4" /> : song.id}
                        </div>

                        {/* Song info */}
                        <div className="flex-1 text-right">
                          {isCompleted ? (
                            <span className="text-foreground">{song.songName}</span>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-2 justify-end">
                              <Music className="w-4 h-4" />
                              <span>שיר {song.id}</span>
                            </span>
                          )}
                        </div>

                        {/* Lock icon for locked songs */}
                        {!isSongUnlocked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
