const SOUND_ENABLED_KEY = "game-sound-enabled";

/**
 * Check if game sounds are enabled (default: true)
 */
export const isSoundEnabled = (): boolean => {
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === "true";
};

/**
 * Set game sounds enabled/disabled
 */
export const setSoundEnabled = (enabled: boolean): void => {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
};

// Lazy-load audio to avoid issues on mobile
let correctSound: HTMLAudioElement | null = null;
let stageCompleteSound: HTMLAudioElement | null = null;

const getCorrectSound = (): HTMLAudioElement => {
  if (!correctSound) {
    correctSound = new Audio('/audio/sfx/correct.mp3');
    correctSound.volume = 0.6;
  }
  return correctSound;
};

const getStageCompleteSound = (): HTMLAudioElement => {
  if (!stageCompleteSound) {
    stageCompleteSound = new Audio('/audio/sfx/stage-complete.mp3');
    stageCompleteSound.volume = 0.7;
  }
  return stageCompleteSound;
};

/**
 * Play success sound for correct guess
 */
export const playCorrectSound = (): void => {
  if (!isSoundEnabled()) return;
  const sound = getCorrectSound();
  sound.currentTime = 0;
  sound.play().catch(console.error);
};

/**
 * Play fanfare sound for stage completion
 */
export const playStageCompleteSound = (): void => {
  if (!isSoundEnabled()) return;
  const sound = getStageCompleteSound();
  sound.currentTime = 0;
  sound.play().catch(console.error);
};
