import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, Pause, Lightbulb, Type, Eraser, Sparkles, Trash2 } from 'lucide-react';
import { Piano } from '@/components/Piano';
import { LetterSlots } from '@/components/LetterSlots';
import { LetterBubbles } from '@/components/LetterBubbles';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Button } from '@/components/ui/button';
import type { Slot, Bubble } from '@/hooks/useGameState';

interface ClassicTutorialScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

// Tutorial song: "יונתן הקטן"
const TUTORIAL_SONG = {
  title: "יונתן הקטן",
  audioUrl: "/audio/tutorial.m4a",
  letters: ['י', 'ו', 'נ', 'ת', 'ן', 'ה', 'ק', 'ט', 'ן'],
  fakeLetters: ['א', 'ב', 'ג', 'ד', 'מ'],
};

type TutorialStep = 'intro' | 'play-song' | 'fill-letters' | 'hints' | 'complete';

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ClassicTutorialScreen: React.FC<ClassicTutorialScreenProps> = ({ onComplete, onSkip }) => {
  const { safeAreaTop } = useDeviceType();
  const [step, setStep] = useState<TutorialStep>('intro');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePianoKeys, setActivePianoKeys] = useState<number[]>([]);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize slots and bubbles using Classic mode types
  useEffect(() => {
    // Create slots for "יונתן הקטן" using Classic mode Slot type
    const initSlots: Slot[] = [
      // יונתן (5 letters)
      { type: "letter", answerIndex: 0, value: null },  // י
      { type: "letter", answerIndex: 1, value: null },  // ו
      { type: "letter", answerIndex: 2, value: null },  // נ
      { type: "letter", answerIndex: 3, value: null },  // ת
      { type: "letter", answerIndex: 4, value: null },  // ן
      // space
      { type: "fixed", char: " ", value: " " },
      // הקטן (4 letters)
      { type: "letter", answerIndex: 5, value: null },  // ה
      { type: "letter", answerIndex: 6, value: null },  // ק
      { type: "letter", answerIndex: 7, value: null },  // ט
      { type: "letter", answerIndex: 8, value: null },  // ן
    ];

    // Shuffle letters with fakes using Classic mode Bubble type
    const allLetters = [...TUTORIAL_SONG.letters, ...TUTORIAL_SONG.fakeLetters];
    const shuffledLetters = shuffleArray(allLetters);

    const initBubbles: Bubble[] = shuffledLetters.map((letter, index) => {
      const isFake = TUTORIAL_SONG.fakeLetters.includes(letter);
      return {
        id: isFake ? `fake-${index}` : `real-${index}`,
        letter,
        isFake,
        used: false,
      };
    });

    setSlots(initSlots);
    setBubbles(initBubbles);
  }, []);

  // Check if answer is correct
  const checkAnswer = useCallback(() => {
    const letterSlots = slots.filter(s => s.type === "letter");
    const allFilled = letterSlots.every(s => s.value !== null);
    
    if (!allFilled) return false;

    const userAnswer = letterSlots.map(s => s.value).join('');
    const correctAnswer = TUTORIAL_SONG.letters.join('');
    
    return userAnswer === correctAnswer;
  }, [slots]);

  // Handle bubble click - uses Classic mode logic
  const onBubbleClick = useCallback((bubbleId: string) => {
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble || bubble.used) return;

    // Find next empty letter slot
    const nextEmptySlotIndex = slots.findIndex(s => s.type === "letter" && s.value === null);
    if (nextEmptySlotIndex === -1) return;

    setSlots(prev => prev.map((s, idx) =>
      idx === nextEmptySlotIndex ? { ...s, value: bubble.letter } : s
    ));
    setBubbles(prev => prev.map(b =>
      b.id === bubbleId ? { ...b, used: true } : b
    ));
  }, [bubbles, slots]);

  // Handle slot click (remove letter) - uses slot index like Classic mode
  const onSlotClick = useCallback((slotIndex: number) => {
    const slot = slots[slotIndex];
    if (!slot || slot.type !== "letter" || slot.value === null) return;

    // Find which bubble was used for this slot (match by letter, find first used one with this letter)
    const usedBubble = bubbles.find(b => b.used && b.letter === slot.value);
    
    if (usedBubble) {
      setBubbles(prev => prev.map(b =>
        b.id === usedBubble.id ? { ...b, used: false } : b
      ));
    }
    
    setSlots(prev => prev.map((s, idx) =>
      idx === slotIndex ? { ...s, value: null } : s
    ));
  }, [slots, bubbles]);

  // Audio handling
  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(TUTORIAL_SONG.audioUrl);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      if (!hasPlayedOnce) {
        setHasPlayedOnce(true);
        if (step === 'play-song') {
          setTimeout(() => setStep('fill-letters'), 2000);
        }
      }
    }
  }, [isPlaying, hasPlayedOnce, step]);

  // Animate piano keys while playing
  useEffect(() => {
    if (!isPlaying) {
      setActivePianoKeys([]);
      return;
    }

    const interval = setInterval(() => {
      const randomKeys = Array.from({ length: 2 }, () => Math.floor(Math.random() * 12));
      setActivePianoKeys(randomKeys);
    }, 300);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Check answer when slots change
  useEffect(() => {
    const letterSlots = slots.filter(s => s.type === "letter");
    const allFilled = letterSlots.every(s => s.value !== null);
    
    if (allFilled && letterSlots.length > 0 && step === 'fill-letters') {
      // Direct answer check to avoid closure issues
      const userAnswer = letterSlots.map(s => s.value).join('');
      const correctAnswer = TUTORIAL_SONG.letters.join('');
      
      if (userAnswer === correctAnswer) {
        setStep('hints');
      }
    }
  }, [slots, step]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-advance from intro after a delay
  useEffect(() => {
    if (step === 'intro') {
      const timer = setTimeout(() => setStep('play-song'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const getStepMessage = () => {
    switch (step) {
      case 'intro':
        return {
          icon: '🎓',
          title: 'ברוך הבא להדרכה!',
          subtitle: 'לפעמים צריך לנחש את שם השיר ולפעמים את שם האמן',
        };
      case 'play-song':
        return {
          icon: '🎵',
          title: 'לחץ על כפתור הנגינה',
          subtitle: 'כדי לשמוע את השיר',
        };
      case 'fill-letters':
        return {
          icon: '✏️',
          title: 'מצוין! עכשיו לחץ על האותיות',
          subtitle: 'כדי להרכיב את שם השיר',
        };
      case 'hints':
        return {
          icon: '💡',
          title: 'רמזים יכולים לעזור!',
          subtitle: 'כשנתקעים, אפשר להשתמש במטבעות לרמזים',
        };
      case 'complete':
        return {
          icon: '🎉',
          title: 'מעולה! הצלחת!',
          subtitle: 'עכשיו אתה מוכן למשחק',
        };
    }
  };

  const stepMessage = getStepMessage();

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5 safe-area-bottom"
      style={{ paddingTop: `${Math.max(safeAreaTop + 16, 56)}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 mb-4">
        <button
          onClick={onSkip}
          className="p-2 rounded-full glass-card hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">🎓 הדרכה</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Tutorial Message */}
      <div className="mx-6 mb-4">
        <div className="glass-card p-4 border-2 border-primary/30 bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{stepMessage.icon}</div>
            <div>
              <h3 className="font-bold text-lg">{stepMessage.title}</h3>
              <p className="text-muted-foreground text-sm">{stepMessage.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important tip - only show in intro */}
      {step === 'intro' && (
        <div className="mx-6 mb-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold text-amber-600 dark:text-amber-400">טיפ חשוב: </span>
              <span className="text-muted-foreground">
                לפעמים צריך לנחש את שם השיר ולפעמים את שם האמן!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hints explanation - only show in hints step */}
      {step === 'hints' && (
        <div className="mx-6 mb-4">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-primary" />
              <span>גילוי אות אחת</span>
              <span className="mr-auto text-amber-500 font-bold">4🪙</span>
            </div>
            <div className="flex items-center gap-3">
              <Eraser className="w-5 h-5 text-orange-400" />
              <span>הסרת אותיות מזויפות</span>
              <span className="mr-auto text-amber-500 font-bold">7🪙</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>פתרון מלא</span>
              <span className="mr-auto text-amber-500 font-bold">18🪙</span>
            </div>
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-muted-foreground" />
              <span>ניקוי האותיות</span>
              <span className="mr-auto text-green-500 font-bold">חינם</span>
            </div>
            <p className="text-sm text-muted-foreground text-center pt-2 border-t border-border">
              💰 מטבעות מרוויחים על פתרון שירים!
            </p>
          </div>
        </div>
      )}

      {/* Piano and Play Button */}
      <div className="px-6 mb-4">
        <Piano activeKeys={activePianoKeys} />
        <div className="flex justify-center mt-4">
          <button
            onClick={togglePlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              step === 'play-song' && !hasPlayedOnce 
                ? 'bg-primary animate-pulse shadow-lg shadow-primary/50' 
                : 'glass-card hover:bg-primary/20'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Play className="w-8 h-8 ml-1 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-4">
        <span className="text-lg font-medium">🎵 נחש/י את שם השיר</span>
      </div>

      {/* Letter Slots - uses Classic mode LetterSlots component */}
      <div className="px-4 mb-4">
        <LetterSlots 
          slots={slots} 
          onSlotClick={onSlotClick}
        />
      </div>

      {/* Letter Bubbles - uses Classic mode LetterBubbles component */}
      <div className="px-4 flex-1">
        <LetterBubbles 
          bubbles={bubbles} 
          onBubbleClick={onBubbleClick}
        />
      </div>

      {/* Bottom Actions */}
      <div className="px-6 pb-6 mt-auto">
        {step === 'complete' ? (
          <Button 
            onClick={onComplete} 
            className="w-full py-6 text-lg"
          >
            בוא נתחיל! 🚀
          </Button>
        ) : step === 'hints' ? (
          <Button 
            onClick={() => setStep('complete')} 
            className="w-full py-6 text-lg"
          >
            הבנתי! 👍
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="w-full"
          >
            דלג על ההדרכה
          </Button>
        )}
      </div>
    </div>
  );
};
