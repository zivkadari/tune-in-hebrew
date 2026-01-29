

## תכנית: הוספת הדרכה למוד הקלאסי

### סקירה
נוסיף מסך הדרכה אינטראקטיבי למוד הקלאסי של המשחק, בדומה להדרכה שקיימת במוד Time Attack. ההדרכה תופיע רק בפעם הראשונה שהשחקן נכנס למוד הקלאסי ותשתמש בשיר "יונתן הקטן" כדוגמה.

### נקודות חשובות להדרכה
- הסבר שלפעמים צריך לנחש את **שם השיר** ולפעמים את **שם האמן**
- הדגמה על השיר "יונתן הקטן" (אותו אודיו שמשמש ב-Time Attack)
- שלבים: האזנה לשיר → מילוי האותיות → הצלחה

---

### שינויים נדרשים

#### 1. עדכון tutorialStorage.ts - הוספת מפתח למוד קלאסי

```typescript
// מפתח חדש עבור המוד הקלאסי
const CLASSIC_TUTORIAL_COMPLETED_KEY = "classic-mode-tutorial-completed";

// פונקציות חדשות
export const hasClassicTutorialCompleted = (): boolean
export const markClassicTutorialCompleted = (): void
export const resetClassicTutorialStatus = (): void
```

#### 2. יצירת ClassicTutorialOfferDialog.tsx

דיאלוג הצעה להדרכה, דומה ל-TutorialOfferDialog אבל מותאם למוד הקלאסי:

```
┌────────────────────────────────────────┐
│           🎵  (אייקון מוזיקה)           │
│                                        │
│      ברוכים הבאים למשחק!              │
│                                        │
│   לפני שמתחילים, רוצים הדרכה קצרה?    │
│                                        │
│   💡 טיפ חשוב:                         │
│   לפעמים צריך לנחש את שם השיר          │
│   ולפעמים את שם האמן!                  │
│                                        │
│   ┌──────────────────────────────┐     │
│   │    כן, תראה לי! 🎓           │     │
│   └──────────────────────────────┘     │
│                                        │
│   ┌──────────────────────────────┐     │
│   │       לא, תודה               │     │
│   └──────────────────────────────┘     │
└────────────────────────────────────────┘
```

#### 3. יצירת ClassicTutorialScreen.tsx

מסך הדרכה אינטראקטיבי המשתמש בשיר "יונתן הקטן" - מותאם ל-types של המוד הקלאסי (Slot ו-Bubble מ-useGameState).

**הבדלים מ-TutorialScreen הקיים:**
- משתמש בקומפוננטות `LetterSlots` ו-`LetterBubbles` (לא DailyLetterSlots)
- ה-types הם `Slot` ו-`Bubble` מ-useGameState (עם `type: "letter"` ו-`id: string`)
- הכפתור בסוף מחזיר למשחק הקלאסי

**שלבי ההדרכה:**

| שלב | כותרת | תיאור |
|-----|-------|-------|
| intro | ברוך הבא להדרכה! | טיפ: לפעמים צריך לנחש שיר ולפעמים אמן |
| play-song | לחץ על כפתור הנגינה | כדי לשמוע את השיר |
| fill-letters | מצוין! עכשיו לחץ על האותיות | כדי להרכיב את שם השיר |
| complete | מעולה! הצלחת! | עכשיו אתה מוכן למשחק |

#### 4. עדכון Index.tsx

**State חדש:**
```typescript
const [showClassicTutorialOffer, setShowClassicTutorialOffer] = useState(false);
const [showClassicTutorial, setShowClassicTutorial] = useState(false);
```

**לוגיקה חדשה:**
- כשהשחקן לוחץ על "התחל משחק" או "המשך משחק":
  - אם `!hasClassicTutorialCompleted()` → הצג `ClassicTutorialOfferDialog`
  - אם ההדרכה הושלמה → המשך ישירות למשחק

**Handlers חדשים:**
```typescript
// עטיפה לפני התחלת משחק קלאסי
const handleStartClassicGame = useCallback(() => {
  if (!hasClassicTutorialCompleted()) {
    setShowClassicTutorialOffer(true);
  } else {
    startGame();
  }
}, [startGame]);

const handleContinueClassicGame = useCallback(() => {
  if (!hasClassicTutorialCompleted()) {
    setShowClassicTutorialOffer(true);
  } else {
    continueGame();
  }
}, [continueGame]);

const handleClassicTutorialAccept = useCallback(() => {
  setShowClassicTutorialOffer(false);
  setShowClassicTutorial(true);
}, []);

const handleClassicTutorialDecline = useCallback(() => {
  setShowClassicTutorialOffer(false);
  markClassicTutorialCompleted();
  startGame();  // או continueGame לפי הפעולה המקורית
}, [startGame]);

const handleClassicTutorialComplete = useCallback(() => {
  markClassicTutorialCompleted();
  setShowClassicTutorial(false);
  startGame();
}, [startGame]);
```

**עדכון Render:**
```tsx
// הוספת מסך ההדרכה לפני שאר המסכים
if (showClassicTutorial) {
  return (
    <ClassicTutorialScreen
      onComplete={handleClassicTutorialComplete}
      onSkip={handleClassicTutorialComplete}
    />
  );
}

// הוספת הדיאלוג בתוך מסך הבית
<ClassicTutorialOfferDialog
  open={showClassicTutorialOffer}
  onAccept={handleClassicTutorialAccept}
  onDecline={handleClassicTutorialDecline}
/>
```

---

### זרימת המשחק החדשה

```
מסך הבית
    │
    ├── לחיצה על "התחל משחק" / "המשך משחק"
    │
    ▼
האם ההדרכה הושלמה?
    │
    ├── כן → המשך ישירות לשלב 1
    │
    └── לא → הצג דיאלוג הצעה להדרכה
                │
                ├── "כן, תראה לי!" → מסך הדרכה אינטראקטיבי
                │                      │
                │                      └── סיום → סמן הדרכה כמושלמת → שלב 1
                │
                └── "לא, תודה" → סמן הדרכה כמושלמת → שלב 1
```

---

### קבצים לעדכון/יצירה

| קובץ | פעולה | תיאור |
|------|-------|-------|
| `src/lib/tutorialStorage.ts` | עדכון | הוספת פונקציות למוד קלאסי |
| `src/components/ClassicTutorialOfferDialog.tsx` | יצירה | דיאלוג הצעה להדרכה |
| `src/screens/ClassicTutorialScreen.tsx` | יצירה | מסך הדרכה אינטראקטיבי |
| `src/pages/Index.tsx` | עדכון | חיבור הלוגיקה והקומפוננטות |

---

### פרטים טכניים

**ClassicTutorialScreen - מבנה הנתונים:**

```typescript
// שימוש ב-types של המוד הקלאסי
import { Slot, Bubble } from "@/hooks/useGameState";

// יצירת slots לשיר "יונתן הקטן"
const slots: Slot[] = [
  { type: "letter", answerIndex: 0, value: null },  // י
  { type: "letter", answerIndex: 1, value: null },  // ו
  { type: "letter", answerIndex: 2, value: null },  // נ
  { type: "letter", answerIndex: 3, value: null },  // ת
  { type: "letter", answerIndex: 4, value: null },  // ן
  { type: "fixed", char: " ", value: " " },         // רווח
  { type: "letter", answerIndex: 5, value: null },  // ה
  { type: "letter", answerIndex: 6, value: null },  // ק
  { type: "letter", answerIndex: 7, value: null },  // ט
  { type: "letter", answerIndex: 8, value: null },  // ן
];

// בועות עם אותיות אמיתיות + מזויפות
const bubbles: Bubble[] = [
  { id: "real-0", letter: "י", isFake: false, used: false },
  // ...
  { id: "fake-0", letter: "א", isFake: true, used: false },
  // ...
];
```

