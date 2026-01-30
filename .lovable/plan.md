

## תכנית: הוספת אפקטים קוליים להצלחה ולסיום שלב

### סקירה
נוסיף צלילי הצלחה למשחק:
1. **צליל ניחוש נכון** - מושמע מיד כשהמשתמש מנחש את השיר/האמן נכון
2. **צליל סיום שלב** - צליל מיוחד + הודעה כשהמשתמש מסיים שלב שלם (12 שירים) במוד הקלאסי

---

### יצירת צלילי ההצלחה

ניצור קבצי צליל באמצעות ElevenLabs Sound Effects:

| צליל | תיאור | קובץ יעד |
|------|-------|----------|
| ניחוש נכון | צליל הצלחה קצר וחיובי | `/audio/sfx/correct.mp3` |
| סיום שלב | צליל חגיגי יותר לסיום שלב | `/audio/sfx/stage-complete.mp3` |

---

### מבנה הקבצים החדשים

#### 1. `src/lib/sounds.ts` - מודול לניהול צלילים

```typescript
// ניהול צלילי המשחק עם אפשרות להשתקה

const SOUND_ENABLED_KEY = "game-sound-enabled";

// פונקציות לניהול הגדרות צליל
export const isSoundEnabled = (): boolean;
export const setSoundEnabled = (enabled: boolean): void;

// טעינה מוקדמת של צלילים לביצועים טובים
const correctSound = new Audio('/audio/sfx/correct.mp3');
const stageCompleteSound = new Audio('/audio/sfx/stage-complete.mp3');

// פונקציות להשמעת צלילים
export const playCorrectSound = (): void;
export const playStageCompleteSound = (): void;
```

---

### שינויים בקבצים קיימים

#### 2. עדכון `src/hooks/useGameState.ts`

**בפונקציה `handleLevelComplete`:**

```typescript
import { playCorrectSound, playStageCompleteSound, isSoundEnabled } from '@/lib/sounds';
import { isLastSongInStage } from '@/data/levels';

const handleLevelComplete = useCallback(() => {
  const levelId = currentLevel!.id;
  
  // השמע צליל הצלחה
  playCorrectSound();
  
  // אם זה סיום שלב - השמע צליל נוסף בהשהייה קצרה
  if (isLastSongInStage(levelId)) {
    setTimeout(() => {
      playStageCompleteSound();
    }, 500);
  }
  
  // ... המשך הקוד הקיים
}, [currentLevel, gameState.completedLevelIds]);
```

#### 3. עדכון `src/screens/SuccessScreen.tsx`

**הוספת הודעה מודגשת יותר לסיום שלב:**

הודעת הסיום כבר קיימת ("סיימת את השלב! 🏆"), אבל נוסיף אנימציה ואפקט ויזואלי משופר כשמסיימים שלב.

#### 4. עדכון `src/components/SettingsDialog.tsx`

**הוספת אפשרות להשתיק צלילים:**

```typescript
// הוספת טוגל לצלילים לצד טוגל הרטט
<div className="flex items-center justify-between">
  <Label>צלילי משחק</Label>
  <Switch 
    checked={soundEnabled} 
    onCheckedChange={setSoundEnabled}
  />
</div>
```

---

### זרימת האירועים

```text
המשתמש ממלא את האות האחרונה
         ↓
    בדיקת תשובה
         ↓
   תשובה נכונה?
    ↓         ↓
  כן          לא
   ↓           ↓
playCorrectSound()    הצג הודעת שגיאה
   ↓
isLastSongInStage?
  ↓         ↓
 כן          לא
  ↓           ↓
setTimeout →    עבור למסך הצלחה
playStageCompleteSound()
  ↓
עבור למסך הצלחה
(עם הודעה מיוחדת לסיום שלב)
```

---

### יצירת הצלילים

נשתמש ב-ElevenLabs Sound Effects API ליצירת הצלילים:

**צליל ניחוש נכון:**
- Prompt: "Short cheerful success chime, positive feedback sound, game achievement"
- Duration: 1 שנייה

**צליל סיום שלב:**
- Prompt: "Triumphant fanfare, level complete celebration, achievement unlocked, game victory sound"
- Duration: 2 שניות

---

### קבצים שישתנו

| קובץ | שינוי |
|------|-------|
| `public/audio/sfx/correct.mp3` | קובץ חדש - צליל הצלחה |
| `public/audio/sfx/stage-complete.mp3` | קובץ חדש - צליל סיום שלב |
| `src/lib/sounds.ts` | קובץ חדש - מודול צלילים |
| `src/hooks/useGameState.ts` | הוספת קריאות לצלילים ב-`handleLevelComplete` |
| `src/components/SettingsDialog.tsx` | הוספת טוגל להשתקת צלילים |

---

### הערות טכניות

1. **טעינה מוקדמת (Preloading):** הצלילים נטענים מראש כדי למנוע עיכוב בהשמעה
2. **תאימות iOS:** ב-iOS, צלילים יכולים להתנגן רק אחרי אינטראקציה ראשונה של המשתמש
3. **הגדרות נפרדות:** צלילים יהיו נפרדים מרטט (haptics) - המשתמש יכול לכבות אחד בלי השני
4. **Volume:** עוצמת הצליל תהיה מותאמת (0.5-0.7) כדי לא להיות חזקה מדי

