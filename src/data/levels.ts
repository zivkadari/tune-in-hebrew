export interface Level {
  id: number;
  title: string;
  audioUrl: string;
  extraLettersCount: number;
}

export const levels: Level[] = [
  {
    id: 1,
    title: "ירושלים של זהב",
    audioUrl: "/audio/level1.mp3",
    extraLettersCount: 5,
  },
  {
    id: 2,
    title: "הללויה",
    audioUrl: "/audio/level2.mp3",
    extraLettersCount: 4,
  },
  {
    id: 3,
    title: "אין לי ארץ אחרת",
    audioUrl: "/audio/level3.mp3",
    extraLettersCount: 6,
  },
  {
    id: 4,
    title: "כמו צמח בר",
    audioUrl: "/audio/level4.mp3",
    extraLettersCount: 5,
  },
  {
    id: 5,
    title: "על כל אלה",
    audioUrl: "/audio/level5.mp3",
    extraLettersCount: 4,
  },
  {
    id: 6,
    title: "הקיץ האחרון",
    audioUrl: "/audio/level6.mp3",
    extraLettersCount: 5,
  },
  {
    id: 7,
    title: "ילד טוב ילד רע",
    audioUrl: "/audio/level7.mp3",
    extraLettersCount: 5,
  },
  {
    id: 8,
    title: "מה אברך – שיר תודה",
    audioUrl: "/audio/level8.mp3",
    extraLettersCount: 6,
  },
  {
    id: 9,
    title: "שיר לשלום",
    audioUrl: "/audio/level9.mp3",
    extraLettersCount: 4,
  },
  {
    id: 10,
    title: "עטור מצחך זהב שחור",
    audioUrl: "/audio/level10.mp3",
    extraLettersCount: 6,
  },
];
