-- Migration: optimize_category_roles_rls
-- Description: Optimize Row Level Security policies for the category_roles table based on Supabase best practices.
-- Fixes inefficient ALL policies and unauthenticated access patterns.

-- 1. Drop existing unoptimized policies
DROP POLICY IF EXISTS "Enable read access for category_roles" ON public.category_roles;
DROP POLICY IF EXISTS "Enable all access for admins and managers on category_roles" ON public.category_roles;

-- 2. Create optimized SELECT policy for authenticated users only
CREATE POLICY "Category roles are viewable by all authenticated users"
ON public.category_roles FOR SELECT TO authenticated
USING (true);

-- 3. Create explicit INSERT policy for admins and managers
-- Using scalar subquery (SELECT auth.uid()) and direct column comparison for auth_rls_initplan cache
CREATE POLICY "Admins and managers can insert category_roles"
ON public.category_roles FOR INSERT TO authenticated
WITH CHECK (
  ((SELECT role FROM public.user_profiles WHERE id = (select auth.uid())) IN ('super_admin'::user_role, 'manager'::user_role))
);

-- 4. Create explicit UPDATE policy for admins and managers
CREATE POLICY "Admins and managers can update category_roles"
ON public.category_roles FOR UPDATE TO authenticated
USING (
  ((SELECT role FROM public.user_profiles WHERE id = (select auth.uid())) IN ('super_admin'::user_role, 'manager'::user_role))
);

-- 5. Create explicit DELETE policy for admins and managers
CREATE POLICY "Admins and managers can delete category_roles"
ON public.category_roles FOR DELETE TO authenticated
USING (
  ((SELECT role FROM public.user_profiles WHERE id = (select auth.uid())) IN ('super_admin'::user_role, 'manager'::user_role))
);
