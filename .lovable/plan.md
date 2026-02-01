
## תיקון: מסך סיבוב ב-Party Mode נחתך מלמעלה

### הבעיה
במסך `OfflinePartyRound`, הכותרת "סיבוב X/Y" נחתכת בחלק העליון של המסך באייפון. הסיבה היא שהמסך משתמש בקלאס `safe-area-top` שלא מתנהג נכון עם המבנה הנוכחי.

### הפתרון
לאמץ את הגישה שעובדת במסך `DailyTimeAttackRun`:

1. להוסיף את ה-hook `useDeviceType` לחישוב דינמי של ה-safe area
2. להחליף את `safe-area-top` ב-CSS ל-`paddingTop` דינמי ב-style inline
3. להוריד את גודל הפסנתר וכפתור ההשמעה כדי לייצר יותר מקום

### שינויים בקובץ `src/screens/OfflinePartyRound.tsx`

```text
שורה 2: הוספת import ל-useDeviceType
שורה 33: הוספת קריאה ל-hook: const { safeAreaTop } = useDeviceType();

שורה 128-129: שינוי ה-div הראשי מ:
  className="min-h-screen flex flex-col p-4 sm:p-6 relative overflow-hidden safe-area-top safe-area-bottom"
ל:
  className="min-h-screen flex flex-col p-4 safe-area-bottom relative overflow-hidden"
  style={{ paddingTop: `${Math.max(safeAreaTop + 8, 48)}px` }}

שורות 158-174: הקטנת הפסנתר וכפתור ההשמעה:
  - gap-4 → gap-3
  - mb-6 → mb-4
  - כפתור play: w-20 h-20 → w-16 h-16
  - אייקון play: w-8 h-8 → w-6 h-6
```

### תוצאה צפויה
הכותרת תמוקם נכון מתחת ל-notch של האייפון, וכל התוכן יהיה נראה במסך ללא צורך בגלילה.
