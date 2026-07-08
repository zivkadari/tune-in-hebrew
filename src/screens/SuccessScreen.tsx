import React from "react";
import { Trophy, ArrowLeft, Home, Youtube } from "lucide-react";
import { CoinDisplay } from "@/components/CoinDisplay";
import { SongCoverArt } from "@/components/SongCoverArt";

interface SuccessArtworkProps {
  songName: string;
  artistName: string;
  coverArtUrl?: string;
  coverVerified?: boolean;
}

const SuccessArtwork: React.FC<SuccessArtworkProps> = ({
  songName,
  artistName,
  coverArtUrl,
  coverVerified,
}) => {
  return (
    <div className="relative animate-success-glow">
      <div
        className="absolute inset-0 rounded-[2rem] bg-success/30 blur-2xl"
        aria-hidden="true"
      />
      <SongCoverArt
        songName={songName}
        artistName={artistName}
        coverArtUrl={coverArtUrl}
        coverVerified={coverVerified}
        className="h-32 w-32 sm:h-36 sm:w-36"
      />
      <div
        className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-success text-white shadow-lg"
        aria-hidden="true"
      >
        <Trophy className="h-5 w-5" />
      </div>
    </div>
  );
};

interface SuccessScreenProps {
  songNumber: number;
  stageNumber: number;
  totalLevels: number;
  coins: number;
  songName: string;
  artistName: string;
  coverArtUrl?: string;
  coverVerified?: boolean;
  onNextLevel: () => void;
  onHome: () => void;
  isLastLevel: boolean;
  isLastSongInStage: boolean;
  usedHints: boolean;
  isFirstTimeCompletion: boolean;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  songNumber,
  stageNumber,
  totalLevels,
  coins,
  songName,
  artistName,
  coverArtUrl,
  coverVerified,
  onNextLevel,
  onHome,
  isLastLevel,
  isLastSongInStage,
  usedHints,
  isFirstTimeCompletion,
}) => {
  // Only give rewards for first-time completions
  const baseReward = isFirstTimeCompletion ? 10 : 0;
  const noHintBonus = isFirstTimeCompletion && !usedHints ? 5 : 0;
  const totalReward = baseReward + noHintBonus;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${artistName} ${songName} official`
  )}`;

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
      <div className="glass-card-glow p-6 sm:p-10 flex flex-col items-center gap-5 sm:gap-7 max-w-md w-full">
        <SuccessArtwork
          songName={songName}
          artistName={artistName}
          coverArtUrl={coverArtUrl}
          coverVerified={coverVerified}
        />

        {/* Success message */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-3 text-success">
            {isLastSongInStage ? "סיימת את השלב! 🏆" : "כל הכבוד! 🎉"}
          </h1>
          <p className="text-xl text-foreground font-bold mb-1">
            "{songName}"
          </p>
          <p className="text-lg text-muted-foreground mb-2">
            {artistName}
          </p>
          <p className="text-muted-foreground">
            שיר {songNumber}/{totalLevels} • שלב {stageNumber}
          </p>
          {isLastSongInStage && !isLastLevel && (
            <p className="text-primary font-bold mt-2">
              עוברים לשלב {stageNumber + 1}!
            </p>
          )}
          
          {/* Reward breakdown */}
          {isFirstTimeCompletion ? (
            <div 
              className="mt-4 inline-flex flex-col items-center gap-1 px-5 py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, hsl(45 100% 50% / 0.2), hsl(42 100% 50% / 0.1))',
                border: '1px solid hsl(45 100% 50% / 0.4)'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-coin font-bold text-lg">+{baseReward} מטבעות</span>
                <span>🪙</span>
              </div>
              {!usedHints && (
                <div className="flex items-center gap-1 text-success text-sm font-medium">
                  <span>+{noHintBonus} בונוס (בלי רמזים!)</span>
                  <span>✨</span>
                </div>
              )}
              <div className="text-foreground font-bold text-base mt-1 border-t border-coin/30 pt-1 w-full text-center">
                סה״כ: +{totalReward}
              </div>
            </div>
          ) : (
            <div 
              className="mt-4 inline-flex flex-col items-center gap-1 px-5 py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, hsl(220 10% 50% / 0.2), hsl(220 10% 40% / 0.1))',
                border: '1px solid hsl(220 10% 50% / 0.3)'
              }}
            >
              <p className="text-muted-foreground text-sm">
                שלב כבר הושלם בעבר
              </p>
              <p className="text-muted-foreground text-xs">
                אין מטבעות נוספים
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-primary/35 bg-gradient-to-b from-primary/10 to-black/20 px-6 py-4 font-bold text-foreground shadow-lg shadow-black/20 transition-all duration-200 active:scale-[0.98]"
            aria-label={`פתח ביוטיוב: ${artistName} – ${songName}`}
          >
            <Youtube className="w-6 h-6 text-red-500" fill="currentColor" aria-hidden="true" />
            <span>פתח ביוטיוב</span>
          </a>

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
