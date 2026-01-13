import { useState, useEffect, useCallback, useRef } from "react";
import { Level, levels, getStageNumber, isLastSongInStage } from "@/data/levels";

// Hebrew letters including final forms
const HEBREW_LETTERS = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ";
const HEBREW_LETTERS_NO_FINAL = "אבגדהוזחטיכלמנסעפצקרשת";

// Constants for game economy
const TOTAL_BUBBLES = 14;
const HINT_COST_REVEAL_LETTER = 4;
const HINT_COST_REMOVE_FAKES = 7;
const HINT_COST_SOLVE_ALL = 18;
const REWARD_BASE = 10;
const REWARD_NO_HINTS_BONUS = 5;

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
}

interface GameState {
  coins: number;
  currentLevelId: number;
  completedLevelIds: number[];
}

const STORAGE_KEY = "guess-the-song-state";
const HIDE_NOTICE_KEY = "hide-new-game-notice";

const loadGameState = (): GameState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
  return {
    coins: 0,
    currentLevelId: 1,
    completedLevelIds: [],
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

  // Computed values
  const isFirstTime = gameState.completedLevelIds.length === 0;
  const maxUnlockedLevel = gameState.completedLevelIds.length > 0
    ? Math.max(...gameState.completedLevelIds) + 1
    : 1;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pianoIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    setInputHistory([]);
    setShowSuccess(false);
    setHintsUsedInLevel(false);
    setIsFirstTimeCompletion(false);

    // Create slots from title
    const newSlots: Slot[] = [];
    let answerIdx = 0;
    const lettersOnly: string[] = [];

    for (const char of level.title) {
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
    
    // Only give rewards for first-time completions
    const baseReward = wasFirstTime ? REWARD_BASE : 0;
    const noHintBonus = wasFirstTime && !hintsUsedInLevel ? REWARD_NO_HINTS_BONUS : 0;
    const totalReward = baseReward + noHintBonus;

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + totalReward,
      completedLevelIds: [...new Set([...prev.completedLevelIds, levelId])],
      currentLevelId: Math.min(levelId + 1, levels.length),
    }));
    setShowSuccess(true);
    setScreen("success");
  }, [hintsUsedInLevel, currentLevel, gameState.completedLevelIds]);

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
    if (inputHistory.length === 0) return;

    // Clear all letter slots
    setSlots((prev) =>
      prev.map((s) => s.type === "letter" ? { ...s, value: null } : s)
    );

    // Restore all used bubbles from history
    const usedBubbleIds = inputHistory.map(h => h.bubbleId);
    setBubbles((prev) =>
      prev.map((b) => usedBubbleIds.includes(b.id) ? { ...b, used: false } : b)
    );

    // Clear history
    setInputHistory([]);
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

      setSlots(newSlots);
      setBubbles(newBubbles);
      setInputHistory((prev) => [
        ...prev,
        { slotAnswerIndex: slot.answerIndex!, bubbleId: newBubbles[bubbleIndex].id },
      ]);
    }

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - HINT_COST_REVEAL_LETTER,
    }));
    setMessage(null);
    setMessageType(null);
  }, [gameState.coins, slots, bubbles, answerLetters]);

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

    // Mark all fake bubbles as used (hide them)
    setBubbles((prev) =>
      prev.map((b) => (b.isFake && !b.used ? { ...b, used: true } : b))
    );

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - HINT_COST_REMOVE_FAKES,
    }));
    setMessage("האותיות המיותרות הוסרו!");
    setMessageType("success");
  }, [gameState.coins, bubbles]);

  // Hint: Solve all (18 coins)
  const onHintSolveAll = useCallback(() => {
    if (gameState.coins < HINT_COST_SOLVE_ALL) {
      setMessage("אין מספיק מטבעות");
      setMessageType("error");
      return;
    }

    setHintsUsedInLevel(true);

    // Deduct coins first
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - HINT_COST_SOLVE_ALL,
    }));

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

    // Computed
    hasFilledSlots: inputHistory.length > 0,
    hasFakeBubbles,
  };
};
