import { useCallback } from 'react';
import { triggerHaptic } from '@/lib/haptics';

/**
 * Hook that provides haptic and visual feedback for button clicks
 */
export const useButtonFeedback = () => {
  const withFeedback = useCallback(<T extends (...args: any[]) => any>(
    callback?: T
  ) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback
      triggerHaptic(10);
      
      // Visual feedback via CSS class
      const button = e.currentTarget;
      button.classList.add('button-pressed');
      setTimeout(() => button.classList.remove('button-pressed'), 150);
      
      // Call original callback
      callback?.();
    };
  }, []);

  return { withFeedback };
};
