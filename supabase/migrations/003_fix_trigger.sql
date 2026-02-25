-- Fix: allow service-role inserts on organizations & profiles
-- The trigger runs as SECURITY DEFINER (postgres user) but RLS blocks inserts.
-- Add policies for insert, or use ALTER to allow the trigger to bypass.

-- Organizations: allow inserts from the trigger (service role / authenticated)
CREATE POLICY "Service can insert orgs" ON organizations
  FOR INSERT WITH CHECK (true);

-- Profiles: allow inserts from the trigger
CREATE POLICY "Service can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Recreate trigger function with explicit search_path
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  _org_id UUID;
BEGIN
  -- If org_id provided in metadata, use it; otherwise create a new org
  IF NEW.raw_user_meta_data->>'org_id' IS NOT NULL THEN
    _org_id := (NEW.raw_user_meta_data->>'org_id')::UUID;
  ELSE
    INSERT INTO public.organizations (name, slug)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'org_name', split_part(NEW.email, '@', 2)),
      gen_random_uuid()::TEXT
    )
    RETURNING id INTO _org_id;
  END IF;

  INSERT INTO public.profiles (id, org_id, email, full_name, role)
  VALUES (
    NEW.id,
    _org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
