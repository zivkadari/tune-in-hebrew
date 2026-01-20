import { supabase } from "@/integrations/supabase/client";

const PLAYER_ID_KEY = "daily-time-attack-player-id";
const PLAYER_NAME_KEY = "daily-time-attack-player-name";

export interface Player {
  id: string;
  display_name: string;
  created_at: string;
}

/**
 * Get the player ID from localStorage, or create a new anonymous player
 * Uses secure edge function for player creation
 */
export const getOrCreatePlayerId = async (): Promise<string> => {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  
  if (playerId) {
    // We can't verify via direct DB call anymore (RLS blocks it)
    // Just trust localStorage for existing players
    return playerId;
  }
  
  // Create new player via secure edge function
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
  
  playerId = data.player.id;
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
 * We no longer fetch from DB due to RLS restrictions
 */
export const getPlayerName = async (): Promise<string> => {
  const cached = localStorage.getItem(PLAYER_NAME_KEY);
  if (cached) return cached;
  return 'שחקן אנונימי';
};

/**
 * Update the player's display name via secure edge function
 * The edge function validates player ownership before updating
 */
export const updatePlayerName = async (newName: string): Promise<void> => {
  const playerId = getPlayerId();
  if (!playerId) throw new Error('No player ID found');
  
  const { data, error } = await supabase.functions.invoke('update-player-name', {
    body: { display_name: newName },
    headers: {
      'x-player-id': playerId,
    },
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
 * We no longer fetch from DB due to RLS restrictions
 */
export const getPlayer = async (): Promise<Player | null> => {
  const playerId = getPlayerId();
  if (!playerId) return null;
  
  const displayName = localStorage.getItem(PLAYER_NAME_KEY) || 'שחקן אנונימי';
  
  return {
    id: playerId,
    display_name: displayName,
    created_at: new Date().toISOString() // Approximate
  };
};
