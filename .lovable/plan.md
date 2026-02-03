

## תוכנית: קביעת סוג שאלה קבוע לשירים ספציפיים

### הבעיה
כרגע המערכת קובעת באופן דינמי (או אקראי) אם לשאול על שם השיר או שם האמן. המשתמש רוצה:
1. **"אם את עדיין אוהבת"** (id: 35) → תמיד לשאול על **האמן** (בועז שרעבי)
2. **"לכל אחד"** (id: 38) → תמיד לשאול על **השיר**

---

### הפתרון

**קובץ:** `src/hooks/useGameState.ts`

הוספת מיפוי של שירים עם סוג שאלה קבוע בתחילת הפונקציה `determineQuestionType`:

```typescript
// Songs with forced question types
const FORCED_QUESTION_TYPES: Record<number, 'song' | 'artist'> = {
  35: 'artist',  // "אם את עדיין אוהבת" → always ask artist (בועז שרעבי)
  38: 'song',    // "לכל אחד" → always ask song name
};

const determineQuestionType = (
  songName: string, 
  artistName: string, 
  levelId: number
): { questionType: 'song' | 'artist'; answer: string } => {
  // Check if this level has a forced question type
  const forcedType = FORCED_QUESTION_TYPES[levelId];
  if (forcedType) {
    return forcedType === 'artist'
      ? { questionType: 'artist', answer: artistName }
      : { questionType: 'song', answer: songName };
  }

  // ... rest of existing logic
};
```

---

### סיכום

| שיר | ID | סוג שאלה | תשובה |
|-----|-----|----------|--------|
| אם את עדיין אוהבת | 35 | אמן | בועז שרעבי |
| לכל אחד | 38 | שיר | לכל אחד |

שינוי קטן בקובץ אחד בלבד - הוספת ~10 שורות קוד.

