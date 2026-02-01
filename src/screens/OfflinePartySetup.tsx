import React, { useState } from 'react';
import { ArrowRight, Plus, X, Play, Users, Music, Mic2, Hash } from 'lucide-react';
import { useButtonFeedback } from '@/hooks/useButtonFeedback';
import { Input } from '@/components/ui/input';
import type { PartyPlayer, QuestionType } from '@/types/partyMode';

interface OfflinePartySetupProps {
  players: PartyPlayer[];
  questionType: QuestionType;
  roundCount: 10 | 15 | 20;
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onSetQuestionType: (type: QuestionType) => void;
  onSetRoundCount: (count: 10 | 15 | 20) => void;
  onStartGame: () => void;
  onBack: () => void;
}

export const OfflinePartySetup: React.FC<OfflinePartySetupProps> = ({
  players,
  questionType,
  roundCount,
  onAddPlayer,
  onRemovePlayer,
  onSetQuestionType,
  onSetRoundCount,
  onStartGame,
  onBack,
}) => {
  const { withFeedback } = useButtonFeedback();
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && players.length < 10) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  const canStart = players.length >= 2;

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-5 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={withFeedback(onBack)}
          className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">הגדרת משחק</h1>
      </div>

      <div className="flex-1 overflow-auto space-y-6 relative z-10">
        {/* Players Section */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Users className="w-5 h-5 text-primary" />
            <span>שחקנים ({players.length}/10)</span>
          </div>

          {/* Add player input */}
          <div className="flex gap-2">
            <Input
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="שם השחקן..."
              className="flex-1"
              maxLength={20}
              disabled={players.length >= 10}
            />
            <button
              onClick={withFeedback(handleAddPlayer)}
              disabled={!newPlayerName.trim() || players.length >= 10}
              className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Players list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {players.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                הוסיפו לפחות 2 שחקנים כדי להתחיל
              </p>
            ) : (
              players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <span className="font-medium text-foreground">
                    {index + 1}. {player.name}
                  </span>
                  <button
                    onClick={withFeedback(() => onRemovePlayer(player.id))}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Question Type Section */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Music className="w-5 h-5 text-primary" />
            <span>סוג שאלה</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={withFeedback(() => onSetQuestionType('song'))}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                ${questionType === 'song' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'}`}
            >
              <Music className="w-6 h-6" />
              <span className="font-medium">שם השיר</span>
            </button>
            <button
              onClick={withFeedback(() => onSetQuestionType('artist'))}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                ${questionType === 'artist' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'}`}
            >
              <Mic2 className="w-6 h-6" />
              <span className="font-medium">שם האמן</span>
            </button>
          </div>
        </div>

        {/* Round Count Section */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Hash className="w-5 h-5 text-primary" />
            <span>מספר סיבובים</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {([10, 15, 20] as const).map((count) => (
              <button
                key={count}
                onClick={withFeedback(() => onSetRoundCount(count))}
                className={`p-4 rounded-xl border-2 transition-all text-center
                  ${roundCount === count 
                    ? 'border-primary bg-primary/10 text-primary font-bold' 
                    : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Game Button */}
      <div className="mt-6 relative z-10">
        <button
          onClick={withFeedback(onStartGame)}
          disabled={!canStart}
          className="w-full py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
                     bg-gradient-to-r from-orange-500 to-pink-500 text-white
                     hover:from-orange-400 hover:to-pink-400 hover:shadow-lg hover:shadow-orange-500/30
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                     active:scale-[0.98]"
        >
          <Play className="w-6 h-6" fill="currentColor" />
          <span>התחל משחק</span>
        </button>
        {!canStart && (
          <p className="text-center text-muted-foreground text-sm mt-2">
            נדרשים לפחות 2 שחקנים
          </p>
        )}
      </div>
    </div>
  );
};
