import { useState, useEffect, useCallback, useRef } from "react";
import { Level, levels } from "@/data/levels";

// Hebrew letters including final forms
const HEBREW_LETTERS = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ";
const HEBREW_LETTERS_NO_FINAL = "אבגדהוזחטיכלמנסעפצקרשת";

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
    coins: 10,
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

    setCurrentLevel(level);
    setMessage(null);
    setMessageType(null);
    setInputHistory([]);
    setShowSuccess(false);

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

    // Create bubbles with real letters + fake letters
    const realBubbles: Bubble[] = lettersOnly.map((letter, idx) => ({
      id: `real-${idx}`,
      letter,
      isFake: false,
      used: false,
    }));

    // Calculate fake letters needed (at least 30% of total should be fake)
    const minFakeCount = Math.ceil(lettersOnly.length * 0.3);
    const fakeCount = Math.max(level.extraLettersCount, minFakeCount);

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
    initializeLevel(1);
  }, [initializeLevel]);

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
        // Success!
        setGameState((prev) => ({
          ...prev,
          coins: prev.coins + 5,
          completedLevelIds: [...new Set([...prev.completedLevelIds, currentLevel!.id])],
          currentLevelId: Math.min(currentLevel!.id + 1, levels.length),
        }));
        setShowSuccess(true);
        setScreen("success");
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
  }, [bubbles, slots, answerLetters, currentLevel]);

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
      setGameState((prev) => ({
        ...prev,
        coins: prev.coins + 5,
        completedLevelIds: [...new Set([...prev.completedLevelIds, currentLevel!.id])],
        currentLevelId: Math.min(currentLevel!.id + 1, levels.length),
      }));
      setShowSuccess(true);
      setScreen("success");
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
  }, [slots, answerLetters, currentLevel]);

  const onHint = useCallback(() => {
    if (gameState.coins < 3) {
      setMessage("אין מספיק מטבעות");
      setMessageType("error");
      return;
    }

    // Find empty letter slots that can be filled
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

    // Pick up to 2 random empty slots
    const shuffledEmpty = shuffleArray(emptySlotIndices);
    const slotsToFill = shuffledEmpty.slice(0, 2);

    // Deduct coins
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - 3,
    }));

    // Fill slots with correct letters
    const newSlots = [...slots];
    const newBubbles = [...bubbles];
    const newHistory = [...inputHistory];

    slotsToFill.forEach((slotIdx) => {
      const slot = newSlots[slotIdx];
      if (slot.answerIndex === undefined) return;

      const correctLetter = answerLetters[slot.answerIndex];

      // Find an unused bubble with this letter (prefer real, non-fake)
      const bubbleIndex = newBubbles.findIndex(
        (b) => !b.used && b.letter === correctLetter && !b.isFake
      );
      
      const actualBubbleIndex = bubbleIndex !== -1 
        ? bubbleIndex 
        : newBubbles.findIndex((b) => !b.used && b.letter === correctLetter);

      if (actualBubbleIndex !== -1) {
        newSlots[slotIdx] = { ...slot, value: correctLetter };
        newBubbles[actualBubbleIndex] = { ...newBubbles[actualBubbleIndex], used: true };
        newHistory.push({
          slotAnswerIndex: slot.answerIndex,
          bubbleId: newBubbles[actualBubbleIndex].id,
        });
      }
    });

    setSlots(newSlots);
    setBubbles(newBubbles);
    setInputHistory(newHistory);
    setMessage(null);
    setMessageType(null);
  }, [gameState.coins, slots, bubbles, answerLetters, inputHistory]);

  const onPlay = useCallback(() => {
    if (!audioRef.current) {
      // Create audio element on first play (required for iOS)
      audioRef.current = new Audio();
      audioRef.current.src = currentLevel?.audioUrl || "";
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

    // Actions
    startGame,
    continueGame,
    restartGame,
    onBubbleClick,
    onSlotClick,
    onClearAll,
    onSubmit,
    onHint,
    onPlay,
    nextLevel,
    previousLevel,
    openLevelsScreen,
    selectLevel,
    goHome,

    // Computed
    hasFilledSlots: inputHistory.length > 0,
  };
};
