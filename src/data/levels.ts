export interface Level {
  id: number;
  title: string;
  audioUrl: string;
  extraLettersCount: number;
  questionType: "song" | "artist";
}

export const SONGS_PER_STAGE = 12;

export const getStageNumber = (songId: number): number => Math.ceil(songId / SONGS_PER_STAGE);

export const getSongNumberInStage = (songId: number): number => {
  const remainder = songId % SONGS_PER_STAGE;
  return remainder === 0 ? SONGS_PER_STAGE : remainder;
};

export const getTotalStages = (totalSongs: number): number => Math.ceil(totalSongs / SONGS_PER_STAGE);

export const isLastSongInStage = (songId: number): boolean => songId % SONGS_PER_STAGE === 0;

export const levels: Level[] = [
  {
    id: 1,
    title: "עוף מוזר",
    audioUrl: "/audio/level1.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 2,
    title: "הללויה",
    audioUrl: "/audio/level2.mp3",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 3,
    title: "אין לי ארץ אחרת",
    audioUrl: "/audio/level3.mp3",
    extraLettersCount: 6,
    questionType: "song",
  },
  {
    id: 4,
    title: "כמו צמח בר",
    audioUrl: "/audio/level4.mp3",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 5,
    title: "על כל אלה",
    audioUrl: "/audio/level5.mp3",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 6,
    title: "הקיץ האחרון",
    audioUrl: "/audio/level6.mp3",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 7,
    title: "ילד טוב ילד רע",
    audioUrl: "/audio/level7.mp3",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 8,
    title: "מה אברך – שיר תודה",
    audioUrl: "/audio/level8.mp3",
    extraLettersCount: 6,
    questionType: "song",
  },
  {
    id: 9,
    title: "שיר לשלום",
    audioUrl: "/audio/level9.mp3",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 10,
    title: "עטור מצחך זהב שחור",
    audioUrl: "/audio/level10.mp3",
    extraLettersCount: 6,
    questionType: "song",
  },
];
