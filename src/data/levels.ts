export interface Level {
  id: number;
  songName: string;
  artistName: string;
  audioUrl: string;
  releaseYear: number;
}

export const SONGS_PER_STAGE = 12;

export const getStageNumber = (songId: number): number => Math.ceil(songId / SONGS_PER_STAGE);

export const getSongNumberInStage = (songId: number): number => {
  const remainder = songId % SONGS_PER_STAGE;
  return remainder === 0 ? SONGS_PER_STAGE : remainder;
};

export const getTotalStages = (totalSongs: number): number => Math.ceil(totalSongs / SONGS_PER_STAGE);

export const isLastSongInStage = (songId: number): boolean =>
  songId % SONGS_PER_STAGE === 0 || songId === levels.length;

export const levels: Level[] = [
  // Stage 1 (1-12)
  { id: 1, songName: "צליל מיתר", artistName: "אייל גולן", audioUrl: "/audio/level_new2.m4a", releaseYear: 2001 },
  { id: 2, songName: "ממעמקים", artistName: "עידן רייכל", audioUrl: "/audio/level_s1_02.m4a", releaseYear: 2004 },
  { id: 3, songName: "השקט שנשאר", artistName: "שירי מימון", audioUrl: "/audio/level_s1_03.m4a", releaseYear: 2005 },
  { id: 4, songName: "הילדה הכי יפה בגן", artistName: "יהודית רביץ", audioUrl: "/audio/level_s1_04.m4a", releaseYear: 1978 },
  { id: 5, songName: "פנתרה", artistName: "נועה קירל", audioUrl: "/audio/level_new15.m4a", releaseYear: 2022 },
  { id: 6, songName: "רולקס וקסקט", artistName: "עדן בן זקן", audioUrl: "/audio/level_new54.m4a", releaseYear: 2026 },
  { id: 7, songName: "מסע ומתן", artistName: "מוש בן-ארי", audioUrl: "/audio/level5.m4a", releaseYear: 2006 },
  { id: 8, songName: "אלוף העולם", artistName: "חנן בן ארי", audioUrl: "/audio/level8.m4a", releaseYear: 2021 },
  { id: 9, songName: "לילות וקללות", artistName: "עומר אדם", audioUrl: "/audio/level3.m4a", releaseYear: 2024 },
  { id: 10, songName: "סהרה", artistName: "טונה", audioUrl: "/audio/level2.m4a", releaseYear: 2021 },
  { id: 11, songName: "שווים", artistName: "עילי בוטנר ורן דנקר", audioUrl: "/audio/level_new18.m4a", releaseYear: 2007 },
  { id: 12, songName: "אור גדול", artistName: "אמיר דדון", audioUrl: "/audio/level_new17.m4a", releaseYear: 2010 },

  // Stage 2 (13-24)
  { id: 13, songName: "הלב שלי", artistName: "ישי ריבו", audioUrl: "/audio/level_s1_12.m4a", releaseYear: 2015 },
  { id: 14, songName: "מה יהיה מחר", artistName: "פאר טסי", audioUrl: "/audio/level_new50.m4a", releaseYear: 2024 },
  { id: 15, songName: "עדיין ריק", artistName: "לירן דנינו", audioUrl: "/audio/level_s2_01.m4a", releaseYear: 2012 },
  { id: 16, songName: "מסע", artistName: "אליעד", audioUrl: "/audio/level_s2_02.m4a", releaseYear: 2019 },
  { id: 17, songName: "יהיה טוב", artistName: "יסמין מועלם", audioUrl: "/audio/level_s2_03.m4a", releaseYear: 2023 },
  { id: 18, songName: "כפיות", artistName: "עדן חסון", audioUrl: "/audio/level_s2_04.m4a", releaseYear: 2019 },
  { id: 19, songName: "כל מה שיש לי", artistName: "נתן גושן", audioUrl: "/audio/level_new14.m4a", releaseYear: 2011 },
  { id: 20, songName: "השיר שלנו", artistName: "אביב גפן", audioUrl: "/audio/level_new16.m4a", releaseYear: 1999 },
  { id: 21, songName: "אהבה", artistName: "אושר כהן", audioUrl: "/audio/level10.m4a", releaseYear: 2023 },
  { id: 22, songName: "נגעת לי בלב", artistName: "אייל גולן", audioUrl: "/audio/level9.m4a", releaseYear: 2012 },
  { id: 23, songName: "התקווה", artistName: "סאבלימינל והצל", audioUrl: "/audio/level6.m4a", releaseYear: 2002 },
  { id: 24, songName: "איזה עולם", artistName: "טיפקס", audioUrl: "/audio/level_s2_10.m4a", releaseYear: 1997 },

  // Stage 3 (25-36)
  { id: 25, songName: "עוף מוזר", artistName: "פאר טסי", audioUrl: "/audio/level1.m4a", releaseYear: 2025 },
  { id: 26, songName: "חופשייה", artistName: "שרית חדד", audioUrl: "/audio/level7.m4a", releaseYear: 2007 },
  { id: 27, songName: "מרי לו", artistName: "צביקה פיק", audioUrl: "/audio/level_s3_01.m4a", releaseYear: 1978 },
  { id: 28, songName: "אף אחת", artistName: "מירי מסיקה", audioUrl: "/audio/level_new19.m4a", releaseYear: 2005 },
  { id: 29, songName: "השיר שאת אהבת", artistName: "עומר אדם", audioUrl: "/audio/level_s3_03.m4a", releaseYear: 2025 },
  { id: 30, songName: "ילדה קטנה", artistName: "משה פרץ ואגם בוחבוט", audioUrl: "/audio/level_new55.m4a", releaseYear: 2014 },
  { id: 31, songName: "נגמר", artistName: "עידן עמדי", audioUrl: "/audio/level11.m4a", releaseYear: 2012 },
  { id: 32, songName: "מסיבה", artistName: "יסמין מועלם", audioUrl: "/audio/level_s3_05.m4a", releaseYear: 2020 },
  { id: 33, songName: "ואת", artistName: "הראל סקעת", audioUrl: "/audio/level_s3_06.m4a", releaseYear: 2006 },
  { id: 34, songName: "ואז תבואי", artistName: "הראל מויאל", audioUrl: "/audio/level_s3_07.m4a", releaseYear: 2005 },
  { id: 35, songName: "מעליות", artistName: "דודו טסה", audioUrl: "/audio/level4.m4a", releaseYear: 2006 },
  { id: 36, songName: "האחת שלי", artistName: "ישי לוי", audioUrl: "/audio/level_s3_09.m4a", releaseYear: 2011 },

  // Stage 4 (37-48)
  { id: 37, songName: "יחפים", artistName: "יסמין מועלם", audioUrl: "/audio/level_new49.m4a", releaseYear: 2021 },
  { id: 38, songName: "סימני הזמן", artistName: "משה פרץ", audioUrl: "/audio/level_s3_10.m4a", releaseYear: 2015 },
  { id: 39, songName: "אם את עדיין אוהבת", artistName: "בועז שרעבי", audioUrl: "/audio/level_s3_11.m4a", releaseYear: 1993 },
  { id: 40, songName: "אם זה זה", artistName: "אגם בוחבוט", audioUrl: "/audio/level12.m4a", releaseYear: 2025 },
  { id: 41, songName: "יפה כלבנה", artistName: "אביתר בנאי", audioUrl: "/audio/level_new20.m4a", releaseYear: 2013 },
  { id: 42, songName: "לכל אחד", artistName: "שלומי שבת", audioUrl: "/audio/level_s4_02.m4a", releaseYear: 2000 },
  { id: 43, songName: "נוף אחר", artistName: "יוני בלוך", audioUrl: "/audio/level_new22.m4a", releaseYear: 2007 },
  { id: 44, songName: "הולכת איתך", artistName: "נרקיס", audioUrl: "/audio/level_s4_04.m4a", releaseYear: 2021 },
  { id: 45, songName: "הלילה יעבור", artistName: "יפית", audioUrl: "/audio/level_s4_05.m4a", releaseYear: 2007 },
  { id: 46, songName: "פתאום כשלא באת", artistName: "שלמה ארצי", audioUrl: "/audio/level_s4_06.m4a", releaseYear: 1979 },
  { id: 47, songName: "פחד אלוהים", artistName: "כפיר צפריר", audioUrl: "/audio/level_s4_07.m4a", releaseYear: 2023 },
  { id: 48, songName: "נשימה", artistName: "חן אהרוני ואסתי", audioUrl: "/audio/level_new21.m4a", releaseYear: 2010 },

  // Stage 5 (49-55)
  { id: 49, songName: "שאריות מעצמי", artistName: "שיר לוי", audioUrl: "/audio/level_s4_09.m4a", releaseYear: 2014 },
  { id: 50, songName: "גוליית", artistName: "כוורת", audioUrl: "/audio/level_s4_10.m4a", releaseYear: 1975 },
  { id: 51, songName: "לא להיות לבד", artistName: "מרגי", audioUrl: "/audio/level_new47.m4a", releaseYear: 2021 },
  { id: 52, songName: "ניצחת איתי הכל", artistName: "עמיר בניון", audioUrl: "/audio/level_new48.m4a", releaseYear: 2004 },
  { id: 53, songName: "שמים", artistName: "יגאל בשן", audioUrl: "/audio/level_new51.m4a", releaseYear: 2013 },
  { id: 54, songName: "אייכה", artistName: "שולי רנד", audioUrl: "/audio/level_new52.m4a", releaseYear: 2008 },
  { id: 55, songName: "ביום שניפגש", artistName: "דודו אהרון", audioUrl: "/audio/level_new53.m4a", releaseYear: 2016 },
];
