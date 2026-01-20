-- Add auth_user_id column to link players to Supabase Auth users
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_auth_user_id ON public.players(auth_user_id);