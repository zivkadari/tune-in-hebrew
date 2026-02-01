import { useState, useCallback, useMemo } from 'react';
import { levels } from '@/data/levels';
import type { 
  PartyPlayer, 
  PartySong, 
  OfflinePartySettings, 
  OfflinePartyState,
  QuestionType 
} from '@/types/partyMode';

// Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export interface UseOfflinePartyReturn {
  // State
  players: PartyPlayer[];
  settings: OfflinePartySettings;
  songs: PartySong[];
  currentRound: number;
  currentSong: PartySong | null;
  isRevealed: boolean;
  isFinished: boolean;
  isGameStarted: boolean;
  
  // Computed
  totalRounds: number;
  currentAnswer: string;
  sortedPlayersByScore: PartyPlayer[];
  
  // Setup actions
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerName: (playerId: string, name: string) => void;
  setQuestionType: (type: QuestionType) => void;
  setRoundCount: (count: 10 | 15 | 20) => void;
  
  // Game actions
  startGame: () => void;
  revealAnswer: () => void;
  awardPoint: (playerId: string) => void;
  nextRound: () => void;
  resetGame: () => void;
  fullReset: () => void;
}

export function useOfflineParty(): UseOfflinePartyReturn {
  const [players, setPlayers] = useState<PartyPlayer[]>([]);
  const [settings, setSettings] = useState<OfflinePartySettings>({
    questionType: 'song',
    roundCount: 10,
  });
  const [songs, setSongs] = useState<PartySong[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playedSongIds, setPlayedSongIds] = useState<Set<number>>(new Set());

  // Computed values
  const currentSong = useMemo(() => {
    if (currentRound > 0 && currentRound <= songs.length) {
      return songs[currentRound - 1];
    }
    return null;
  }, [currentRound, songs]);

  const currentAnswer = useMemo(() => {
    if (!currentSong) return '';
    return settings.questionType === 'song' 
      ? currentSong.songName 
      : currentSong.artistName;
  }, [currentSong, settings.questionType]);

  const sortedPlayersByScore = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  // Setup actions
  const addPlayer = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    setPlayers(prev => {
      if (prev.length >= 10) return prev; // Max 10 players
      return [...prev, { id: generateId(), name: trimmedName, score: 0 }];
    });
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  }, []);

  const updatePlayerName = useCallback((playerId: string, name: string) => {
    setPlayers(prev => 
      prev.map(p => p.id === playerId ? { ...p, name: name.trim() } : p)
    );
  }, []);

  const setQuestionType = useCallback((type: QuestionType) => {
    setSettings(prev => ({ ...prev, questionType: type }));
  }, []);

  const setRoundCount = useCallback((count: 10 | 15 | 20) => {
    setSettings(prev => ({ ...prev, roundCount: count }));
  }, []);

  // Game actions
  const startGame = useCallback(() => {
    if (players.length < 2) return;
    
    // Filter out already played songs
    let availableLevels = levels.filter(level => !playedSongIds.has(level.id));
    
    // If not enough songs available, reset the played list and use all levels
    let shouldResetPlayedIds = false;
    if (availableLevels.length < settings.roundCount) {
      shouldResetPlayedIds = true;
      availableLevels = levels;
    }
    
    // Shuffle and pick songs for the game
    const shuffledLevels = shuffleArray(availableLevels);
    const selectedSongs: PartySong[] = shuffledLevels
      .slice(0, settings.roundCount)
      .map(level => ({
        id: level.id,
        songName: level.songName,
        artistName: level.artistName,
        audioUrl: level.audioUrl,
        releaseYear: level.releaseYear,
      }));
    
    // Update played song IDs
    setPlayedSongIds(prev => {
      const updated = shouldResetPlayedIds ? new Set<number>() : new Set(prev);
      selectedSongs.forEach(song => updated.add(song.id));
      return updated;
    });
    
    setSongs(selectedSongs);
    setCurrentRound(1);
    setIsRevealed(false);
    setIsFinished(false);
    setIsGameStarted(true);
    
    // Reset all scores
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
  }, [players.length, settings.roundCount, playedSongIds]);

  const revealAnswer = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const awardPoint = useCallback((playerId: string) => {
    setPlayers(prev => 
      prev.map(p => p.id === playerId ? { ...p, score: p.score + 1 } : p)
    );
  }, []);

  const nextRound = useCallback(() => {
    if (currentRound >= settings.roundCount) {
      setIsFinished(true);
    } else {
      setCurrentRound(prev => prev + 1);
      setIsRevealed(false);
    }
  }, [currentRound, settings.roundCount]);

  const resetGame = useCallback(() => {
    setSongs([]);
    setCurrentRound(0);
    setIsRevealed(false);
    setIsFinished(false);
    setIsGameStarted(false);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
    // Note: playedSongIds is NOT reset here to preserve history between games
  }, []);

  const fullReset = useCallback(() => {
    setSongs([]);
    setCurrentRound(0);
    setIsRevealed(false);
    setIsFinished(false);
    setIsGameStarted(false);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
    setPlayedSongIds(new Set()); // Reset played songs history
  }, []);

  return {
    // State
    players,
    settings,
    songs,
    currentRound,
    currentSong,
    isRevealed,
    isFinished,
    isGameStarted,
    
    // Computed
    totalRounds: settings.roundCount,
    currentAnswer,
    sortedPlayersByScore,
    
    // Setup actions
    addPlayer,
    removePlayer,
    updatePlayerName,
    setQuestionType,
    setRoundCount,
    
    // Game actions
    startGame,
    revealAnswer,
    awardPoint,
    nextRound,
    resetGame,
  };
}
