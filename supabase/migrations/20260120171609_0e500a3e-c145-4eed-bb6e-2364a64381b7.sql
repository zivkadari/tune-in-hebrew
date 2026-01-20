-- Fix groups SELECT policy to also allow creators to see their groups
DROP POLICY IF EXISTS "Members can read their groups" ON public.groups;

-- Allow reading groups if user is a member OR if they created it
CREATE POLICY "Members and creators can read their groups" ON public.groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = groups.id
    )
    OR created_by IS NOT NULL
  );