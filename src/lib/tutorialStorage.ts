// Daily Time Attack tutorial
const TUTORIAL_COMPLETED_KEY = "daily-time-attack-tutorial-completed";

export const hasTutorialCompleted = (): boolean => {
  return localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
};

export const markTutorialCompleted = (): void => {
  localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
};

export const resetTutorialStatus = (): void => {
  localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
};

// Classic Mode tutorial
const CLASSIC_TUTORIAL_COMPLETED_KEY = "classic-mode-tutorial-completed";

export const hasClassicTutorialCompleted = (): boolean => {
  return localStorage.getItem(CLASSIC_TUTORIAL_COMPLETED_KEY) === 'true';
};

export const markClassicTutorialCompleted = (): void => {
  localStorage.setItem(CLASSIC_TUTORIAL_COMPLETED_KEY, 'true');
};

export const resetClassicTutorialStatus = (): void => {
  localStorage.removeItem(CLASSIC_TUTORIAL_COMPLETED_KEY);
};
