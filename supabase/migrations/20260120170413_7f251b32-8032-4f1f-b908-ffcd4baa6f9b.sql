-- Remove the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can update player" ON public.players;

-- No UPDATE policy - all updates must go through edge function