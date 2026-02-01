import React from 'react';
import { Trophy, Medal, RotateCcw, Home, Crown } from 'lucide-react';
import { useButtonFeedback } from '@/hooks/useButtonFeedback';
import type { PartyPlayer } from '@/types/partyMode';

interface OfflinePartyResultsProps {
  players: PartyPlayer[];
  totalRounds: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const OfflinePartyResults: React.FC<OfflinePartyResultsProps> = ({
  players,
  totalRounds,
  onPlayAgain,
  onHome,
}) => {
  const { withFeedback } = useButtonFeedback();

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Get podium players (top 3)
  const podium = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  const getMedalColor = (place: number) => {
    switch (place) {
      case 0: return 'from-yellow-400 to-yellow-600'; // Gold
      case 1: return 'from-gray-300 to-gray-500'; // Silver
      case 2: return 'from-orange-400 to-orange-600'; // Bronze
      default: return 'from-muted to-muted';
    }
  };

  const getMedalIcon = (place: number) => {
    switch (place) {
      case 0: return <Crown className="w-8 h-8 text-yellow-400" />;
      case 1: return <Medal className="w-7 h-7 text-gray-300" />;
      case 2: return <Medal className="w-6 h-6 text-orange-400" />;
      default: return null;
    }
  };

  const getPodiumHeight = (place: number) => {
    switch (place) {
      case 0: return 'h-32'; // Gold - tallest
      case 1: return 'h-24'; // Silver
      case 2: return 'h-20'; // Bronze
      default: return 'h-16';
    }
  };

  // Reorder for visual display: 2nd, 1st, 3rd
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-5 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="text-4xl mb-2">🎉</div>
        <h1 className="text-3xl font-black text-foreground">תוצאות סופיות</h1>
        <p className="text-muted-foreground">{totalRounds} סיבובים</p>
      </div>

      {/* Podium */}
      {podium.length > 0 && (
        <div className="flex justify-center items-end gap-2 mb-6 relative z-10">
          {podiumOrder.map((player, displayIndex) => {
            if (!player) return null;
            const actualPlace = sortedPlayers.indexOf(player);
            
            return (
              <div key={player.id} className="flex flex-col items-center">
                {/* Medal/Crown */}
                <div className="mb-2">
                  {getMedalIcon(actualPlace)}
                </div>
                
                {/* Player info */}
                <div className={`w-24 sm:w-28 ${getPodiumHeight(actualPlace)} rounded-t-xl flex flex-col items-center justify-center
                               bg-gradient-to-b ${getMedalColor(actualPlace)} text-white shadow-lg`}>
                  <span className="font-bold text-2xl">{player.score}</span>
                  <span className="text-xs text-center px-1 line-clamp-2">{player.name}</span>
                </div>
                
                {/* Place number */}
                <div className="w-24 sm:w-28 py-2 bg-muted/50 text-center text-sm font-bold text-muted-foreground rounded-b-lg">
                  מקום {actualPlace + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of players */}
      {rest.length > 0 && (
        <div className="glass-card p-4 mb-6 flex-1 overflow-auto relative z-10">
          <div className="space-y-2">
            {rest.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                    {index + 4}
                  </span>
                  <span className="font-medium text-foreground">{player.name}</span>
                </div>
                <span className="font-bold text-lg text-primary">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 relative z-10 mt-auto">
        <button
          onClick={withFeedback(onPlayAgain)}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                     bg-gradient-to-r from-orange-500 to-pink-500 text-white
                     hover:from-orange-400 hover:to-pink-400 hover:shadow-lg hover:shadow-orange-500/30
                     active:scale-[0.98]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>שחקו שוב</span>
        </button>
        
        <button
          onClick={withFeedback(onHome)}
          className="w-full py-4 rounded-xl font-bold bg-muted text-foreground
                     hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span>חזרה לתפריט</span>
        </button>
      </div>
    </div>
  );
};
