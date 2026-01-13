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
  // Stage 1 (1-12)
  {
    id: 1,
    title: "אהבה",
    audioUrl: "/audio/level10.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 2,
    title: "צליל מיתר",
    audioUrl: "/audio/level_new2.m4a",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 3,
    title: "סהרה",
    audioUrl: "/audio/level2.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 4,
    title: "לילות וקללות",
    audioUrl: "/audio/level3.m4a",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 5,
    title: "דודו טסה",
    audioUrl: "/audio/level4.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
  {
    id: 6,
    title: "מסע ומתן",
    audioUrl: "/audio/level5.m4a",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 7,
    title: "התקווה",
    audioUrl: "/audio/level6.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 8,
    title: "חופשייה",
    audioUrl: "/audio/level7.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 9,
    title: "חנן בן ארי",
    audioUrl: "/audio/level8.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
  {
    id: 10,
    title: "נגעת לי בלב",
    audioUrl: "/audio/level9.m4a",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 11,
    title: "פאר טסי",
    audioUrl: "/audio/level1.m4a",
    extraLettersCount: 4,
    questionType: "artist",
  },
  {
    id: 12,
    title: "עידן עמדי",
    audioUrl: "/audio/level11.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
  // Stage 2 (13-22)
  {
    id: 13,
    title: "אגם בוחבוט",
    audioUrl: "/audio/level12.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
  {
    id: 14,
    title: "כל מה שיש לי",
    audioUrl: "/audio/level_new14.m4a",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 15,
    title: "פנתרה",
    audioUrl: "/audio/level_new15.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 16,
    title: "אביב גפן",
    audioUrl: "/audio/level_new16.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
  {
    id: 17,
    title: "אור גדול",
    audioUrl: "/audio/level_new17.m4a",
    extraLettersCount: 5,
    questionType: "song",
  },
  {
    id: 18,
    title: "שווים",
    audioUrl: "/audio/level_new18.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 19,
    title: "מירי מסיקה",
    audioUrl: "/audio/level_new19.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
  {
    id: 20,
    title: "אביתר בנאי",
    audioUrl: "/audio/level_new20.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
  {
    id: 21,
    title: "נשימה",
    audioUrl: "/audio/level_new21.m4a",
    extraLettersCount: 4,
    questionType: "song",
  },
  {
    id: 22,
    title: "יוני בלוך",
    audioUrl: "/audio/level_new22.m4a",
    extraLettersCount: 5,
    questionType: "artist",
  },
];
