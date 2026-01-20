import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreatePlayerId, getPlayerId } from '@/lib/playerStorage';
import type { 
  DailySong, 
  DailySet, 
  Slot, 
  Bubble, 
  RunType, 
  SlotState,
  DailyRun,
  LeaderboardEntry 
} from '@/types/dailyTimeAttack';
import { toast } from 'sonner';

const GAME_DURATION_MS = 60000; // 60 seconds
const SONGS_PER_GAME = 12;
const COMPLETION_BONUS_MS = 4000; // -4 seconds bonus

// Hebrew letters for generating fake letters
const HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';

interface UseDailyTimeAttackReturn {
  // Player state
  playerId: string | null;
  isLoading: boolean;
  
  // Daily set
  dailySet: DailySet | null;
  hasPlayedOfficialToday: boolean;
  todayOfficialRun: DailyRun | null;
  
  // Game state
  isRunning: boolean;
  runType: RunType | null;
  currentSongIndex: number;
  timeLeftMs: number;
  correctCount: number;
  skipUsed: boolean;
  yearHintUsed: boolean;
  
  // Current song UI
  currentSong: DailySong | null;
  slots: Slot[];
  bubbles: Bubble[];
  slotState: SlotState;
  isPlaying: boolean;
  activePianoKeys: number[];
  audioProgress: number;
  
  // Results
  runResult: DailyRun | null;
  globalLeaderboard: LeaderboardEntry[];
  
  // Actions
  initialize: () => Promise<void>;
  startRun: (type: RunType) => void;
  onBubbleClick: (bubbleId: number) => void;
  onSlotClick: (slotId: number) => void;
  useSkip: () => void;
  useYearHint: () => void;
  togglePlay: () => void;
  endRun: () => void;
  resetForNewRun: () => void;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate random fake Hebrew letters
 */
function generateFakeLetters(count: number, existingLetters: string[]): string[] {
  const fakes: string[] = [];
  const available = HEBREW_LETTERS.split('').filter(l => !existingLetters.includes(l));
  
  for (let i = 0; i < count; i++) {
    if (available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      fakes.push(available[idx]);
    } else {
      // If we run out, just pick random
      fakes.push(HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)]);
    }
  }
  return fakes;
}

/**
 * Create slots and bubbles for a song answer
 */
function createSlotsAndBubbles(answer: string): { slots: Slot[], bubbles: Bubble[] } {
  // Create slots
  const slots: Slot[] = [];
  let slotId = 0;
  
  for (const char of answer) {
    if (char === ' ') {
      slots.push({ id: slotId++, letter: ' ', bubbleId: null, isSpace: true });
    } else {
      slots.push({ id: slotId++, letter: null, bubbleId: null, isSpace: false });
    }
  }
  
  // Get actual letters (no spaces)
  const answerLetters = answer.replace(/\s/g, '').split('');
  
  // Generate some fake letters (3-5 extra)
  const fakeCount = Math.min(5, Math.max(3, 8 - answerLetters.length));
  const fakeLetters = generateFakeLetters(fakeCount, answerLetters);
  
  // Combine and shuffle
  const allLetters = shuffleArray([...answerLetters, ...fakeLetters]);
  
  // Create bubbles
  const bubbles: Bubble[] = allLetters.map((letter, idx) => ({
    id: idx,
    letter,
    isUsed: false
  }));
  
  return { slots, bubbles };
}

export function useDailyTimeAttack(): UseDailyTimeAttackReturn {
  // Player state
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Daily set
  const [dailySet, setDailySet] = useState<DailySet | null>(null);
  const [hasPlayedOfficialToday, setHasPlayedOfficialToday] = useState(false);
  const [todayOfficialRun, setTodayOfficialRun] = useState<DailyRun | null>(null);
  
  // Game state
  const [isRunning, setIsRunning] = useState(false);
  const [runType, setRunType] = useState<RunType | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(GAME_DURATION_MS);
  const [correctCount, setCorrectCount] = useState(0);
  const [skipUsed, setSkipUsed] = useState(false);
  const [yearHintUsed, setYearHintUsed] = useState(false);
  
  // UI state
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [slotState, setSlotState] = useState<SlotState>('normal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePianoKeys, setActivePianoKeys] = useState<number[]>([]);
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Results
  const [runResult, setRunResult] = useState<DailyRun | null>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Current song helper
  const currentSong = dailySet?.songs[currentSongIndex] ?? null;

  /**
   * Initialize - load player ID and daily set
   */
  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get or create player
      const pid = await getOrCreatePlayerId();
      setPlayerId(pid);
      
      // Fetch daily set from edge function
      const { data, error } = await supabase.functions.invoke('get-daily-set');
      
      if (error) {
        console.error('Error fetching daily set:', error);
        toast.error('שגיאה בטעינת האתגר היומי');
        return;
      }
      
      setDailySet(data as DailySet);
      
      // Check if player already played official today
      const { data: existingRun } = await supabase
        .from('daily_time_attack_runs')
        .select('*')
        .eq('player_id', pid)
        .eq('date', data.date)
        .eq('run_type', 'official')
        .single();
      
      if (existingRun) {
        setHasPlayedOfficialToday(true);
        setTodayOfficialRun(existingRun as DailyRun);
      }
      
    } catch (err) {
      console.error('Error initializing:', err);
      toast.error('שגיאה באתחול המשחק');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start a run (official or practice)
   */
  const startRun = useCallback((type: RunType) => {
    if (!dailySet || dailySet.songs.length === 0) {
      toast.error('אין שירים זמינים');
      return;
    }
    
    // Reset game state
    setRunType(type);
    setCurrentSongIndex(0);
    setCorrectCount(0);
    setSkipUsed(false);
    setYearHintUsed(false);
    setTimeLeftMs(GAME_DURATION_MS);
    setSlotState('normal');
    setRunResult(null);
    setIsPlaying(false);
    setAudioProgress(0);
    
    // Setup first song
    const firstSong = dailySet.songs[0];
    const { slots: newSlots, bubbles: newBubbles } = createSlotsAndBubbles(firstSong.answer);
    setSlots(newSlots);
    setBubbles(newBubbles);
    
    // Start timer
    startTimeRef.current = Date.now();
    setIsRunning(true);
    
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, GAME_DURATION_MS - elapsed);
      setTimeLeftMs(remaining);
      
      if (remaining <= 0) {
        // Time's up!
        endRunInternal();
      }
    }, 100);
    
  }, [dailySet]);

  /**
   * Internal end run logic
   */
  const endRunInternal = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRunning(false);
    setIsPlaying(false);
    
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const elapsedMs = GAME_DURATION_MS - timeLeftMs;
    const completedAll = correctCount >= SONGS_PER_GAME;
    const effectiveMs = completedAll 
      ? Math.max(0, elapsedMs - COMPLETION_BONUS_MS)
      : GAME_DURATION_MS;
    
    const pid = getPlayerId();
    if (!pid || !dailySet || !runType) return;
    
    // Save run via edge function (validates player ownership)
    const runData = {
      date: dailySet.date,
      run_type: runType,
      correct_count: correctCount,
      elapsed_ms: Math.round(elapsedMs),
      effective_ms: Math.round(effectiveMs),
      completed_all_12: completedAll,
      skip_used: skipUsed,
      year_hint_used: yearHintUsed
    };
    
    try {
      const { data, error } = await supabase.functions.invoke('save-run', {
        body: runData,
        headers: {
          'x-player-id': pid,
        },
      });
      
      if (error) {
        console.error('Error saving run:', error);
        toast.error('שגיאה בשמירת התוצאה');
        return;
      }
      
      if (data?.error) {
        // Might be duplicate official run
        if (data.error.includes('already exists')) {
          toast.error('כבר שיחקת ריצה רשמית היום');
        } else {
          toast.error(data.error);
        }
        return;
      }
      
      setRunResult(data.run as DailyRun);
      
      if (runType === 'official') {
        setHasPlayedOfficialToday(true);
        setTodayOfficialRun(data.run as DailyRun);
      }
      
      // Fetch leaderboard
      await fetchLeaderboard();
      
    } catch (err) {
      console.error('Error saving run:', err);
    }
  }, [timeLeftMs, correctCount, dailySet, runType, skipUsed, yearHintUsed]);

  /**
   * End run (exposed version)
   */
  const endRun = useCallback(() => {
    endRunInternal();
  }, [endRunInternal]);

  /**
   * Fetch global leaderboard for today
   */
  const fetchLeaderboard = useCallback(async () => {
    if (!dailySet) return;
    
    const pid = getPlayerId();
    
    // Get top 10 + current player
    const { data: runs, error } = await supabase
      .from('daily_time_attack_runs')
      .select(`
        player_id,
        correct_count,
        effective_ms,
        created_at,
        players!inner(display_name)
      `)
      .eq('date', dailySet.date)
      .eq('run_type', 'official')
      .order('correct_count', { ascending: false })
      .order('effective_ms', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return;
    }
    
    // Transform to LeaderboardEntry
    const entries: LeaderboardEntry[] = (runs || []).map((run: any, idx: number) => ({
      rank: idx + 1,
      player_id: run.player_id,
      display_name: run.players?.display_name || 'שחקן אנונימי',
      correct_count: run.correct_count,
      effective_ms: run.effective_ms,
      created_at: run.created_at,
      is_current_player: run.player_id === pid
    }));
    
    setGlobalLeaderboard(entries);
  }, [dailySet]);

  /**
   * Advance to next song
   */
  const advanceToNextSong = useCallback(() => {
    if (!dailySet) return;
    
    const nextIndex = currentSongIndex + 1;
    
    if (nextIndex >= dailySet.songs.length) {
      // Completed all songs!
      endRunInternal();
      return;
    }
    
    setCurrentSongIndex(nextIndex);
    const nextSong = dailySet.songs[nextIndex];
    const { slots: newSlots, bubbles: newBubbles } = createSlotsAndBubbles(nextSong.answer);
    setSlots(newSlots);
    setBubbles(newBubbles);
    setSlotState('normal');
    setIsPlaying(false);
    setAudioProgress(0);
    
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [dailySet, currentSongIndex, endRunInternal]);

  /**
   * Check if answer is correct
   */
  const checkAnswer = useCallback((currentSlots: Slot[]) => {
    if (!currentSong) return;
    
    // Build user's answer from slots
    const userAnswer = currentSlots
      .map(s => s.isSpace ? ' ' : (s.letter || ''))
      .join('');
    
    // Check if all slots are filled
    const allFilled = currentSlots.every(s => s.isSpace || s.letter !== null);
    if (!allFilled) return;
    
    if (userAnswer === currentSong.answer) {
      // CORRECT!
      setSlotState('correct');
      setCorrectCount(prev => prev + 1);
      toast.success('נכון! ✅', { duration: 500 });
      
      setTimeout(() => {
        advanceToNextSong();
      }, 500);
    } else {
      // WRONG!
      setSlotState('wrong');
      toast.error('לא נכון', { duration: 500 });
      
      setTimeout(() => {
        // Reset slots but keep bubbles
        setSlots(prev => prev.map(s => s.isSpace ? s : { ...s, letter: null, bubbleId: null }));
        setBubbles(prev => prev.map(b => ({ ...b, isUsed: false })));
        setSlotState('normal');
      }, 500);
    }
  }, [currentSong, advanceToNextSong]);

  /**
   * Handle bubble click
   */
  const onBubbleClick = useCallback((bubbleId: number) => {
    if (!isRunning || slotState !== 'normal') return;
    
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble || bubble.isUsed) return;
    
    // Find first empty slot
    const emptySlotIndex = slots.findIndex(s => !s.isSpace && s.letter === null);
    if (emptySlotIndex === -1) return;
    
    // Update slot and bubble
    const newSlots = [...slots];
    newSlots[emptySlotIndex] = {
      ...newSlots[emptySlotIndex],
      letter: bubble.letter,
      bubbleId: bubble.id
    };
    setSlots(newSlots);
    
    setBubbles(prev => prev.map(b => 
      b.id === bubbleId ? { ...b, isUsed: true } : b
    ));
    
    // Check if answer is complete
    checkAnswer(newSlots);
  }, [isRunning, slotState, bubbles, slots, checkAnswer]);

  /**
   * Handle slot click (remove letter)
   */
  const onSlotClick = useCallback((slotId: number) => {
    if (!isRunning || slotState !== 'normal') return;
    
    const slot = slots.find(s => s.id === slotId);
    if (!slot || slot.isSpace || slot.letter === null) return;
    
    // Return bubble
    if (slot.bubbleId !== null) {
      setBubbles(prev => prev.map(b => 
        b.id === slot.bubbleId ? { ...b, isUsed: false } : b
      ));
    }
    
    // Clear slot
    setSlots(prev => prev.map(s => 
      s.id === slotId ? { ...s, letter: null, bubbleId: null } : s
    ));
  }, [isRunning, slotState, slots]);

  /**
   * Use skip (once per run)
   */
  const useSkip = useCallback(() => {
    if (!isRunning || skipUsed) return;
    
    setSkipUsed(true);
    toast.info('דילגת על השיר ⏭️', { duration: 1000 });
    advanceToNextSong();
  }, [isRunning, skipUsed, advanceToNextSong]);

  /**
   * Use year hint (once per run)
   */
  const useYearHint = useCallback(() => {
    if (!isRunning || yearHintUsed || !currentSong) return;
    
    setYearHintUsed(true);
    toast.info(`שנת יציאה: ${currentSong.release_year}`, { duration: 3000 });
  }, [isRunning, yearHintUsed, currentSong]);

  /**
   * Toggle audio play
   */
  const togglePlay = useCallback(() => {
    if (!currentSong || !isRunning) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(currentSong.audio_url);
        audioRef.current.addEventListener('timeupdate', () => {
          if (audioRef.current) {
            const progress = audioRef.current.currentTime / audioRef.current.duration;
            setAudioProgress(progress);
          }
        });
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setAudioProgress(0);
        });
      }
      audioRef.current.play();
      setIsPlaying(true);
      
      // Animate piano keys
      const keyInterval = setInterval(() => {
        setActivePianoKeys([
          Math.floor(Math.random() * 7),
          Math.floor(Math.random() * 7)
        ]);
      }, 200);
      
      audioRef.current.addEventListener('ended', () => {
        clearInterval(keyInterval);
        setActivePianoKeys([]);
      }, { once: true });
      
      audioRef.current.addEventListener('pause', () => {
        clearInterval(keyInterval);
        setActivePianoKeys([]);
      }, { once: true });
    }
  }, [currentSong, isRunning, isPlaying]);

  /**
   * Reset for a new run
   */
  const resetForNewRun = useCallback(() => {
    setRunResult(null);
    setGlobalLeaderboard([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    playerId,
    isLoading,
    dailySet,
    hasPlayedOfficialToday,
    todayOfficialRun,
    isRunning,
    runType,
    currentSongIndex,
    timeLeftMs,
    correctCount,
    skipUsed,
    yearHintUsed,
    currentSong,
    slots,
    bubbles,
    slotState,
    isPlaying,
    activePianoKeys,
    audioProgress,
    runResult,
    globalLeaderboard,
    initialize,
    startRun,
    onBubbleClick,
    onSlotClick,
    useSkip,
    useYearHint,
    togglePlay,
    endRun,
    resetForNewRun
  };
}
