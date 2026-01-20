const HAPTIC_ENABLED_KEY = "game-haptic-enabled";

/**
 * Check if haptic feedback is enabled (default: true)
 */
export const isHapticEnabled = (): boolean => {
  return localStorage.getItem(HAPTIC_ENABLED_KEY) !== 'false';
};

/**
 * Set haptic feedback enabled/disabled
 */
export const setHapticEnabled = (enabled: boolean): void => {
  localStorage.setItem(HAPTIC_ENABLED_KEY, enabled.toString());
};

/**
 * Trigger haptic feedback (vibration)
 * @param duration - vibration duration in milliseconds (default: 10ms)
 */
export const triggerHaptic = (duration: number = 10): void => {
  if (!isHapticEnabled()) return;
  
  // Check if Vibration API is supported
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};
