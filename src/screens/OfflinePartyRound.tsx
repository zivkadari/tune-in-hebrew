import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Eye, Check, SkipForward, Trophy, X } from 'lucide-react';
import { useButtonFeedback } from '@/hooks/useButtonFeedback';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Piano } from '@/components/Piano';
import type { PartyPlayer, PartySong, QuestionType } from '@/types/partyMode';

interface OfflinePartyRoundProps {
  currentRound: number;
  totalRounds: number;
  currentSong: PartySong;
  players: PartyPlayer[];
  questionType: QuestionType;
  isRevealed: boolean;
  onReveal: () => void;
  onAwardPoint: (playerId: string) => void;
  onNextRound: () => void;
  onQuit: () => void;
}

export const OfflinePartyRound: React.FC<OfflinePartyRoundProps> = ({
  currentRound,
  totalRounds,
  currentSong,
  players,
  questionType,
  isRevealed,
  onReveal,
  onAwardPoint,
  onNextRound,
  onQuit,
}) => {
  const { withFeedback } = useButtonFeedback();
  const { safeAreaTop } = useDeviceType();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePianoKeys, setActivePianoKeys] = useState<number[]>([]);
  const [awardedThisRound, setAwardedThisRound] = useState<Set<string>>(new Set());
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset awarded players when round changes
  useEffect(() => {
    setAwardedThisRound(new Set());
  }, [currentRound]);

  // Audio playback
  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentSong.audioUrl);
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setActivePianoKeys([]);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      
      // Animate piano keys
      const animateKeys = () => {
        if (!isPlaying) return;
        const randomKeys = Array.from({ length: 3 }, () => Math.floor(Math.random() * 7));
        setActivePianoKeys(randomKeys);
      };
      
      const interval = setInterval(animateKeys, 200);
      audioRef.current.onpause = () => clearInterval(interval);
      audioRef.current.onended = () => {
        clearInterval(interval);
        setIsPlaying(false);
        setActivePianoKeys([]);
      };
    }
  }, [currentSong.audioUrl, isPlaying]);

  // Cleanup audio on unmount or song change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentSong.audioUrl]);

  // Stop audio when moving to next round
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setActivePianoKeys([]);
    }
  }, [currentRound]);

  const handleAwardPoint = (playerId: string) => {
    if (!awardedThisRound.has(playerId)) {
      onAwardPoint(playerId);
      setAwardedThisRound(prev => new Set([...prev, playerId]));
    }
  };

  const handleNextRound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setActivePianoKeys([]);
    }
    onNextRound();
  };

  const handleQuit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onQuit();
  };

  const correctAnswer = questionType === 'song' ? currentSong.songName : currentSong.artistName;
  const isLastRound = currentRound >= totalRounds;

  // Sort players by score for display
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-5 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button
          onClick={withFeedback(() => setShowQuitConfirm(true))}
          className="p-2 rounded-full bg-muted/50 hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="text-2xl font-black text-foreground">
            סיבוב {currentRound}/{totalRounds}
          </div>
          <div className="text-sm text-muted-foreground">
            {questionType === 'song' ? 'נחשו את שם השיר' : 'נחשו את שם האמן'}
          </div>
        </div>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Piano & Play */}
      <div className="flex flex-col items-center gap-4 mb-6 relative z-10">
        <Piano activeKeys={activePianoKeys} />
        
        <button
          onClick={withFeedback(togglePlay)}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all
            ${isPlaying 
              ? 'bg-destructive text-destructive-foreground' 
              : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/30'}`}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Reveal Section */}
      <div className="glass-card p-5 mb-4 relative z-10">
        {!isRevealed ? (
          <button
            onClick={withFeedback(onReveal)}
            className="w-full py-4 rounded-xl bg-primary/20 border-2 border-primary text-primary font-bold
                       hover:bg-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            <span>חשיפת התשובה</span>
          </button>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">התשובה הנכונה:</div>
            <div className="text-2xl font-black text-primary">{correctAnswer}</div>
            <div className="text-sm text-muted-foreground">
              {questionType === 'song' ? currentSong.artistName : currentSong.songName} • {currentSong.releaseYear}
            </div>
          </div>
        )}
      </div>

      {/* Players & Points */}
      <div className="flex-1 glass-card p-4 overflow-auto relative z-10">
        <div className="flex items-center gap-2 text-foreground font-bold mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <span>חלוקת נקודות</span>
        </div>
        
        <div className="space-y-2">
          {sortedPlayers.map((player) => {
            const wasAwarded = awardedThisRound.has(player.id);
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all
                  ${wasAwarded ? 'bg-green-500/20 border border-green-500/50' : 'bg-muted/30 border border-border/50'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-primary">{player.score}</span>
                  <span className="font-medium text-foreground">{player.name}</span>
                </div>
                
                {isRevealed && !wasAwarded && (
                  <button
                    onClick={withFeedback(() => handleAwardPoint(player.id))}
                    className="p-2 px-4 rounded-lg bg-green-500 text-white font-medium flex items-center gap-1
                               hover:bg-green-400 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>+1</span>
                  </button>
                )}
                
                {wasAwarded && (
                  <div className="text-green-500 font-bold flex items-center gap-1">
                    <Check className="w-5 h-5" />
                    <span>+1</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Round Button */}
      {isRevealed && (
        <div className="mt-4 relative z-10">
          <button
            onClick={withFeedback(handleNextRound)}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                       bg-gradient-to-r from-orange-500 to-pink-500 text-white
                       hover:from-orange-400 hover:to-pink-400 hover:shadow-lg hover:shadow-orange-500/30
                       active:scale-[0.98]"
          >
            {isLastRound ? (
              <>
                <Trophy className="w-5 h-5" />
                <span>סיום וצפייה בתוצאות</span>
              </>
            ) : (
              <>
                <SkipForward className="w-5 h-5" />
                <span>סיבוב הבא</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="glass-card p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-foreground text-center">לצאת מהמשחק?</h3>
            <p className="text-muted-foreground text-center">התוצאות לא יישמרו</p>
            <div className="flex gap-3">
              <button
                onClick={withFeedback(() => setShowQuitConfirm(false))}
                className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
              >
                המשך לשחק
              </button>
              <button
                onClick={withFeedback(handleQuit)}
                className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors"
              >
                יציאה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
