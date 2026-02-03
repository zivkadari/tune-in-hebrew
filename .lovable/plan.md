

## תוכנית: שלושה שינויים במסך הראשי ולוגיקת שאלות

### שינוי 1: שיר "נשימה" - תמיד לשאול על שם השיר

**קובץ:** `src/hooks/useGameState.ts`

**שורות 25-28** - הוספת ID 44 למיפוי:
```typescript
const FORCED_QUESTION_TYPES: Record<number, 'song' | 'artist'> = {
  35: 'artist',  // "אם את עדיין אוהבת" → always ask artist (בועז שרעבי)
  38: 'song',    // "לכל אחד" → always ask song name
  44: 'song',    // "נשימה" → always ask song name
};
```

---

### שינוי 2: תיקון חפיפה של כפתור ההגדרות עם המסגרת

**קובץ:** `src/screens/HomeScreen.tsx`

הבעיה: המסגרת הזכוכית עולה על כפתורי ה-HUD (הגדרות ומטבעות).

**פתרון:** הגדלת ה-margin top של הכרטיס הראשי מ-`mt-16` ל-`mt-24`, והזזת ה-HUD מעט למעלה עם z-index גבוה יותר.

---

### שינוי 3: מחיקת הפוטר "10 שירים ישראליים אהובים"

**קובץ:** `src/screens/HomeScreen.tsx`

**מחיקת שורות 142-145:**
```tsx
{/* Footer */}
<p className="absolute bottom-8 text-sm text-muted-foreground safe-area-bottom">
  🎵 10 שירים ישראליים אהובים
</p>
```

---

### שינוי 4: ארגון מחדש של כפתורי המסך הראשי

**קובץ:** `src/screens/HomeScreen.tsx`

**מבנה חדש (4 כפתורים עיקריים):**

| # | שם | צבע | פעולה |
|---|-----|------|--------|
| 1 | **המשך משחק** | זהב (primary) | ממשיך מהשלב האחרון שנשמר |
| 2 | **חידון בשלבים** | כחול כהה (secondary) | פותח מסך עם אפשרויות: המשך/התחל מחדש/שלבים |
| 3 | **נחש כמה שיותר** | ציאן-כחול (gradient) | מוד Time Attack (במקום "Time Attack יומי") |
| 4 | **משחק חברתי** | ורוד-סגול (gradient) | מוד מסיבה (במקום "מצב מסיבה") |

**לוגיקה:**
- אם זו הפעם הראשונה (`isFirstTime` = true), כפתור ראשי יהיה "**התחל משחק**" במקום "**המשך משחק**"
- כפתור "חידון בשלבים" יפתח מסך משנה (נוכל להשתמש ב-Dialog או מסך נפרד) עם:
  - המשך משחק
  - התחל מחדש  
  - שלבים

---

### מבנה הקוד החדש של HomeScreen

```tsx
{/* Buttons */}
<div className="flex flex-col gap-4 w-full">
  {/* כפתור ראשי: המשך/התחל משחק */}
  <button onClick={isFirstTime ? onStart : onContinue} className="btn-primary ...">
    <RotateCcw className="w-6 h-6" />
    <span>{isFirstTime ? "התחל משחק" : "המשך משחק"}</span>
  </button>

  {/* חידון בשלבים - יפתח תפריט/דיאלוג */}
  <button onClick={onOpenStagesMenu} className="btn-secondary ...">
    <LayoutGrid className="w-5 h-5" />
    <span>חידון בשלבים</span>
  </button>

  {/* נחש כמה שיותר (Time Attack) */}
  <button onClick={onTimeAttack} className="... cyan-blue gradient">
    <Clock className="w-5 h-5" />
    <span>נחש כמה שיותר</span>
  </button>

  {/* משחק חברתי (Party Mode) */}
  <button onClick={onPartyMode} className="... pink-purple gradient">
    <Users className="w-5 h-5" />
    <span>משחק חברתי</span>
  </button>
</div>
```

---

### תוספת: דיאלוג "חידון בשלבים"

ייווצר קומפוננט חדש `StagesMenuDialog.tsx` שיציג 3 אפשרויות:
1. המשך משחק
2. התחל מחדש
3. בחירת שלב

זה יפשט את המסך הראשי ויאגד את כל האפשרויות של המוד הקלאסי במקום אחד.

---

### סיכום קבצים לעדכון

| קובץ | שינוי |
|------|-------|
| `src/hooks/useGameState.ts` | הוספת ID 44 ל-FORCED_QUESTION_TYPES |
| `src/screens/HomeScreen.tsx` | ארגון מחדש של הכפתורים, תיקון חפיפה, מחיקת פוטר |
| `src/components/StagesMenuDialog.tsx` | קובץ חדש - דיאלוג עם אפשרויות חידון בשלבים |
| `src/pages/Index.tsx` | עדכון state לדיאלוג החדש |

