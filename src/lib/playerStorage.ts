import { supabase } from "@/integrations/supabase/client";

const PLAYER_ID_KEY = "daily-time-attack-player-id";
const PLAYER_NAME_KEY = "daily-time-attack-player-name";
const FIRST_TIME_KEY = "daily-time-attack-first-time";

/**
 * Check if this is a first-time player (hasn't completed welcome flow)
 */
export const isFirstTimePlayer = (): boolean => {
  return localStorage.getItem(FIRST_TIME_KEY) !== 'false';
};

/**
 * Mark player as returning (completed welcome flow)
 */
export const markPlayerAsReturning = (): void => {
  localStorage.setItem(FIRST_TIME_KEY, 'false');
};

export interface Player {
  id: string;
  display_name: string;
  created_at: string;
}

/**
 * Initialize anonymous auth and get/create player
 */
export const getOrCreatePlayerId = async (): Promise<string> => {
  // Check if we already have a session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Create anonymous session
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Error signing in anonymously:', error);
      throw new Error('Failed to create anonymous session');
    }
    console.log('Created anonymous session:', data.user?.id);
  }
  
  // Now create/get player via edge function (uses JWT from session)
  const { data, error } = await supabase.functions.invoke('create-player', {
    body: {},
  });
  
  if (error) {
    console.error('Error creating player:', error);
    throw new Error('Failed to create player');
  }
  
  if (data?.error) {
    console.error('Error creating player:', data.error);
    throw new Error(data.error);
  }
  
  const playerId = data.player.id;
  localStorage.setItem(PLAYER_ID_KEY, playerId);
  localStorage.setItem(PLAYER_NAME_KEY, data.player.display_name);
  
  return playerId;
};

/**
 * Get the player ID from localStorage without creating a new one
 */
export const getPlayerId = (): string | null => {
  return localStorage.getItem(PLAYER_ID_KEY);
};

/**
 * Get the player's display name from localStorage
 */
export const getPlayerName = async (): Promise<string> => {
  const cached = localStorage.getItem(PLAYER_NAME_KEY);
  if (cached) return cached;
  return 'שחקן אנונימי';
};

/**
 * Update the player's display name via secure edge function
 */
export const updatePlayerName = async (newName: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('update-player-name', {
    body: { display_name: newName },
  });
  
  if (error) {
    console.error('Error updating player name:', error);
    throw error;
  }
  
  if (data?.error) {
    throw new Error(data.error);
  }
  
  localStorage.setItem(PLAYER_NAME_KEY, newName);
};

/**
 * Get the full player data from localStorage
 */
export const getPlayer = async (): Promise<Player | null> => {
  const playerId = getPlayerId();
  if (!playerId) return null;
  
  const displayName = localStorage.getItem(PLAYER_NAME_KEY) || 'שחקן אנונימי';
  
  return {
    id: playerId,
    display_name: displayName,
    created_at: new Date().toISOString()
  };
};
