-- Fix: infinite recursion in profiles SELECT policy
-- The old policy "Users can view own org profiles" does:
--   org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
-- which causes infinite recursion because it SELECTs from profiles during a SELECT on profiles.
--
-- Solution: Drop the recursive policy. Keep the simple self-read policy from 004.
-- Add a new non-recursive policy for org-mates using a security definer function.

-- Step 1: Drop the recursive policy
DROP POLICY IF EXISTS "Users can view own org profiles" ON profiles;

-- Step 2: Also drop the 004 policy so we can recreate cleanly
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Step 3: Create a helper function to get the user's org_id without RLS
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$;

-- Step 4: Self-read policy (non-recursive)
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Step 5: Org-mates policy using the helper function (non-recursive)
CREATE POLICY "Users can view org profiles" ON profiles
  FOR SELECT USING (org_id = get_my_org_id());

-- Step 6: Also fix the organizations policy which has the same recursion issue
DROP POLICY IF EXISTS "Users can view own org" ON organizations;
CREATE POLICY "Users can view own org" ON organizations
  FOR SELECT USING (id = get_my_org_id());
