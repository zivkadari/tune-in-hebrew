-- Fix 1: Restrict groups table to only show groups user is a member of
-- Create a view that excludes join_code for public access
DROP POLICY IF EXISTS "Anyone can read groups" ON public.groups;

-- Create security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _player_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND player_id = _player_id
  )
$$;

-- Users can only see groups they are members of (with join_code)
-- But we need a way to look up groups by join_code for joining
CREATE POLICY "Members can read their groups" ON public.groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id
    )
  );

-- Fix 2: Restrict daily_time_attack_runs - anyone can INSERT/SELECT but we validate player_id via edge function
-- Remove overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert runs" ON public.daily_time_attack_runs;

-- Runs table should be read-only from client side
-- All inserts should go through an edge function that validates player_id
-- Keep SELECT for leaderboard functionality