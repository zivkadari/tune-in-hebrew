import { useState, useEffect, useCallback, useRef } from "react";
import { Level, levels, getStageNumber, isLastSongInStage } from "@/data/levels";
import { toast } from "sonner";
import { playCorrectSound, playStageCompleteSound } from "@/lib/sounds";

// Hebrew letters including final forms
const HEBREW_LETTERS = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ";
const HEBREW_LETTERS_NO_FINAL = "אבגדהוזחטיכלמנסעפצקרשת";

// Constants for game economy
const TOTAL_BUBBLES = 14;
const MAX_ANSWER_LETTERS = 14;
const HINT_COST_REVEAL_LETTER = 4;
const HINT_COST_REMOVE_FAKES = 7;
const HINT_COST_SOLVE_ALL = 18;
const REWARD_BASE = 10;
const REWARD_NO_HINTS_BONUS = 5;

// Count Hebrew letters (excluding spaces)
const countHebrewLetters = (str: string): number => {
  return str.replace(/\s/g, '').length;
};

// Determine question type and answer dynamically based on name lengths
const determineQuestionType = (
  songName: string, 
  artistName: string, 
  levelId: number
): { questionType: 'song' | 'artist'; answer: string } => {
  const songLetters = countHebrewLetters(songName);
  const artistLetters = countHebrewLetters(artistName);
  
  // Case 1: Song name too long → use artist
  if (songLetters > MAX_ANSWER_LETTERS && artistLetters <= MAX_ANSWER_LETTERS) {
    return { questionType: 'artist', answer: artistName };
  }
  
  // Case 2: Artist name too long → use song
  if (artistLetters > MAX_ANSWER_LETTERS && songLetters <= MAX_ANSWER_LETTERS) {
    return { questionType: 'song', answer: songName };
  }
  
  // Case 3: Both too long → use shorter one
  if (songLetters > MAX_ANSWER_LETTERS && artistLetters > MAX_ANSWER_LETTERS) {
    return songLetters <= artistLetters 
      ? { questionType: 'song', answer: songName }
      : { questionType: 'artist', answer: artistName };
  }
  
  // Case 4: Both valid → random (seeded by levelId for consistency)
  const useArtist = (levelId * 7) % 2 === 0;
  return useArtist 
    ? { questionType: 'artist', answer: artistName }
    : { questionType: 'song', answer: songName };
};

export interface Slot {
  type: "fixed" | "letter";
  char?: string;
  answerIndex?: number;
  value: string | null;
}

export interface Bubble {
  id: string;
  letter: string;
  isFake: boolean;
  used: boolean;
}

export interface HistoryItem {
  slotAnswerIndex: number;
  bubbleId: string;
  isHint?: boolean;
}

interface GameState {
  coins: number;
  currentLevelId: number;
  completedLevelIds: number[];
  hintsUsedByLevel: Record<number, boolean>;
}

const STORAGE_KEY = "guess-the-song-state";
const HIDE_NOTICE_KEY = "hide-new-game-notice";
const LEVEL_PROGRESS_KEY = "level-progress";

interface LevelProgress {
  slots: Slot[];
  bubbles: Bubble[];
  inputHistory: HistoryItem[];
}

const saveLevelProgress = (levelId: number, progress: LevelProgress) => {
  try {
    localStorage.setItem(`${LEVEL_PROGRESS_KEY}-${levelId}`, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save level progress:", e);
  }
};

const loadLevelProgress = (levelId: number): LevelProgress | null => {
  try {
    const saved = localStorage.getItem(`${LEVEL_PROGRESS_KEY}-${levelId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Failed to load level progress:", e);
    return null;
  }
};

const clearLevelProgress = (levelId: number) => {
  localStorage.removeItem(`${LEVEL_PROGRESS_KEY}-${levelId}`);
};

const loadGameState = (): GameState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        hintsUsedByLevel: parsed.hintsUsedByLevel || {},
      };
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
  return {
    coins: 0,
    currentLevelId: 1,
    completedLevelIds: [],
    hintsUsedByLevel: {},
  };
};

const saveGameState = (state: GameState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save game state:", e);
  }
};

const loadHideNotice = (): boolean => {
  return localStorage.getItem(HIDE_NOTICE_KEY) === "true";
};

const saveHideNotice = (hide: boolean) => {
  localStorage.setItem(HIDE_NOTICE_KEY, hide.toString());
};

const isHebrewLetter = (char: string): boolean => {
  return HEBREW_LETTERS.includes(char);
};

const getRandomFakeLetter = (): string => {
  const index = Math.floor(Math.random() * HEBREW_LETTERS_NO_FINAL.length);
  return HEBREW_LETTERS_NO_FINAL[index];
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [answerLetters, setAnswerLetters] = useState<string>("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [inputHistory, setInputHistory] = useState<HistoryItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "warning" | "success" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePianoKeys, setActivePianoKeys] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [screen, setScreen] = useState<"home" | "level" | "success" | "levels">("home");
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [hintsUsedInLevel, setHintsUsedInLevel] = useState(false);
  const [showNewGameNotice, setShowNewGameNotice] = useState(false);
  const [isFirstTimeCompletion, setIsFirstTimeCompletion] = useState(false);
  const [currentQuestionType, setCurrentQuestionType] = useState<'song' | 'artist'>('song');

  // Computed values
  const isFirstTime = gameState.completedLevelIds.length === 0;
  const maxUnlockedLevel = gameState.completedLevelIds.length > 0
    ? Math.max(...gameState.completedLevelIds) + 1
    : 1;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pianoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hintsUsedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    hintsUsedRef.current = hintsUsedInLevel;
  }, [hintsUsedInLevel]);

  // Save game state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const initializeLevel = useCallback((levelId: number) => {
    const level = levels.find((l) => l.id === levelId);
    if (!level) return;

    // Reset audio state when changing levels
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = level.audioUrl;
    }
    setIsPlaying(false);
    setAudioProgress(0);
    setActivePianoKeys([]);
    if (pianoIntervalRef.current) {
      clearInterval(pianoIntervalRef.current);
      pianoIntervalRef.current = null;
    }

    setCurrentLevel(level);
    setMessage(null);
    setMessageType(null);
    setShowSuccess(false);
    // Load hints used state from persisted game state
    const savedState = loadGameState();
    const levelHintsUsed = savedState.hintsUsedByLevel[levelId] || false;
    setHintsUsedInLevel(levelHintsUsed);
    hintsUsedRef.current = levelHintsUsed;
    setIsFirstTimeCompletion(false);

    // Determine question type and answer dynamically
    const { questionType, answer } = determineQuestionType(
      level.songName, 
      level.artistName, 
      level.id
    );
    setCurrentQuestionType(questionType);

    // Try to load saved level progress first
    const savedProgress = loadLevelProgress(levelId);
    
    if (savedProgress) {
      // Restore saved progress
      setSlots(savedProgress.slots);
      setBubbles(savedProgress.bubbles);
      setInputHistory(savedProgress.inputHistory);
      
      // Calculate answer letters from the determined answer
      const lettersOnly: string[] = [];
      for (const char of answer) {
        if (isHebrewLetter(char)) {
          lettersOnly.push(char);
        }
      }
      setAnswerLetters(lettersOnly.join(""));
    } else {
      // Create fresh slots and bubbles
      setInputHistory([]);
      
      // Create slots from the determined answer
      const newSlots: Slot[] = [];
      let answerIdx = 0;
      const lettersOnly: string[] = [];

      for (const char of answer) {
        if (isHebrewLetter(char)) {
          newSlots.push({
            type: "letter",
            answerIndex: answerIdx,
            value: null,
          });
          lettersOnly.push(char);
          answerIdx++;
        } else {
          newSlots.push({
            type: "fixed",
            char,
            value: char,
          });
        }
      }

      setSlots(newSlots);
      setAnswerLetters(lettersOnly.join(""));

      // Create bubbles with real letters + fake letters (always TOTAL_BUBBLES = 14)
      const realBubbles: Bubble[] = lettersOnly.map((letter, idx) => ({
        id: `real-${idx}`,
        letter,
        isFake: false,
        used: false,
      }));

      // Calculate fake letters needed to reach TOTAL_BUBBLES
      const fakeCount = Math.max(0, TOTAL_BUBBLES - lettersOnly.length);

      const fakeBubbles: Bubble[] = Array.from({ length: fakeCount }, (_, idx) => ({
        id: `fake-${idx}`,
        letter: getRandomFakeLetter(),
        isFake: true,
        used: false,
      }));

      const allBubbles = shuffleArray([...realBubbles, ...fakeBubbles]);
      setBubbles(allBubbles);
    }

    setScreen("level");
  }, []);

  const startGame = useCallback(() => {
    // Always start from level 1 for new players
    initializeLevel(1);
  }, [initializeLevel]);

  const continueGame = useCallback(() => {
    // Continue from the next uncompleted level
    const nextLevelId = gameState.completedLevelIds.length > 0
      ? Math.max(...gameState.completedLevelIds) + 1
      : gameState.currentLevelId;
    const validLevelId = Math.min(nextLevelId, levels.length);
    initializeLevel(validLevelId);
  }, [gameState.completedLevelIds, gameState.currentLevelId, initializeLevel]);

  const restartGame = useCallback(() => {
    // Reset to level 1, but keep completedLevelIds and coins!
    setGameState((prev) => {
      const newState = {
        ...prev,
        currentLevelId: 1,
      };
      saveGameState(newState);
      return newState;
    });
    
    // Show notice if not hidden
    if (!loadHideNotice()) {
      setShowNewGameNotice(true);
    } else {
      initializeLevel(1);
    }
  }, [initializeLevel]);

  const handleNewGameNoticeClose = useCallback((dontShowAgain: boolean) => {
    if (dontShowAgain) {
      saveHideNotice(true);
    }
    setShowNewGameNotice(false);
    initializeLevel(1);
  }, [initializeLevel]);

  // Helper function to handle level completion
  const handleLevelComplete = useCallback(() => {
    const levelId = currentLevel!.id;
    const wasFirstTime = !gameState.completedLevelIds.includes(levelId);
    
    // Save this value BEFORE updating state, so SuccessScreen gets the correct value
    setIsFirstTimeCompletion(wasFirstTime);
    
    // Use ref to get the current value (avoids stale closure issue with setTimeout)
    const usedHints = hintsUsedRef.current;
    
    // Only give rewards for first-time completions
    const baseReward = wasFirstTime ? REWARD_BASE : 0;
    const noHintBonus = wasFirstTime && !usedHints ? REWARD_NO_HINTS_BONUS : 0;
    const totalReward = baseReward + noHintBonus;

    // Clear saved level progress on completion
    clearLevelProgress(levelId);

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + totalReward,
      completedLevelIds: [...new Set([...prev.completedLevelIds, levelId])],
      currentLevelId: Math.min(levelId + 1, levels.length),
    }));
    setShowSuccess(true);
    setScreen("success");
  }, [currentLevel, gameState.completedLevelIds]);

  const onBubbleClick = useCallback((bubbleId: string) => {
    const bubble = bubbles.find((b) => b.id === bubbleId);
    if (!bubble || bubble.used) return;

    // Find next empty letter slot
    const nextEmptySlotIndex = slots.findIndex(
      (s) => s.type === "letter" && s.value === null
    );
    if (nextEmptySlotIndex === -1) return;

    const slot = slots[nextEmptySlotIndex];
    if (slot.answerIndex === undefined) return;

    // Calculate new slots state
    const newSlots = slots.map((s, idx) =>
      idx === nextEmptySlotIndex ? { ...s, value: bubble.letter } : s
    );

    // Update slot
    setSlots(newSlots);

    // Mark bubble as used
    setBubbles((prev) =>
      prev.map((b) => (b.id === bubbleId ? { ...b, used: true } : b))
    );

    // Add to history
    setInputHistory((prev) => [
      ...prev,
      { slotAnswerIndex: slot.answerIndex!, bubbleId },
    ]);

    // Clear message
    setMessage(null);
    setMessageType(null);

    // Check if all slots are now filled - auto submit
    const letterSlots = newSlots.filter((s) => s.type === "letter");
    const allFilled = letterSlots.every((s) => s.value !== null);
    
    if (allFilled) {
      // Get user's answer
      const userAnswer = letterSlots.map((s) => s.value).join("");

      // Check exact match
      if (userAnswer === answerLetters) {
        // Success! - use setTimeout to ensure state updates complete first
        setTimeout(() => {
          handleLevelComplete();
        }, 0);
        return;
      }

      // Check if letters are correct but order is wrong
      const sortedUser = [...userAnswer].sort().join("");
      const sortedAnswer = [...answerLetters].sort().join("");

      if (sortedUser === sortedAnswer) {
        setMessage("קרוב מאוד! האותיות נכונות אבל הסדר לא נכון");
        setMessageType("warning");
        return;
      }

      // Check if only one letter is wrong by position
      let wrongCount = 0;
      for (let i = 0; i < userAnswer.length; i++) {
        if (userAnswer[i] !== answerLetters[i]) {
          wrongCount++;
        }
      }

      if (wrongCount === 1) {
        setMessage("כמעט! רק אות אחת לא נכונה");
        setMessageType("warning");
        return;
      }

      setMessage("לא נכון, נסו שוב");
      setMessageType("error");
    }
  }, [bubbles, slots, answerLetters, handleLevelComplete]);

  const onSlotClick = useCallback((slotIndex: number) => {
    const slot = slots[slotIndex];
    if (slot.type !== "letter" || slot.value === null) return;

    // Find the history item for this slot
    const historyItem = inputHistory.find(h => h.slotAnswerIndex === slot.answerIndex);
    if (!historyItem) return;

    // Clear the slot
    setSlots((prev) =>
      prev.map((s, idx) => idx === slotIndex ? { ...s, value: null } : s)
    );

    // Restore bubble
    setBubbles((prev) =>
      prev.map((b) => b.id === historyItem.bubbleId ? { ...b, used: false } : b)
    );

    // Remove from history
    setInputHistory((prev) => prev.filter(h => h.slotAnswerIndex !== slot.answerIndex));
    setMessage(null);
    setMessageType(null);
  }, [slots, inputHistory]);

  const onClearAll = useCallback(() => {
    // Filter only non-hint items
    const nonHintHistory = inputHistory.filter(h => !h.isHint);
    const hintHistory = inputHistory.filter(h => h.isHint);
    
    if (nonHintHistory.length === 0) return;

    // Get hint slot indices to preserve
    const hintSlotIndices = new Set(hintHistory.map(h => h.slotAnswerIndex));

    // Clear only non-hint letter slots
    setSlots((prev) =>
      prev.map((s) => {
        if (s.type === "letter" && s.answerIndex !== undefined && !hintSlotIndices.has(s.answerIndex)) {
          return { ...s, value: null };
        }
        return s;
      })
    );

    // Restore only non-hint bubbles
    const nonHintBubbleIds = nonHintHistory.map(h => h.bubbleId);
    setBubbles((prev) =>
      prev.map((b) => nonHintBubbleIds.includes(b.id) ? { ...b, used: false } : b)
    );

    // Keep only hint history items
    setInputHistory(hintHistory);
    setMessage(null);
    setMessageType(null);
  }, [inputHistory]);

  const onSubmit = useCallback(() => {
    // Check if all slots are filled
    const letterSlots = slots.filter((s) => s.type === "letter");
    const allFilled = letterSlots.every((s) => s.value !== null);

    if (!allFilled) {
      setMessage("עוד לא מולאו כל האותיות");
      setMessageType("warning");
      return;
    }

    // Get user's answer
    const userAnswer = letterSlots.map((s) => s.value).join("");

    // Check exact match
    if (userAnswer === answerLetters) {
      // Success!
      handleLevelComplete();
      return;
    }

    // Check if letters are correct but order is wrong (multiset comparison)
    const sortedUser = [...userAnswer].sort().join("");
    const sortedAnswer = [...answerLetters].sort().join("");

    if (sortedUser === sortedAnswer) {
      setMessage("קרוב מאוד! האותיות נכונות אבל הסדר לא נכון");
      setMessageType("warning");
      return;
    }

    // Check if only one letter is wrong by position
    let wrongCount = 0;
    for (let i = 0; i < userAnswer.length; i++) {
      if (userAnswer[i] !== answerLetters[i]) {
        wrongCount++;
      }
    }

    if (wrongCount === 1) {
      setMessage("כמעט! רק אות אחת לא נכונה");
      setMessageType("warning");
      return;
    }

    setMessage("לא נכון, נסו שוב");
    setMessageType("error");
  }, [slots, answerLetters, handleLevelComplete]);

  // Hint: Reveal one letter (4 coins)
  const onHintRevealLetter = useCallback(() => {
    if (gameState.coins < HINT_COST_REVEAL_LETTER) {
      setMessage("אין מספיק מטבעות");
      setMessageType("error");
      return;
    }

    // Find empty letter slots
    const emptySlotIndices: number[] = [];
    slots.forEach((slot, idx) => {
      if (slot.type === "letter" && slot.value === null) {
        emptySlotIndices.push(idx);
      }
    });

    if (emptySlotIndices.length === 0) {
      setMessage("כל האותיות כבר מולאו");
      setMessageType("warning");
      return;
    }

    setHintsUsedInLevel(true);
    hintsUsedRef.current = true;

    // Persist hints used for this level
    if (currentLevel) {
      setGameState((prev) => ({
        ...prev,
        hintsUsedByLevel: { ...prev.hintsUsedByLevel, [currentLevel.id]: true },
      }));
    }

    // Pick 1 random empty slot
    const randomSlotIdx = emptySlotIndices[Math.floor(Math.random() * emptySlotIndices.length)];
    const slot = slots[randomSlotIdx];
    if (slot.answerIndex === undefined) return;

    const correctLetter = answerLetters[slot.answerIndex];

    // Find an unused bubble with this letter (prefer real, non-fake)
    const newBubbles = [...bubbles];
    let bubbleIndex = newBubbles.findIndex(
      (b) => !b.used && b.letter === correctLetter && !b.isFake
    );
    
    if (bubbleIndex === -1) {
      bubbleIndex = newBubbles.findIndex((b) => !b.used && b.letter === correctLetter);
    }

    if (bubbleIndex !== -1) {
      const newSlots = [...slots];
      newSlots[randomSlotIdx] = { ...slot, value: correctLetter };
      newBubbles[bubbleIndex] = { ...newBubbles[bubbleIndex], used: true };

      const newHistory = [
        ...inputHistory,
        { slotAnswerIndex: slot.answerIndex!, bubbleId: newBubbles[bubbleIndex].id, isHint: true },
      ];

      setSlots(newSlots);
      setBubbles(newBubbles);
      setInputHistory(newHistory);

      // Save level progress after hint
      if (currentLevel) {
        saveLevelProgress(currentLevel.id, {
          slots: newSlots,
          bubbles: newBubbles,
          inputHistory: newHistory,
        });
      }
    }

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - HINT_COST_REVEAL_LETTER,
    }));
    setMessage(null);
    setMessageType(null);
  }, [gameState.coins, slots, bubbles, answerLetters, inputHistory, currentLevel]);

  // Hint: Remove fake letters (7 coins)
  const onHintRemoveFakes = useCallback(() => {
    if (gameState.coins < HINT_COST_REMOVE_FAKES) {
      setMessage("אין מספיק מטבעות");
      setMessageType("error");
      return;
    }

    // Check if there are any visible fake bubbles
    const visibleFakes = bubbles.filter(b => b.isFake && !b.used);
    if (visibleFakes.length === 0) {
      setMessage("אין אותיות מיותרות להסיר");
      setMessageType("warning");
      return;
    }

    setHintsUsedInLevel(true);
    hintsUsedRef.current = true;

    // Persist hints used for this level
    if (currentLevel) {
      setGameState((prev) => ({
        ...prev,
        hintsUsedByLevel: { ...prev.hintsUsedByLevel, [currentLevel.id]: true },
        coins: prev.coins - HINT_COST_REMOVE_FAKES,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        coins: prev.coins - HINT_COST_REMOVE_FAKES,
      }));
    }

    // Mark all fake bubbles as used (hide them)
    const newBubbles = bubbles.map((b) => (b.isFake && !b.used ? { ...b, used: true } : b));
    setBubbles(newBubbles);

    // Save level progress after hint
    if (currentLevel) {
      saveLevelProgress(currentLevel.id, {
        slots,
        bubbles: newBubbles,
        inputHistory,
      });
    }

    setMessage("האותיות המיותרות הוסרו!");
    setMessageType("success");
  }, [gameState.coins, bubbles, slots, inputHistory, currentLevel]);

  // Hint: Solve all (18 coins)
  const onHintSolveAll = useCallback(() => {
    if (gameState.coins < HINT_COST_SOLVE_ALL) {
      setMessage("אין מספיק מטבעות");
      setMessageType("error");
      return;
    }

    setHintsUsedInLevel(true);
    hintsUsedRef.current = true;

    // Deduct coins and persist hints used for this level
    if (currentLevel) {
      setGameState((prev) => ({
        ...prev,
        coins: prev.coins - HINT_COST_SOLVE_ALL,
        hintsUsedByLevel: { ...prev.hintsUsedByLevel, [currentLevel.id]: true },
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        coins: prev.coins - HINT_COST_SOLVE_ALL,
      }));
    }

    // Fill all slots with correct letters
    const newSlots = [...slots];
    const newBubbles = [...bubbles];
    const newHistory = [...inputHistory];

    slots.forEach((slot, slotIdx) => {
      if (slot.type === "letter" && slot.value === null && slot.answerIndex !== undefined) {
        const correctLetter = answerLetters[slot.answerIndex];
        
        // Find an unused bubble with this letter
        let bubbleIndex = newBubbles.findIndex(
          (b) => !b.used && b.letter === correctLetter && !b.isFake
        );
        
        if (bubbleIndex === -1) {
          bubbleIndex = newBubbles.findIndex((b) => !b.used && b.letter === correctLetter);
        }

        if (bubbleIndex !== -1) {
          newSlots[slotIdx] = { ...slot, value: correctLetter };
          newBubbles[bubbleIndex] = { ...newBubbles[bubbleIndex], used: true };
          newHistory.push({
            slotAnswerIndex: slot.answerIndex,
            bubbleId: newBubbles[bubbleIndex].id,
          });
        }
      }
    });

    setSlots(newSlots);
    setBubbles(newBubbles);
    setInputHistory(newHistory);
    setMessage(null);
    setMessageType(null);

    // After a short delay, complete the level
    setTimeout(() => {
      handleLevelComplete();
    }, 500);
  }, [gameState.coins, slots, bubbles, answerLetters, inputHistory, handleLevelComplete]);

  // Keep legacy onHint for compatibility (will be removed later)
  const onHint = onHintRevealLetter;

  const onPlay = useCallback(() => {
    if (!audioRef.current) {
      // Create audio element on first play (required for iOS)
      audioRef.current = new Audio();
    }
    
    // Always update the src to current level's audio
    const currentAudioUrl = currentLevel?.audioUrl || "";
    if (audioRef.current.src !== window.location.origin + currentAudioUrl) {
      audioRef.current.src = currentAudioUrl;
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setAudioProgress(0);
      setActivePianoKeys([]);
      if (pianoIntervalRef.current) {
        clearInterval(pianoIntervalRef.current);
        pianoIntervalRef.current = null;
      }
      return;
    }

    // Play audio
    audioRef.current.play().catch((e) => {
      console.log("Audio play failed:", e);
    });

    setIsPlaying(true);

    // Get audio duration when metadata loads
    audioRef.current.onloadedmetadata = () => {
      setAudioDuration(audioRef.current?.duration || 0);
    };

    // Update progress as audio plays
    audioRef.current.ontimeupdate = () => {
      if (audioRef.current && audioRef.current.duration) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setAudioProgress(progress);
      }
    };

    // Start piano animation
    pianoIntervalRef.current = setInterval(() => {
      const numKeys = Math.floor(Math.random() * 5) + 2; // 2-6 keys
      const keys: number[] = [];
      for (let i = 0; i < numKeys; i++) {
        keys.push(Math.floor(Math.random() * 24)); // 24 keys (2 octaves)
      }
      setActivePianoKeys(keys);
    }, 120);

    // Handle audio end
    audioRef.current.onended = () => {
      setIsPlaying(false);
      setAudioProgress(100);
      setActivePianoKeys([]);
      if (pianoIntervalRef.current) {
        clearInterval(pianoIntervalRef.current);
        pianoIntervalRef.current = null;
      }
    };
  }, [isPlaying, currentLevel]);

  const nextLevel = useCallback(() => {
    if (!currentLevel) return;
    const nextLevelId = currentLevel.id + 1;
    if (nextLevelId > levels.length) {
      setScreen("home");
      return;
    }
    initializeLevel(nextLevelId);
  }, [currentLevel, initializeLevel]);

  const previousLevel = useCallback(() => {
    if (!currentLevel || currentLevel.id <= 1) return;
    initializeLevel(currentLevel.id - 1);
  }, [currentLevel, initializeLevel]);

  const openLevelsScreen = useCallback(() => {
    setScreen("levels");
  }, []);

  const selectLevel = useCallback((levelId: number) => {
    if (levelId <= maxUnlockedLevel) {
      initializeLevel(levelId);
    }
  }, [maxUnlockedLevel, initializeLevel]);

  const goHome = useCallback(() => {
    setScreen("home");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setActivePianoKeys([]);
    if (pianoIntervalRef.current) {
      clearInterval(pianoIntervalRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pianoIntervalRef.current) {
        clearInterval(pianoIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Computed stage values
  const currentStageNumber = currentLevel ? getStageNumber(currentLevel.id) : 1;
  const currentIsLastSongInStage = currentLevel ? isLastSongInStage(currentLevel.id) : false;

  // Check if there are visible fake bubbles
  const hasFakeBubbles = bubbles.some(b => b.isFake && !b.used);

  // Full reset function - clears all game data
  const fullReset = useCallback(() => {
    // 1. Clear main game state
    localStorage.removeItem(STORAGE_KEY);
    
    // 2. Clear new game notice preference
    localStorage.removeItem(HIDE_NOTICE_KEY);
    
    // 3. Clear all level progress
    levels.forEach((level) => {
      localStorage.removeItem(`${LEVEL_PROGRESS_KEY}-${level.id}`);
    });
    
    // 4. Reset state to initial values
    const initialState: GameState = {
      coins: 0,
      currentLevelId: 1,
      completedLevelIds: [],
      hintsUsedByLevel: {},
    };
    setGameState(initialState);
    setScreen("home");
    setHintsUsedInLevel(false);
    setCurrentLevel(null);
    setSlots([]);
    setBubbles([]);
    setInputHistory([]);
    setMessage("");
    setMessageType("warning");
    
    // 5. Show success toast
    toast.success("המשחק אופס בהצלחה. מתחילים מחדש! 🎮");
  }, []);

  return {
    // State
    screen,
    gameState,
    currentLevel,
    slots,
    bubbles,
    message,
    messageType,
    isPlaying,
    activePianoKeys,
    showSuccess,
    totalLevels: levels.length,
    isFirstTime,
    maxUnlockedLevel,
    levels,
    audioProgress,
    audioDuration,
    hintsUsedInLevel,
    showNewGameNotice,
    isFirstTimeCompletion,
    currentQuestionType,

    // Stage info
    currentStageNumber,
    currentIsLastSongInStage,

    // Actions
    startGame,
    continueGame,
    restartGame,
    handleNewGameNoticeClose,
    onBubbleClick,
    onSlotClick,
    onClearAll,
    onSubmit,
    onHint,
    onHintRevealLetter,
    onHintRemoveFakes,
    onHintSolveAll,
    onPlay,
    nextLevel,
    previousLevel,
    openLevelsScreen,
    selectLevel,
    goHome,
    fullReset,

    // Computed
    hasFilledSlots: inputHistory.some(h => !h.isHint),
    hasFakeBubbles,
  };
};
