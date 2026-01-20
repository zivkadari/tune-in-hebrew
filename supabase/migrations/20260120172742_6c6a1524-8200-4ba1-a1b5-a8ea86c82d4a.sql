-- ============================================
-- FIX: Remove insecure header-based RLS policies
-- Block all direct access, use edge functions only
-- ============================================

-- 1. PLAYERS: Block all direct access
DROP POLICY IF EXISTS "Players can read own profile" ON public.players;
DROP POLICY IF EXISTS "Anyone can create player" ON public.players;
DROP POLICY IF EXISTS "Anyone can read players" ON public.players;

-- No direct access to players table - use edge functions only
CREATE POLICY "No direct access" ON public.players
  FOR ALL USING (false);

-- 2. GROUPS: Block all direct access  
DROP POLICY IF EXISTS "Members and creators can read their groups" ON public.groups;
DROP POLICY IF EXISTS "Anyone can create groups" ON public.groups;

-- No direct access to groups table - use edge functions only
CREATE POLICY "No direct access" ON public.groups
  FOR ALL USING (false);

-- 3. GROUP_MEMBERS: Block all direct access
DROP POLICY IF EXISTS "Members can read group members" ON public.group_members;
DROP POLICY IF EXISTS "Anyone can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Anyone can leave groups" ON public.group_members;

-- No direct access - use edge functions only
CREATE POLICY "No direct access" ON public.group_members
  FOR ALL USING (false);

-- 4. DAILY_TIME_ATTACK_RUNS: Block direct access, leaderboard via edge function
DROP POLICY IF EXISTS "Anyone can read runs for leaderboard" ON public.daily_time_attack_runs;
DROP POLICY IF EXISTS "Anyone can read runs" ON public.daily_time_attack_runs;

-- No direct access - use edge functions only
CREATE POLICY "No direct access" ON public.daily_time_attack_runs
  FOR ALL USING (false);

-- 5. DAILY_TIME_ATTACK_SETS: Block direct access
DROP POLICY IF EXISTS "Anyone can insert daily sets" ON public.daily_time_attack_sets;
DROP POLICY IF EXISTS "Anyone can read daily sets" ON public.daily_time_attack_sets;

-- No direct access - use edge functions only  
CREATE POLICY "No direct access" ON public.daily_time_attack_sets
  FOR ALL USING (false);

-- 6. DAILY_SONGS: Already blocked, verify
DROP POLICY IF EXISTS "No direct access to songs" ON public.daily_songs;
DROP POLICY IF EXISTS "Anyone can read songs" ON public.daily_songs;

CREATE POLICY "No direct access" ON public.daily_songs
  FOR ALL USING (false);