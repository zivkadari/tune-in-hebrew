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
    title: "פאר טסי",
    audioUrl: "/audio/level1.m4a",
    extraLettersCount: 4,
    questionType: "artist",
  },
  {
    id: 2,
    title: "סהרה",
    audioUrl: "/audio/level2.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 3,
    title: "לילות וקללות",
    audioUrl: "/audio/level3.m4a",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 4,
    title: "דודו טסה",
    audioUrl: "/audio/level4.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
  {
    id: 5,
    title: "מסע ומתן",
    audioUrl: "/audio/level5.m4a",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 6,
    title: "התקווה",
    audioUrl: "/audio/level6.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 7,
    title: "חופשיה",
    audioUrl: "/audio/level7.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 8,
    title: "הללויה",
    audioUrl: "/audio/level8.mp3",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 9,
    title: "אין לי ארץ אחרת",
    audioUrl: "/audio/level9.mp3",
    extraLettersCount: 6,
    questionType: "song",
  },
  {
    id: 10,
    title: "כמו צמח בר",
    audioUrl: "/audio/level10.mp3",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 11,
    title: "על כל אלה",
    audioUrl: "/audio/level11.mp3",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 12,
    title: "הקיץ האחרון",
    audioUrl: "/audio/level12.mp3",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 13,
    title: "ילד טוב ילד רע",
    audioUrl: "/audio/level13.mp3",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 14,
    title: "מה אברך – שיר תודה",
    audioUrl: "/audio/level14.mp3",
    extraLettersCount: 6,
    questionType: "song",
  },
  {
    id: 15,
    title: "שיר לשלום",
    audioUrl: "/audio/level15.mp3",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 16,
    title: "עטור מצחך זהב שחור",
    audioUrl: "/audio/level16.mp3",
    extraLettersCount: 6,
    questionType: "song",
  },
];
