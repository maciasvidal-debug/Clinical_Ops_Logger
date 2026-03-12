-- Fix infinite recursion in user_profiles RLS policies

-- Drop the old recursive policies
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Managers can view department profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Managers can update subordinates" ON user_profiles;

-- Instead of querying user_profiles inside the user_profiles policy,
-- we will use a SECURITY DEFINER function to bypass RLS when checking roles

CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM user_profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION get_user_dept(user_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id FROM user_profiles WHERE id = user_id;
$$;

-- Now recreate the policies using the security definer functions

CREATE POLICY "Super admins can view all profiles"
ON user_profiles FOR SELECT TO authenticated
USING ( get_user_role(auth.uid()) = 'super_admin' );

CREATE POLICY "Managers can view department profiles"
ON user_profiles FOR SELECT TO authenticated
USING (
    get_user_role(auth.uid()) = 'manager' AND
    (
        department_id = get_user_dept(auth.uid()) OR
        manager_id = auth.uid() OR
        id = auth.uid()
    )
);

CREATE POLICY "Super admins can update all profiles"
ON user_profiles FOR UPDATE TO authenticated
USING ( get_user_role(auth.uid()) = 'super_admin' );

CREATE POLICY "Managers can update subordinates"
ON user_profiles FOR UPDATE TO authenticated
USING (
    get_user_role(auth.uid()) = 'manager' AND
    manager_id = auth.uid()
);
