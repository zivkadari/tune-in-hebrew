

## תכנית: עדכון מערכת השירים ל-46 שירים עם בחירה דינמית של סוג השאלה

### סקירה
עדכון מערכת המשחק לכלול 46 שירים ב-4 שלבים, עם לוגיקה חדשה לבחירת סוג השאלה (שיר או אמן) באופן רנדומלי, תוך התחשבות באורך התשובה (מקסימום 14 אותיות).

---

### מבנה הנתונים החדש

#### שינוי ב-`Level` interface

הממשק הנוכחי:
```typescript
interface Level {
  id: number;
  title: string;         // שם השיר (התשובה הנוכחית)
  audioUrl: string;
  extraLettersCount: number;
  questionType: "song" | "artist";
}
```

הממשק החדש:
```typescript
interface Level {
  id: number;
  songName: string;      // שם השיר
  artistName: string;    // שם האמן
  audioUrl: string;
  releaseYear: number;   // שנת יציאה (לשימוש עתידי)
}
```

#### לוגיקת בחירת סוג השאלה (בזמן ריצה)

```text
1. חשב אורך אותיות של songName (בלי רווחים)
2. חשב אורך אותיות של artistName (בלי רווחים)
3. אם songName > 14 אותיות ← questionType = "artist"
4. אם artistName > 14 אותיות ← questionType = "song"
5. אם שניהם ≤ 14 ← בחירה רנדומלית
6. אם שניהם > 14 ← בחר את הקצר יותר
```

---

### קבצים שישתנו

#### 1. העתקת קבצי אודיו חדשים ל-`public/audio/`

24 קבצים חדשים:

| קובץ מקור (user-uploads) | קובץ יעד |
|--------------------------|----------|
| Track35-mimaamakim.m4a | level_s1_02.m4a |
| Track30-_hasheket_shenishaar.m4a | level_s1_03.m4a |
| Track33-_hayalda_hachi_yafa_bagan.m4a | level_s1_04.m4a |
| Track26-_kapiot.m4a | level_s2_04.m4a |
| Track27_-_eize_olam.m4a | level_s2_10.m4a |
| Track36-_halev_sheli.m4a | level_s1_12.m4a |
| Track40-_adain_rek.m4a | level_s2_01.m4a |
| Track37-_masa.m4a | level_s2_02.m4a |
| Track32-_ihie_tov.m4a | level_s2_03.m4a |
| Track41-_hashir_sheat.m4a | level_s3_03.m4a |
| Track44-_mesiba.m4a | level_s3_05.m4a |
| Track45-_veat.m4a | level_s3_06.m4a |
| Track39-_veaz_tavoei.m4a | level_s3_07.m4a |
| Track29-_haahat_sheli.m4a | level_s3_09.m4a |
| Track43-_simanei_hazman.m4a | level_s3_10.m4a |
| Track38-_im_at_adaain.m4a | level_s3_11.m4a |
| Track42-_meri_Lu.m4a | level_s3_01.m4a |
| Track31-_lekol_ehad.m4a | level_s4_02.m4a |
| Track15-holehet_itha.m4a | level_s4_04.m4a |
| Track5-halayla_yaavor.m4a | level_s4_05.m4a |
| Track22-_pitom_kshelo_bat.m4a | level_s4_06.m4a |
| Track28-_pahad_Elohim.m4a | level_s4_07.m4a |
| Track34-_sheeriot_meazmi.m4a | level_s4_09.m4a |
| Track46-Goliath.m4a | level_s4_10.m4a |

#### 2. שכתוב `src/data/levels.ts`

עדכון מלא עם 46 שירים לפי הסדר שסיפקת:

```text
Stage 1 (1-12):  צליל מיתר, ממעמקים, השקט שנשאר, הילדה הכי יפה בגן...
Stage 2 (13-24): עדיין ריק, מסע, יהיה טוב, כפיות...
Stage 3 (25-36): מרי לו, אף אחת, השיר שאת אהבת, נגמר...
Stage 4 (37-46): יפה כלבנה, לכל אחד, נוף אחר, הולכת איתך...
```

כל רשומה תכלול `songName`, `artistName`, ו-`releaseYear`.

#### 3. עדכון `src/hooks/useGameState.ts`

**פונקציה חדשה:** `determineQuestionType`

```typescript
const MAX_ANSWER_LETTERS = 14;

function countHebrewLetters(str: string): number {
  return str.replace(/\s/g, '').length;
}

function determineQuestionType(
  songName: string, 
  artistName: string, 
  levelId: number
): { questionType: 'song' | 'artist'; answer: string } {
  const songLetters = countHebrewLetters(songName);
  const artistLetters = countHebrewLetters(artistName);
  
  // Case 1: Song name too long → use artist
  if (songLetters > MAX_ANSWER_LETTERS && artistLetters <= MAX_ANSWER_LETTERS) {
    return { questionType: 'artist', answer: artistName };
  }
  
  // Case 2: Artist name too long → use song
  if (artistLetters > MAX_ANSWER_LETTERS && songLetters <= MAX_ANSWER_LETTERS) {
    return { questionType: 'song', answer: songName };
  }
  
  // Case 3: Both too long → use shorter one
  if (songLetters > MAX_ANSWER_LETTERS && artistLetters > MAX_ANSWER_LETTERS) {
    return songLetters <= artistLetters 
      ? { questionType: 'song', answer: songName }
      : { questionType: 'artist', answer: artistName };
  }
  
  // Case 4: Both valid → random (seeded by levelId for consistency)
  const useArtist = (levelId * 7) % 2 === 0;
  return useArtist 
    ? { questionType: 'artist', answer: artistName }
    : { questionType: 'song', answer: songName };
}
```

**שינויים ב-`initializeLevel`:**
- במקום `level.title`, נקרא ל-`determineQuestionType(level.songName, level.artistName, level.id)`
- התוצאה תקבע את התשובה הנכונה ואת סוג השאלה

#### 4. עדכון `src/screens/LevelScreen.tsx`

התאמת הטקסט לפי סוג השאלה (כבר קיים, רק צריך לוודא שה-prop מגיע נכון).

#### 5. עדכון `src/screens/SuccessScreen.tsx`

הצגת שם השיר וגם שם האמן בסיום:
```text
"צליל מיתר" - אייל גולן
```

#### 6. עדכון `src/screens/LevelsScreen.tsx`

הצגת שם השיר (לא התשובה) ברשימת השלבים.

---

### דוגמאות לאורך תשובות

| שיר | אורך שם שיר | אורך שם אמן | סוג שאלה |
|-----|------------|------------|----------|
| אהבה | 4 | אושר כהן: 7 | רנדומי |
| אם את עדיין אוהבת אותי | 16 | בעז שרעבי: 8 | artist ⬅️ |
| הילדה הכי יפה בגן | 13 | יהודית רביץ: 10 | רנדומי |
| פתאום כשלא באת | 10 | שלמה ארצי: 9 | רנדומי |
| נשימה | 5 | חן אהרוני ואסתי גינזבורג: 18 | song ⬅️ |

---

### מיפוי קבצי אודיו קיימים

| Level | שיר | קובץ קיים |
|-------|-----|-----------|
| 1 | צליל מיתר | level_new2.m4a |
| 5 | פנתרה | level_new15.m4a |
| 6 | מסע ומתן | level5.m4a |
| 7 | אלוף העולם | level8.m4a |
| 8 | לילות וקללות | level3.m4a |
| 9 | סהרה | level2.m4a |
| 10 | שווים | level_new18.m4a |
| 11 | אור גדול | level_new17.m4a |
| 17 | כל מה שיש לי | level_new14.m4a |
| 18 | השיר שלנו | level_new16.m4a |
| 19 | אהבה | level10.m4a |
| 20 | נגעת לי בלב | level9.m4a |
| 21 | התקווה | level6.m4a |
| 23 | עוף מוזר | level1.m4a |
| 24 | חופשייה | level7.m4a |
| 26 | אף אחת | level_new19.m4a |
| 28 | נגמר | level11.m4a |
| 32 | מעליות | level4.m4a |
| 36 | אם זה זה | level12.m4a |
| 37 | יפה כלבנה | level_new20.m4a |
| 39 | נוף אחר | level_new22.m4a |
| 44 | נשימה | level_new21.m4a |

---

### פרטים טכניים

#### מבנה חדש של Level

```typescript
export interface Level {
  id: number;
  songName: string;
  artistName: string;
  audioUrl: string;
  releaseYear: number;
}

// הסרת questionType ו-extraLettersCount - יחושבו דינמית
```

#### חישוב extraLettersCount

יחושב אוטומטית ב-runtime:
```typescript
const answerLetters = countHebrewLetters(answer);
const extraLettersCount = Math.max(0, 14 - answerLetters);
```

---

### סיכום השינויים

| קובץ | סוג שינוי |
|------|-----------|
| public/audio/ | הוספת 24 קבצים חדשים |
| src/data/levels.ts | שכתוב מלא - 46 רשומות עם songName, artistName, releaseYear |
| src/hooks/useGameState.ts | הוספת `determineQuestionType`, עדכון `initializeLevel` |
| src/screens/LevelScreen.tsx | עדכון props (questionType נשאר, מגיע מ-hook) |
| src/screens/SuccessScreen.tsx | הוספת הצגת שם אמן |
| src/screens/LevelsScreen.tsx | הצגת שם שיר במקום title |

