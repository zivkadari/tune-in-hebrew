

## תכנית: מניעת חזרה על שירים ב-"שחק שוב"

### הבעיה
כאשר המשתמש לוחץ "שחק שוב" ב-Offline Party Mode, המשחק בוחר שירים חדשים באקראי מכל מאגר השירים - כולל שירים שכבר נוגנו במשחקים הקודמים באותו סשן.

### הפתרון
לשמור רשימה של שירים שכבר נוגנו (לפי ID), ובהתחלת משחק חדש לסנן אותם מהמאגר.

---

### שינויים בקובץ `src/hooks/useOfflineParty.ts`

#### 1. הוספת state לשירים שנוגנו
```typescript
const [playedSongIds, setPlayedSongIds] = useState<Set<number>>(new Set());
```

#### 2. שינוי פונקציית `startGame`
לסנן שירים שכבר נוגנו:
```typescript
const startGame = useCallback(() => {
  if (players.length < 2) return;
  
  // Filter out already played songs
  const availableLevels = levels.filter(level => !playedSongIds.has(level.id));
  
  // If not enough songs available, reset the played list
  if (availableLevels.length < settings.roundCount) {
    setPlayedSongIds(new Set());
    // Use all levels if we've exhausted available songs
    const shuffledLevels = shuffleArray(levels);
    // ... select songs
  } else {
    const shuffledLevels = shuffleArray(availableLevels);
    // ... select songs
  }
  
  // Add selected song IDs to played list
  setPlayedSongIds(prev => {
    const updated = new Set(prev);
    selectedSongs.forEach(song => updated.add(song.id));
    return updated;
  });
  
  // ... rest of the function
}, [players.length, settings.roundCount, playedSongIds]);
```

#### 3. שינוי פונקציית `resetGame`
**לא** לאפס את `playedSongIds` - כדי שהזיכרון יישמר בין משחקים.

#### 4. הוספת פונקציה חדשה `fullReset` (אופציונלי)
לאיפוס מלא כולל השירים שנוגנו - לשימוש כשחוזרים לתפריט הראשי.

---

### התנהגות צפויה

| פעולה | התנהגות |
|-------|----------|
| התחלת משחק ראשון | בוחר 10/15/20 שירים אקראיים |
| "שחק שוב" | בוחר שירים חדשים שלא נוגנו עדיין |
| אם נגמרו השירים | מאפס את הרשימה ומתחיל מחדש |
| חזרה לתפריט | מאפס הכל כולל רשימת השירים |

### מספר השירים במאגר
יש כ-46 שירים ב-`levels.ts`, כך שאפשר לשחק כ-4 משחקים של 10 סיבובים לפני שצריך לחזור על שירים.

