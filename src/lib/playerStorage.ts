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
 * Get or create player - assumes session already exists (initialized in Index.tsx)
 */
export const getOrCreatePlayerId = async (): Promise<string> => {
  // Verify we have a session (should already exist from Index.tsx initialization)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error('No session found - this should not happen');
    throw new Error('No active session. Please refresh the page.');
  }
  
  console.log('Creating/getting player for auth user:', session.user.id);
  
  // Create/get player via edge function (uses JWT from session)
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

/**
 * Delete the player account completely
 * This removes the player from all groups, deletes their runs, and removes their player record
 */
export const deletePlayer = async (): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('delete-player', {
    body: {},
  });
  
  if (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
  
  if (data?.error) {
    throw new Error(data.error);
  }
  
  // Clear all local storage
  localStorage.removeItem(PLAYER_ID_KEY);
  localStorage.removeItem(PLAYER_NAME_KEY);
  localStorage.removeItem(FIRST_TIME_KEY);
  
  // Sign out from Supabase
  await supabase.auth.signOut();
};

/**
 * Leave a specific group
 */
export const leaveGroup = async (groupId: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('leave-group', {
    body: { group_id: groupId },
  });
  
  if (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
  
  if (data?.error) {
    throw new Error(data.error);
  }
};
