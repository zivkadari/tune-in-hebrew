import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, Pause, Lightbulb, Calendar, SkipForward } from 'lucide-react';
import { Piano } from '@/components/Piano';
import { DailyLetterSlots } from '@/components/DailyLetterSlots';
import { DailyLetterBubbles } from '@/components/DailyLetterBubbles';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Button } from '@/components/ui/button';
import type { Slot, Bubble } from '@/types/dailyTimeAttack';

interface TutorialScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

// Tutorial song: "יונתן הקטן"
const TUTORIAL_SONG = {
  title: "יונתן הקטן",
  audioUrl: "/audio/tutorial.m4a",
  answerPattern: [5, 4], // יונתן הקטן
  letters: ['י', 'ו', 'נ', 'ת', 'ן', 'ה', 'ק', 'ט', 'ן'],
  fakeLetters: ['א', 'ב', 'ג', 'ד', 'מ', 'ש'],
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

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onComplete, onSkip }) => {
  const { safeAreaTop } = useDeviceType();
  const [step, setStep] = useState<TutorialStep>('intro');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePianoKeys, setActivePianoKeys] = useState<number[]>([]);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize slots and bubbles
  useEffect(() => {
    const initSlots: Slot[] = [];
    let slotId = 0;

    TUTORIAL_SONG.answerPattern.forEach((wordLength, wordIndex) => {
      for (let i = 0; i < wordLength; i++) {
        initSlots.push({ id: slotId++, letter: null, bubbleId: null, isSpace: false });
      }
      // Add space between words (except after last word)
      if (wordIndex < TUTORIAL_SONG.answerPattern.length - 1) {
        initSlots.push({ id: slotId++, letter: null, bubbleId: null, isSpace: true });
      }
    });

    // Shuffle letters with fakes
    const allLetters = [...TUTORIAL_SONG.letters, ...TUTORIAL_SONG.fakeLetters];
    const shuffledLetters = shuffleArray(allLetters);

    const initBubbles: Bubble[] = shuffledLetters.map((letter, index) => ({
      id: index,
      letter,
      isUsed: false,
    }));

    setSlots(initSlots);
    setBubbles(initBubbles);
  }, []);

  // Check if answer is correct
  const checkAnswer = useCallback(() => {
    const nonSpaceSlots = slots.filter(s => !s.isSpace);
    const allFilled = nonSpaceSlots.every(s => s.letter !== null);
    
    if (!allFilled) return false;

    const userAnswer = nonSpaceSlots.map(s => s.letter).join('');
    const correctAnswer = TUTORIAL_SONG.letters.join('');
    
    return userAnswer === correctAnswer;
  }, [slots]);

  // Handle bubble click
  const onBubbleClick = useCallback((bubbleId: number) => {
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble || bubble.isUsed) return;

    const emptySlot = slots.find(s => !s.isSpace && s.letter === null);
    if (!emptySlot) return;

    setSlots(prev => prev.map(s =>
      s.id === emptySlot.id ? { ...s, letter: bubble.letter, bubbleId: bubble.id } : s
    ));
    setBubbles(prev => prev.map(b =>
      b.id === bubbleId ? { ...b, isUsed: true } : b
    ));

    // Check for step advancement
    if (step === 'fill-letters') {
      setTimeout(() => {
        const nonSpaceSlots = slots.filter(s => !s.isSpace);
        const filledCount = nonSpaceSlots.filter(s => s.letter !== null).length + 1;
        if (filledCount === TUTORIAL_SONG.letters.length) {
          // All filled - will check in useEffect
        }
      }, 100);
    }
  }, [bubbles, slots, step]);

  // Handle slot click (remove letter)
  const onSlotClick = useCallback((slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot || slot.isSpace || slot.letter === null) return;

    setBubbles(prev => prev.map(b =>
      b.id === slot.bubbleId ? { ...b, isUsed: false } : b
    ));
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, letter: null, bubbleId: null } : s
    ));
  }, [slots]);

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
    const nonSpaceSlots = slots.filter(s => !s.isSpace);
    const allFilled = nonSpaceSlots.every(s => s.letter !== null);
    
    if (allFilled && nonSpaceSlots.length > 0 && step === 'fill-letters') {
      if (checkAnswer()) {
        setStep('hints');
      }
    }
  }, [slots, step, checkAnswer]);

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
          subtitle: 'נתחיל עם שיר לדוגמה...',
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
          title: 'רמזים זמינים בריצה!',
          subtitle: 'כל רמז זמין פעם אחת בלבד',
        };
      case 'complete':
        return {
          icon: '🎉',
          title: 'מעולה! הצלחת!',
          subtitle: 'עכשיו אתה מוכן ל-Time Attack האמיתי',
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

      {/* Hints explanation - only show in hints step */}
      {step === 'hints' && (
        <div className="mx-6 mb-4">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span>גילוי שנת השיר</span>
              <span className="mr-auto text-muted-foreground">פעם אחת</span>
            </div>
            <div className="flex items-center gap-3">
              <SkipForward className="w-5 h-5 text-orange-400" />
              <span>דילוג לשיר הבא</span>
              <span className="mr-auto text-muted-foreground">פעם אחת</span>
            </div>
            <div className="pt-2 border-t border-border space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                ⏱️ יש לך 60 שניות לפתור 12 שירים
              </p>
              <p className="text-sm text-muted-foreground text-center">
                🏆 הריצה הרשמית נכנסת ללוח התוצאות!
              </p>
            </div>
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

      {/* Letter Slots */}
      <div className="px-4 mb-4">
        <DailyLetterSlots 
          slots={slots} 
          onSlotClick={onSlotClick}
          className={step === 'fill-letters' && hasPlayedOnce ? 'animate-pulse' : ''}
        />
      </div>

      {/* Letter Bubbles */}
      <div className="px-4 flex-1">
        <DailyLetterBubbles 
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
