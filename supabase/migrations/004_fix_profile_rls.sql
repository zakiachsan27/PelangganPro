-- Fix: users must be able to read their OWN profile (circular RLS dependency)
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
