

## החלפת צליל הקליק

### מה צריך לעשות

1. **העתקת הקובץ שהועלה** - להעתיק את `Click_sound.m4a` לתיקייה `public/audio/sfx/`

2. **עדכון `src/lib/sounds.ts`** - לשנות את הנתיב של צליל ההקלדה מ:
   ```typescript
   tapSound = new Audio('/audio/sfx/tap.mp3');
   ```
   ל:
   ```typescript
   tapSound = new Audio('/audio/sfx/Click_sound.m4a');
   ```

### הערות
- הקובץ הוא בפורמט m4a שנתמך בכל הדפדפנים המודרניים
- הווליום יישאר 0.15 כדי לא להפריע לשיר המתנגן
- אפשר למחוק את `tap.mp3` הישן אחרי הבדיקה

