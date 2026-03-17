-- Migration to fix Supabase Warnings: auth_rls_initplan and multiple_permissive_policies

-- 1. Fix auth_rls_initplan on system_errors
DO $$ BEGIN
    DROP POLICY IF EXISTS "Authenticated or Anon can insert system errors" ON public.system_errors;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Authenticated or Anon can insert system errors" ON public.system_errors
FOR INSERT TO public WITH CHECK (
  ((select auth.uid()) IS NOT NULL) OR ((select auth.role()) = 'anon'::text)
);


-- 2. Fix multiple_permissive_policies on activity_categories
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable all access for admins and managers on categories" ON public.activity_categories;
    DROP POLICY IF EXISTS "Enable read access for all active categories" ON public.activity_categories;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Enable read access for all active categories or admins" ON public.activity_categories
FOR SELECT TO public USING (
  (is_active = true) OR
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable insert for admins and managers on categories" ON public.activity_categories
FOR INSERT TO public WITH CHECK (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable update for admins and managers on categories" ON public.activity_categories
FOR UPDATE TO public USING (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable delete for admins and managers on categories" ON public.activity_categories
FOR DELETE TO public USING (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);


-- 3. Fix multiple_permissive_policies on activity_tasks
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable all access for admins and managers on tasks" ON public.activity_tasks;
    DROP POLICY IF EXISTS "Enable read access for all active tasks" ON public.activity_tasks;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Enable read access for all active tasks or admins" ON public.activity_tasks
FOR SELECT TO public USING (
  (is_active = true) OR
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable insert for admins and managers on tasks" ON public.activity_tasks
FOR INSERT TO public WITH CHECK (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable update for admins and managers on tasks" ON public.activity_tasks
FOR UPDATE TO public USING (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable delete for admins and managers on tasks" ON public.activity_tasks
FOR DELETE TO public USING (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);


-- 4. Fix multiple_permissive_policies on activity_subtasks
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable all access for admins and managers on subtasks" ON public.activity_subtasks;
    DROP POLICY IF EXISTS "Enable read access for all active subtasks" ON public.activity_subtasks;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Enable read access for all active subtasks or admins" ON public.activity_subtasks
FOR SELECT TO public USING (
  (is_active = true) OR
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable insert for admins and managers on subtasks" ON public.activity_subtasks
FOR INSERT TO public WITH CHECK (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable update for admins and managers on subtasks" ON public.activity_subtasks
FOR UPDATE TO public USING (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);

CREATE POLICY "Enable delete for admins and managers on subtasks" ON public.activity_subtasks
FOR DELETE TO public USING (
  (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.role = ANY (ARRAY['super_admin'::user_role, 'manager'::user_role])))))
);
