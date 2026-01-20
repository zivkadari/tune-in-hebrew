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
