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
const TOTAL_BUBBLES = 14; // Two rows of 7 bubbles

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
  
  // Countdown state
  isCountingDown: boolean;
  countdownSeconds: number;
  
  // Current song UI
  currentSong: DailySong | null;
  slots: Slot[];
  bubbles: Bubble[];
  slotState: SlotState;
  isPlaying: boolean;
  activePianoKeys: number[];
  audioProgress: number;
  
  // Messages
  message: string | null;
  messageType: 'success' | 'error' | 'warning' | null;
  
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
  fetchLeaderboard: () => Promise<void>;
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
 * Create slots and bubbles for a song based on answer pattern and shuffled letters from server
 * Pattern is an array of word lengths, e.g., [3, 6] for "אגם בוחבוט"
 */
function createSlotsAndBubbles(
  answerPattern: number[],
  shuffledLetters: string[]
): { slots: Slot[], bubbles: Bubble[] } {
  const slots: Slot[] = [];
  let slotId = 0;
  
  // Create slots according to word pattern with spaces between words
  answerPattern.forEach((wordLength, wordIndex) => {
    // Add space slot between words (not before first word)
    if (wordIndex > 0) {
      slots.push({ id: slotId++, letter: null, bubbleId: null, isSpace: true });
    }
    
    // Add letter slots for this word
    for (let i = 0; i < wordLength; i++) {
      slots.push({ id: slotId++, letter: null, bubbleId: null, isSpace: false });
    }
  });
  
  // Create bubbles from the shuffled letters provided by server
  const bubbles: Bubble[] = shuffledLetters.map((letter, idx) => ({
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
  
  // Countdown state
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  
  // UI state
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [slotState, setSlotState] = useState<SlotState>('normal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePianoKeys, setActivePianoKeys] = useState<number[]>([]);
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Messages
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | null>(null);
  
  // Results
  const [runResult, setRunResult] = useState<DailyRun | null>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  // Refs for timer-safe values (prevents stale closures)
  const timerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const correctCountRef = useRef(0);
  const runTypeRef = useRef<RunType | null>(null);
  const skipUsedRef = useRef(false);
  const yearHintUsedRef = useRef(false);
  const dailySetRef = useRef<DailySet | null>(null);
  const isCheckingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { correctCountRef.current = correctCount; }, [correctCount]);
  useEffect(() => { runTypeRef.current = runType; }, [runType]);
  useEffect(() => { skipUsedRef.current = skipUsed; }, [skipUsed]);
  useEffect(() => { yearHintUsedRef.current = yearHintUsed; }, [yearHintUsed]);
  useEffect(() => { dailySetRef.current = dailySet; }, [dailySet]);

  // Current song helper
  const currentSong = dailySet?.songs[currentSongIndex] ?? null;

  /**
   * Initialize - load player ID and daily set
   */
  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get or create player (this also creates anonymous auth session)
      const pid = await getOrCreatePlayerId();
      setPlayerId(pid);
      
      // Fetch daily set from edge function
      const { data, error } = await supabase.functions.invoke('get-daily-set');
      
      if (error) {
        console.error('Error fetching daily set:', error);
        toast.error('שגיאה בטעינת האתגר היומי');
        return;
      }
      
      const dailySetData = data as DailySet;
      setDailySet(dailySetData);
      
      // Check if player already played official today via edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const url = new URL('https://nltdspmkogjsnnywqzke.supabase.co/functions/v1/get-player-run');
        url.searchParams.set('date', dailySetData.date);
        
        const runResponse = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        
        if (runResponse.ok) {
          const runResult = await runResponse.json();
          if (runResult.run) {
            setHasPlayedOfficialToday(true);
            setTodayOfficialRun(runResult.run as DailyRun);
          }
        }
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
    
    // Clear any existing timers
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset game state and refs immediately
    setRunType(type);
    runTypeRef.current = type;
    setCurrentSongIndex(0);
    setCorrectCount(0);
    correctCountRef.current = 0;
    setSkipUsed(false);
    skipUsedRef.current = false;
    setYearHintUsed(false);
    yearHintUsedRef.current = false;
    setTimeLeftMs(GAME_DURATION_MS);
    setSlotState('normal');
    setRunResult(null);
    setIsPlaying(false);
    setAudioProgress(0);
    
    // Setup first song using answer pattern and shuffled letters from server
    const firstSong = dailySet.songs[0];
    const { slots: newSlots, bubbles: newBubbles } = createSlotsAndBubbles(
      firstSong.answer_pattern,
      firstSong.shuffled_letters
    );
    setSlots(newSlots);
    setBubbles(newBubbles);
    
    // Start 3-second countdown
    setIsCountingDown(true);
    setCountdownSeconds(3);
    setIsRunning(true);
    
    let count = 3;
    countdownTimerRef.current = window.setInterval(() => {
      count--;
      setCountdownSeconds(count);
      
      if (count <= 0) {
        // Countdown finished - start the real game timer
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setIsCountingDown(false);
        
        // Now start the 60-second game timer
        startTimeRef.current = Date.now();
        timerRef.current = window.setInterval(() => {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = Math.max(0, GAME_DURATION_MS - elapsed);
          setTimeLeftMs(remaining);
          
          if (remaining <= 0) {
            // Time's up!
            endRunInternal();
          }
        }, 100);
      }
    }, 1000);
    
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
    
    // Use refs for timer-safe values (prevents stale closure issues)
    const currentCorrectCount = correctCountRef.current;
    const currentRunType = runTypeRef.current;
    const currentSkipUsed = skipUsedRef.current;
    const currentYearHintUsed = yearHintUsedRef.current;
    const currentDailySet = dailySetRef.current;
    
    const elapsedMs = Date.now() - startTimeRef.current;
    const completedAll = currentCorrectCount >= SONGS_PER_GAME;
    const effectiveMs = completedAll 
      ? Math.max(0, elapsedMs - COMPLETION_BONUS_MS)
      : GAME_DURATION_MS;
    
    const pid = getPlayerId();
    
    // Create fallback result for display even if save fails
    const fallbackResult: DailyRun = {
      id: 'local-' + Date.now(),
      player_id: pid || 'unknown',
      date: currentDailySet?.date || new Date().toISOString().split('T')[0],
      run_type: currentRunType || 'practice',
      correct_count: currentCorrectCount,
      elapsed_ms: Math.round(elapsedMs),
      effective_ms: Math.round(effectiveMs),
      completed_all_12: completedAll,
      skip_used: currentSkipUsed,
      year_hint_used: currentYearHintUsed,
      created_at: new Date().toISOString()
    };
    
    if (!pid || !currentDailySet || !currentRunType) {
      console.error('Missing data for save:', { pid, currentDailySet, currentRunType });
      // Still show results screen with fallback
      setRunResult(fallbackResult);
      return;
    }
    
    // Save run via edge function (uses JWT auth)
    const runData = {
      date: currentDailySet.date,
      run_type: currentRunType,
      correct_count: currentCorrectCount,
      elapsed_ms: Math.round(elapsedMs),
      effective_ms: Math.round(effectiveMs),
      completed_all_12: completedAll,
      skip_used: currentSkipUsed,
      year_hint_used: currentYearHintUsed
    };
    
    try {
      const { data, error } = await supabase.functions.invoke('save-run', {
        body: runData,
      });
      
      if (error) {
        console.error('Error saving run:', error);
        toast.error('שגיאה בשמירת התוצאה');
        setRunResult(fallbackResult);
        return;
      }
      
      if (data?.error) {
        // Might be duplicate official run
        if (data.error.includes('already exists')) {
          toast.error('כבר שיחקת ריצה רשמית היום');
        } else {
          toast.error(data.error);
        }
        setRunResult(fallbackResult);
        return;
      }
      
      setRunResult(data.run as DailyRun);
      
      if (currentRunType === 'official') {
        setHasPlayedOfficialToday(true);
        setTodayOfficialRun(data.run as DailyRun);
      }
      
      // Fetch leaderboard
      await fetchLeaderboard();
      
    } catch (err) {
      console.error('Error saving run:', err);
      setRunResult(fallbackResult);
    }
  }, []);

  /**
   * End run (exposed version)
   */
  const endRun = useCallback(() => {
    endRunInternal();
  }, [endRunInternal]);

  /**
   * Fetch global leaderboard for today via secure edge function
   */
  const fetchLeaderboard = useCallback(async () => {
    if (!dailySet) return;
    
    const url = new URL('https://nltdspmkogjsnnywqzke.supabase.co/functions/v1/get-leaderboard');
    url.searchParams.set('date', dailySet.date);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      console.error('Error fetching leaderboard:', response.statusText);
      return;
    }
    
    const result = await response.json();
    
    if (result.error) {
      console.error('Error fetching leaderboard:', result.error);
      return;
    }
    
    setGlobalLeaderboard(result.leaderboard || []);
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
    const { slots: newSlots, bubbles: newBubbles } = createSlotsAndBubbles(
      nextSong.answer_pattern,
      nextSong.shuffled_letters
    );
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
   * Check if answer is correct using local hash verification (no server call!)
   */
  const checkAnswer = useCallback(async (currentSlots: Slot[], userGuess: string) => {
    if (!currentSong || isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    
    try {
      // Compute SHA-256 hash of the guess (without spaces)
      const guessWithoutSpaces = userGuess.replace(/\s/g, '');
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(guessWithoutSpaces)
      );
      const guessHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Local comparison - no server roundtrip!
      const isCorrect = guessHash === currentSong.answer_hash;
      
      if (isCorrect) {
        // CORRECT!
        setSlotState('correct');
        setCorrectCount(prev => prev + 1);
        setMessage('נכון! ✅');
        setMessageType('success');
        
        // Show message for 500ms so users can see it
        setTimeout(() => {
          setMessage(null);
          setMessageType(null);
          advanceToNextSong();
        }, 500);
      } else {
        // WRONG!
        setSlotState('wrong');
        setMessage('לא נכון ❌');
        setMessageType('error');
        
        setTimeout(() => {
          setMessage(null);
          setMessageType(null);
          // Reset slots but keep bubbles
          setSlots(prev => prev.map(s => s.isSpace ? s : { ...s, letter: null, bubbleId: null }));
          setBubbles(prev => prev.map(b => ({ ...b, isUsed: false })));
          setSlotState('normal');
        }, 500);
      }
    } finally {
      isCheckingRef.current = false;
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
    
    // Check if all slots are filled
    const allFilled = newSlots.every(s => s.isSpace || s.letter !== null);
    if (allFilled) {
      // Build user's answer from slots
      const userAnswer = newSlots
        .map(s => s.isSpace ? ' ' : (s.letter || ''))
        .join('');
      
      // Verify via server
      checkAnswer(newSlots, userAnswer);
    }
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
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
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
    isCountingDown,
    countdownSeconds,
    currentSong,
    slots,
    bubbles,
    slotState,
    isPlaying,
    activePianoKeys,
    audioProgress,
    message,
    messageType,
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
    resetForNewRun,
    fetchLeaderboard
  };
}
