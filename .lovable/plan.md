

## תיקון: המשך אוטומטי בהדרכה למוד הקלאסי

### מה הבעיה?
כשממלאים את כל האותיות של "יונתן הקטן", ההדרכה לא עוברת אוטומטית לשלב "complete". הבעיות:

1. **בעיית closure**: פונקציית `checkAnswer` לא רואה את הערך המעודכן של `slots`
2. **בעיית בדיקת תשובה**: הבדיקה משווה לפי סדר האותיות, אבל צריך להיות גמיש יותר

### הפתרון

#### שינויים ב-`src/screens/ClassicTutorialScreen.tsx`:

1. **תיקון ה-useEffect לבדיקת התשובה** - שימוש ישיר ב-slots במקום בפונקציה נפרדת:

```typescript
// Check answer when slots change
useEffect(() => {
  const letterSlots = slots.filter(s => s.type === "letter");
  const allFilled = letterSlots.every(s => s.value !== null);
  
  if (allFilled && letterSlots.length > 0 && step === 'fill-letters') {
    // בדיקה ישירה של התשובה
    const userAnswer = letterSlots.map(s => s.value).join('');
    const correctAnswer = TUTORIAL_SONG.letters.join('');
    
    if (userAnswer === correctAnswer) {
      setStep('complete');
    }
  }
}, [slots, step]);
```

2. **הסרת התלות ב-checkAnswer מה-useEffect** - כדי למנוע בעיות closure

### פירוט הבעיה הטכנית

הבעיה היא ש-`checkAnswer` מוגדר כ-`useCallback` עם תלות ב-`slots`:
```typescript
const checkAnswer = useCallback(() => {
  const letterSlots = slots.filter(s => s.type === "letter");
  // ...
}, [slots]);
```

וה-`useEffect` שבודק תלוי ב-`checkAnswer`:
```typescript
useEffect(() => {
  // ...
  if (checkAnswer()) { // <- כאן הבעיה
    setStep('complete');
  }
}, [slots, step, checkAnswer]);
```

כאשר `slots` משתנה, React מפעיל את ה-`useEffect` עם הגרסה הקודמת של `checkAnswer` (לפני שהיא מתעדכנת עם ה-`slots` החדשים).

### קבצים לעדכון

| קובץ | פעולה |
|------|-------|
| `src/screens/ClassicTutorialScreen.tsx` | תיקון לוגיקת בדיקת התשובה |

### התוצאה הצפויה
לאחר התיקון:
- מילוי כל האותיות של "יונתן הקטן" → המעבר האוטומטי לשלב "complete" יעבוד
- הכפתור "בוא נתחיל!" יופיע
- לחיצה על הכפתור → מעבר למשחק הקלאסי

