

## תכנית: הוספת אפקטים קוליים חינמיים להצלחה ולסיום שלב

### סקירה
נשתמש בצלילים חינמיים מ-Mixkit ו-Pixabay ונממש את מערכת הצלילים.

---

### צלילים שנוריד

| צליל | מקור | קובץ יעד |
|------|------|----------|
| ניחוש נכון | Mixkit - "Retro game notification" או "Achievement bell" | `public/audio/sfx/correct.mp3` |
| סיום שלב | Pixabay - "Victory fanfare" או "Level complete" | `public/audio/sfx/stage-complete.mp3` |

**הערה:** מכיוון שאני לא יכול להוריד קבצים ישירות, תצטרך להוריד את הצלילים ידנית מאחד האתרים הבאים ולהעלות אותם:

1. **Mixkit** (מומלץ): https://mixkit.co/free-sound-effects/win/
   - חפש "Retro game notification" או "Quick win video game notification" לצליל הצלחה
   - חפש "Video game win" לצליל סיום שלב

2. **Pixabay**: https://pixabay.com/sound-effects/search/success/
   - חפש "success" או "win" לצליל קצר
   - חפש "victory fanfare" לצליל סיום שלב

---

### קבצים שייווצרו/ישתנו

#### 1. `src/lib/sounds.ts` - מודול חדש לניהול צלילים

```typescript
const SOUND_ENABLED_KEY = "game-sound-enabled";

// בדיקת מצב הצלילים
export const isSoundEnabled = (): boolean => {
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === "true";
};

// שמירת מצב הצלילים
export const setSoundEnabled = (enabled: boolean): void => {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
};

// טעינה מוקדמת של הצלילים
const correctSound = new Audio('/audio/sfx/correct.mp3');
const stageCompleteSound = new Audio('/audio/sfx/stage-complete.mp3');

// הגדרת עוצמה
correctSound.volume = 0.6;
stageCompleteSound.volume = 0.7;

// השמעת צליל הצלחה
export const playCorrectSound = (): void => {
  if (!isSoundEnabled()) return;
  correctSound.currentTime = 0;
  correctSound.play().catch(console.error);
};

// השמעת צליל סיום שלב
export const playStageCompleteSound = (): void => {
  if (!isSoundEnabled()) return;
  stageCompleteSound.currentTime = 0;
  stageCompleteSound.play().catch(console.error);
};
```

#### 2. עדכון `src/hooks/useGameState.ts`

הוספת קריאות לצלילים ב-`handleLevelComplete`:

```typescript
import { playCorrectSound, playStageCompleteSound } from '@/lib/sounds';
import { isLastSongInStage } from '@/data/levels';

// בפונקציה handleLevelComplete:
playCorrectSound();

if (isLastSongInStage(levelId)) {
  setTimeout(() => {
    playStageCompleteSound();
  }, 500);
}
```

#### 3. עדכון `src/components/SettingsDialog.tsx`

הוספת טוגל לצלילים:

```typescript
import { Volume2 } from "lucide-react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";

// בתוך הקומפוננטה:
const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled());

const handleSoundToggle = (enabled: boolean) => {
  setSoundEnabled(enabled);
  setSoundEnabledState(enabled);
};

// בתוך ה-JSX (ליד הטוגל של הרטט):
<div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
  <div className="flex items-center gap-3">
    <Volume2 className="w-5 h-5 text-muted-foreground" />
    <span className="font-medium">צלילי משחק</span>
  </div>
  <Switch 
    checked={soundEnabled}
    onCheckedChange={handleSoundToggle}
  />
</div>
```

#### 4. עדכון `src/data/levels.ts`

הוספת פונקציה `isLastSongInStage`:

```typescript
export const isLastSongInStage = (levelId: number): boolean => {
  // Stage 1: 1-12, Stage 2: 13-24, Stage 3: 25-36, Stage 4: 37-46
  if (levelId <= 36) {
    return levelId % 12 === 0;
  }
  return levelId === 46; // Last song of stage 4
};
```

---

### סיכום קבצים

| קובץ | סוג שינוי |
|------|-----------|
| `public/audio/sfx/correct.mp3` | קובץ חדש (להעלאה ידנית) |
| `public/audio/sfx/stage-complete.mp3` | קובץ חדש (להעלאה ידנית) |
| `src/lib/sounds.ts` | קובץ חדש |
| `src/data/levels.ts` | הוספת `isLastSongInStage` |
| `src/hooks/useGameState.ts` | הוספת קריאות לצלילים |
| `src/components/SettingsDialog.tsx` | הוספת טוגל צלילים |

---

### השלב הבא

לאחר שתוריד את הצלילים מאחד האתרים, העלה אותם והתכנית תמומש. הצלילים צריכים להיות:

1. **correct.mp3** - צליל קצר (1-2 שניות), חיובי ומעודד
2. **stage-complete.mp3** - צליל ארוך יותר (2-3 שניות), חגיגי וניצחוני

