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
 */
export const getOrCreatePlayerId = async (): Promise<string> => {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  
  if (playerId) {
    // Verify the player still exists in DB
    const { data } = await supabase
      .from('players')
      .select('id')
      .eq('id', playerId)
      .single();
    
    if (data) {
      return playerId;
    }
    // Player was deleted, clear localStorage
    localStorage.removeItem(PLAYER_ID_KEY);
    localStorage.removeItem(PLAYER_NAME_KEY);
  }
  
  // Create new player
  const { data, error } = await supabase
    .from('players')
    .insert({})
    .select('id, display_name')
    .single();
  
  if (error) {
    console.error('Error creating player:', error);
    throw new Error('Failed to create player');
  }
  
  playerId = data.id;
  localStorage.setItem(PLAYER_ID_KEY, playerId);
  localStorage.setItem(PLAYER_NAME_KEY, data.display_name);
  
  return playerId;
};

/**
 * Get the player ID from localStorage without creating a new one
 */
export const getPlayerId = (): string | null => {
  return localStorage.getItem(PLAYER_ID_KEY);
};

/**
 * Get the player's display name
 */
export const getPlayerName = async (): Promise<string> => {
  const playerId = getPlayerId();
  if (!playerId) return 'שחקן אנונימי';
  
  const cached = localStorage.getItem(PLAYER_NAME_KEY);
  if (cached) return cached;
  
  const { data } = await supabase
    .from('players')
    .select('display_name')
    .eq('id', playerId)
    .single();
  
  if (data) {
    localStorage.setItem(PLAYER_NAME_KEY, data.display_name);
    return data.display_name;
  }
  
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
 * Get the full player data
 */
export const getPlayer = async (): Promise<Player | null> => {
  const playerId = getPlayerId();
  if (!playerId) return null;
  
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();
  
  return data;
};
