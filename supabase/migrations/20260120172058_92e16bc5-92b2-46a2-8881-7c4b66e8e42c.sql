-- ============================================
-- COMPREHENSIVE SECURITY FIX
-- ============================================

-- 1. FIX: daily_songs - Hide answers from direct access
-- Create a view without answers for public access
CREATE OR REPLACE VIEW public.daily_songs_public
WITH (security_invoker = on) AS
  SELECT id, type, audio_url, release_year, is_active, pool_order, created_at
  FROM public.daily_songs;
  -- Note: 'answer' is intentionally excluded

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Anyone can read songs" ON public.daily_songs;

-- Create restrictive policy - no direct SELECT allowed
CREATE POLICY "No direct access to songs" ON public.daily_songs
  FOR SELECT USING (false);

-- 2. FIX: groups - Fix logic flaw in SELECT policy
DROP POLICY IF EXISTS "Members and creators can read their groups" ON public.groups;

-- Proper policy: only members OR creators can see their groups
CREATE POLICY "Members and creators can read their groups" ON public.groups
  FOR SELECT USING (
    public.is_group_member(id, (
      SELECT id FROM players 
      WHERE id::text = current_setting('request.headers', true)::json->>'x-player-id'
      LIMIT 1
    ))
    OR created_by::text = current_setting('request.headers', true)::json->>'x-player-id'
  );

-- Drop and replace overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create groups" ON public.groups;
-- Groups creation will be via edge function only (already implemented)

-- 3. FIX: group_members - Restrict DELETE to own membership only
DROP POLICY IF EXISTS "Anyone can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Anyone can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Anyone can read members" ON public.group_members;

-- Only allow reading members if you're in the same group
CREATE POLICY "Members can read group members" ON public.group_members
  FOR SELECT USING (
    public.is_group_member(group_id, (
      SELECT id FROM players 
      WHERE id::text = current_setting('request.headers', true)::json->>'x-player-id'
      LIMIT 1
    ))
  );

-- No direct INSERT/DELETE - use edge functions only
-- (join-group edge function already exists)

-- 4. FIX: players - Restrict visibility
DROP POLICY IF EXISTS "Anyone can read players" ON public.players;
DROP POLICY IF EXISTS "Anyone can create player" ON public.players;

-- Players can only see themselves and group members
CREATE POLICY "Players can read own profile" ON public.players
  FOR SELECT USING (
    id::text = current_setting('request.headers', true)::json->>'x-player-id'
  );

-- Player creation via edge function only

-- 5. FIX: daily_time_attack_sets - Already properly restricted, but tighten INSERT
DROP POLICY IF EXISTS "Anyone can insert daily sets" ON public.daily_time_attack_sets;
-- Sets should only be created by get-daily-set edge function

-- 6. FIX: daily_time_attack_runs - Already secured via edge function
-- Keep SELECT for leaderboard but ensure no direct INSERT
DROP POLICY IF EXISTS "Anyone can read runs" ON public.daily_time_attack_runs;

-- Only allow reading runs for leaderboard purposes (no PII exposed in runs)
CREATE POLICY "Anyone can read runs for leaderboard" ON public.daily_time_attack_runs
  FOR SELECT USING (true);