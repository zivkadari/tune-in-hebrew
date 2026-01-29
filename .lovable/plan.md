

## תכנית: הוספת הסבר על הרמזים לשתי ההדרכות

### סקירה
נוסיף שלב חדש בשתי ההדרכות שמסביר את הרמזים הזמינים בכל מוד.

---

### מוד קלאסי - ClassicTutorialScreen.tsx

#### שלב חדש: `hints`
נוסיף שלב בין `fill-letters` ל-`complete` שמסביר את 4 הרמזים:

| רמז | אייקון | תיאור | עלות |
|-----|-------|-------|------|
| נקה | 🗑️ | ניקוי כל האותיות שמילאת | חינם |
| אות | 🔤 | גילוי אות אחת במקום הנכון | 4 מטבעות |
| פייק | 🧹 | הסרת האותיות המיותרות | 7 מטבעות |
| פתרון | ✨ | פתרון מלא של השיר | 18 מטבעות |

**עיצוב השלב:**
```
┌────────────────────────────────────────┐
│  💡 טיפ: רמזים יכולים לעזור!          │
│                                        │
│  ┌────────────────────────────────┐    │
│  │  🔤  גילוי אות      4 מטבעות   │    │
│  │  🧹  הסרת פייקים    7 מטבעות   │    │
│  │  ✨  פתרון מלא      18 מטבעות  │    │
│  │  🗑️  ניקוי אותיות   חינם       │    │
│  └────────────────────────────────┘    │
│                                        │
│      מטבעות מרוויחים על פתרון שירים    │
└────────────────────────────────────────┘
```

---

### מוד Time Attack - TutorialScreen.tsx

#### שלב חדש: `hints`
נוסיף שלב בין `fill-letters` ל-`complete` שמסביר את 2 הרמזים:

| רמז | אייקון | תיאור | כמות |
|-----|-------|-------|------|
| שנה | 📅 | גילוי שנת הוצאת השיר | פעם אחת לריצה |
| דלג | ⏭️ | דילוג לשיר הבא | פעם אחת לריצה |

**עיצוב השלב:**
```
┌────────────────────────────────────────┐
│  💡 טיפ: רמזים זמינים במהלך הריצה!     │
│                                        │
│  ┌────────────────────────────────┐    │
│  │  📅  שנה    גילוי שנת השיר     │    │
│  │  ⏭️  דלג    דילוג לשיר הבא     │    │
│  └────────────────────────────────┘    │
│                                        │
│       כל רמז זמין פעם אחת לריצה!       │
│                                        │
│   ⏱️ יש לך 60 שניות לפתור 12 שירים    │
└────────────────────────────────────────┘
```

---

### שינויים טכניים

#### 1. ClassicTutorialScreen.tsx

**עדכון TutorialStep type:**
```typescript
type TutorialStep = 'intro' | 'play-song' | 'fill-letters' | 'hints' | 'complete';
```

**הוספת הודעה לשלב hints:**
```typescript
case 'hints':
  return {
    icon: '💡',
    title: 'רמזים יכולים לעזור!',
    subtitle: 'כשנתקעים, אפשר להשתמש במטבעות לרמזים',
  };
```

**עדכון לוגיקת המעבר:**
- כש-slots מתמלאים נכון → עובר ל-`hints` (במקום `complete`)
- שלב `hints` מציג את הכרטיס עם הרמזים וכפתור "המשך"
- לחיצה על "המשך" → עובר ל-`complete`

**הוספת קומפוננטת כרטיס רמזים:**
```tsx
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
        <Trash2 className="w-5 h-5" />
        <span>ניקוי האותיות</span>
        <span className="mr-auto text-green-500 font-bold">חינם</span>
      </div>
      <p className="text-sm text-muted-foreground text-center pt-2 border-t">
        💰 מטבעות מרוויחים על פתרון שירים!
      </p>
    </div>
  </div>
)}
```

#### 2. TutorialScreen.tsx (Time Attack)

**עדכון TutorialStep type:**
```typescript
type TutorialStep = 'intro' | 'play-song' | 'fill-letters' | 'hints' | 'complete';
```

**הוספת הודעה לשלב hints:**
```typescript
case 'hints':
  return {
    icon: '💡',
    title: 'רמזים זמינים בריצה!',
    subtitle: 'כל רמז זמין פעם אחת בלבד',
  };
```

**עדכון לוגיקת המעבר:**
- כש-slots מתמלאים נכון → עובר ל-`hints` (במקום `complete`)
- שלב `hints` מציג את הכרטיס עם הרמזים וכפתור "המשך"
- לחיצה על "המשך" → עובר ל-`complete`

**הוספת קומפוננטת כרטיס רמזים:**
```tsx
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
      <div className="pt-2 border-t space-y-2">
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
```

---

### זרימת ההדרכה המעודכנת

**מוד קלאסי:**
```
intro (2 שניות)
    ↓
play-song (לחיצה על כפתור הנגינה)
    ↓
fill-letters (מילוי האותיות)
    ↓
hints (הסבר על הרמזים + כפתור "הבנתי")
    ↓
complete (כפתור "בוא נתחיל!")
```

**מוד Time Attack:**
```
intro (2 שניות)
    ↓
play-song (לחיצה על כפתור הנגינה)
    ↓
fill-letters (מילוי האותיות)
    ↓
hints (הסבר על הרמזים + כפתור "הבנתי")
    ↓
complete (כפתור "בוא נתחיל!")
```

---

### קבצים לעדכון

| קובץ | פעולה |
|------|-------|
| `src/screens/ClassicTutorialScreen.tsx` | הוספת שלב hints עם הסבר על הרמזים |
| `src/screens/TutorialScreen.tsx` | הוספת שלב hints עם הסבר על הרמזים |

---

### תוצאה צפויה
- שחקנים חדשים יבינו איך להשתמש ברמזים בכל מוד
- במוד הקלאסי: יבינו שרמזים עולים מטבעות ואיך להרוויח מטבעות
- במוד Time Attack: יבינו שיש Skip ו-Year Hint פעם אחת לריצה

