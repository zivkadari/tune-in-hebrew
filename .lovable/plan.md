

## תוכנית: שלושה שינויים קטנים

### שינוי 1: הסרת מספר כולל בשיר X/Y

**קובץ:** `src/screens/LevelScreen.tsx`

**שורות 95-97** - שינוי מ:
```tsx
<div className="text-sm text-muted-foreground">
  שיר {songNumber}/{totalLevels}
</div>
```
ל:
```tsx
<div className="text-sm text-muted-foreground">
  שיר {songNumber}
</div>
```

**אופציונלי:** אפשר גם להסיר את ה-prop `totalLevels` מהממשק אם רוצים לנקות קוד מיותר.

---

### שינוי 2: צליל סיום שלב שמח יותר

**פעולות:**
1. הוספת קובץ צליל חדש ב-`public/audio/sfx/stage-complete-new.mp3` - צליל חגיגי יותר (כמו קונפטי/זיקוקים קצרים)
2. עדכון `src/lib/sounds.ts` לשימוש בקובץ החדש

**שורה 32 ב-sounds.ts** - שינוי מ:
```typescript
stageCompleteSound = new Audio('/audio/sfx/stage-complete.mp3');
```
ל:
```typescript
stageCompleteSound = new Audio('/audio/sfx/stage-complete-new.mp3');
```

> **הערה:** יש להעלות קובץ mp3 חדש עם צליל שמח יותר (למשל fanfare/celebration קצר) לתיקייה `public/audio/sfx/`

---

### שינוי 3: צליל הקלדה בלחיצה על קוביות

**פעולות:**

1. **הוספת קובץ צליל** `public/audio/sfx/tap.mp3` - צליל קליק קצר וחלש

2. **עדכון `src/lib/sounds.ts`** - הוספת פונקציה חדשה:

```typescript
// Lazy-load tap sound
let tapSound: HTMLAudioElement | null = null;

const getTapSound = (): HTMLAudioElement => {
  if (!tapSound) {
    tapSound = new Audio('/audio/sfx/tap.mp3');
    tapSound.volume = 0.15; // נמוך כדי לא להפריע לשיר
  }
  return tapSound;
};

/**
 * Play tap sound for bubble click
 */
export const playTapSound = (): void => {
  if (!isSoundEnabled()) return;
  const sound = getTapSound();
  sound.currentTime = 0;
  sound.play().catch(console.error);
};
```

3. **עדכון `src/components/LetterBubbles.tsx`**:

```tsx
import { playTapSound } from "@/lib/sounds";

// בתוך ה-onClick:
onClick={() => {
  if (!bubble.used) {
    playTapSound();
    onBubbleClick(bubble.id);
  }
}}
```

4. **עדכון `src/components/DailyLetterBubbles.tsx`** באותו אופן

---

### סיכום השינויים

| קובץ | סוג שינוי |
|------|-----------|
| `src/screens/LevelScreen.tsx` | הסרת `/{totalLevels}` |
| `src/lib/sounds.ts` | הוספת `playTapSound()` + שינוי קובץ stage-complete |
| `src/components/LetterBubbles.tsx` | קריאה ל-`playTapSound()` |
| `src/components/DailyLetterBubbles.tsx` | קריאה ל-`playTapSound()` |
| `public/audio/sfx/tap.mp3` | קובץ חדש (צליל קליק) |
| `public/audio/sfx/stage-complete-new.mp3` | קובץ חדש (צליל חגיגי) |

---

### לגבי קבצי הצליל

אצור קבצי mp3 באמצעות כלי ליצירת צלילים סינטטיים:
- **tap.mp3** - צליל "פופ" קצר (~50ms)
- **stage-complete-new.mp3** - פנפרה שמחה קצרה (~1-2 שניות)

