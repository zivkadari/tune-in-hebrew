export interface DailySong {
  id: number;
  type: 'song' | 'artist';
  encrypted_answer: string; // Server-encrypted answer - client cannot decrypt
  audio_url: string;
  release_year: number;
  answer_pattern: number[]; // Length of each word, e.g., [3, 6] for "אגם בוחבוט"
  answer_length: number;    // Total letters (excluding spaces)
  shuffled_letters: string[]; // Real answer letters + fake letters, shuffled
}

export interface DailySet {
  date: string;
  songs: DailySong[];
}

export interface DailyRun {
  id: string;
  player_id: string;
  date: string;
  run_type: 'official' | 'practice';
  correct_count: number;
  elapsed_ms: number;
  effective_ms: number;
  completed_all_12: boolean;
  skip_used: boolean;
  year_hint_used: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  player_id: string;
  display_name: string;
  correct_count: number;
  effective_ms: number;
  created_at: string;
  is_current_player?: boolean;
}

export interface Group {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  player_id: string;
  joined_at: string;
  display_name?: string;
}

export interface Slot {
  id: number;
  letter: string | null;
  bubbleId: number | null;
  isSpace?: boolean;
}

export interface Bubble {
  id: number;
  letter: string;
  isUsed: boolean;
}

export type RunType = 'official' | 'practice';
export type SlotState = 'normal' | 'correct' | 'wrong';
export type DailyScreen = 
  | 'daily-home' 
  | 'daily-run' 
  | 'daily-results' 
  | 'groups' 
  | 'group-detail'
  | 'group-leaderboard'
  | 'leaderboard';

export type MessageType = 'success' | 'error' | 'warning' | null;
