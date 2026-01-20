import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

const FIRST_TIME_KEY = "daily-time-attack-first-time";
const PLAYER_NAME_KEY = "daily-time-attack-player-name";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

/**
 * Initialize anonymous authentication
 * Creates a new anonymous session or restores existing one
 */
export const initializeAuth = async (): Promise<{ user: User | null; session: Session | null }> => {
  // First check for existing session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Error getting session:', sessionError);
  }
  
  if (session?.user) {
    // Existing session found
    return { user: session.user, session };
  }
  
  // No session - sign in anonymously
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    console.error('Error signing in anonymously:', error);
    throw new Error('Failed to create anonymous session');
  }
  
  return { user: data.user, session: data.session };
};

/**
 * Get the current user ID (from Supabase Auth)
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
};

/**
 * Get the current session (for making authenticated requests)
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

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

/**
 * Get the player's display name from localStorage (cache)
 */
export const getPlayerName = async (): Promise<string> => {
  const cached = localStorage.getItem(PLAYER_NAME_KEY);
  if (cached) return cached;
  return 'שחקן אנונימי';
};

/**
 * Update the player's display name via secure edge function
 * Uses JWT authentication instead of header-based auth
 */
export const updatePlayerName = async (newName: string): Promise<void> => {
  const session = await getCurrentSession();
  if (!session) throw new Error('Not authenticated');
  
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
 * Set cached player name (used after fetching from server)
 */
export const setCachedPlayerName = (name: string): void => {
  localStorage.setItem(PLAYER_NAME_KEY, name);
};
