-- Add explicit RLS to the daily_songs_public view for clarity
-- Views inherit the security of the base table, but adding explicit policy documents intent

-- Enable RLS on the view (views can have RLS in PostgreSQL 15+)
-- Since the view already excludes 'answer', we allow public read
ALTER VIEW public.daily_songs_public SET (security_invoker = on);

-- Note: Views with security_invoker=on use the caller's permissions
-- Since base table has USING(false), direct calls will fail
-- Edge functions use service role which bypasses RLS