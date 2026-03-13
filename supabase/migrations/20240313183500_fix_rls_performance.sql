-- Migration: fix_rls_performance
-- Description: Fixes auth_rls_initplan and multiple_permissive_policies warnings.

-- 1. `departments`
DROP POLICY IF EXISTS "Departments are viewable by all authenticated users" ON public.departments;
DROP POLICY IF EXISTS "Super admins can manage departments" ON public.departments;

CREATE POLICY "Departments are viewable by all authenticated users"
ON public.departments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Super admins can insert departments"
ON public.departments FOR INSERT TO authenticated
WITH CHECK ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

CREATE POLICY "Super admins can update departments"
ON public.departments FOR UPDATE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

CREATE POLICY "Super admins can delete departments"
ON public.departments FOR DELETE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

-- 2. `log_entries`
DROP POLICY IF EXISTS "Managers view all logs" ON public.log_entries;
DROP POLICY IF EXISTS "Users manage own logs" ON public.log_entries;

CREATE POLICY "Users and managers can view logs"
ON public.log_entries FOR SELECT TO authenticated
USING ((user_id = (select auth.uid())) OR (( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Users can insert own logs"
ON public.log_entries FOR INSERT TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own logs"
ON public.log_entries FOR UPDATE TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own logs"
ON public.log_entries FOR DELETE TO authenticated
USING (user_id = (select auth.uid()));

-- 3. `projects`
DROP POLICY IF EXISTS "Authenticated can read projects" ON public.projects;
DROP POLICY IF EXISTS "Super admin manages projects" ON public.projects;

CREATE POLICY "Authenticated can read projects"
ON public.projects FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Super admin can insert projects"
ON public.projects FOR INSERT TO authenticated
WITH CHECK ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

CREATE POLICY "Super admin can update projects"
ON public.projects FOR UPDATE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

CREATE POLICY "Super admin can delete projects"
ON public.projects FOR DELETE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

-- 4. `protocols`
DROP POLICY IF EXISTS "Authenticated can read protocols" ON public.protocols;
DROP POLICY IF EXISTS "Super admin manages protocols" ON public.protocols;

CREATE POLICY "Authenticated can read protocols"
ON public.protocols FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Super admin can insert protocols"
ON public.protocols FOR INSERT TO authenticated
WITH CHECK ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

CREATE POLICY "Super admin can update protocols"
ON public.protocols FOR UPDATE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

CREATE POLICY "Super admin can delete protocols"
ON public.protocols FOR DELETE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

-- 5. `sites`
DROP POLICY IF EXISTS "Authenticated can read sites" ON public.sites;
DROP POLICY IF EXISTS "Super admin manages sites" ON public.sites;

CREATE POLICY "Authenticated can read sites"
ON public.sites FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Super admin can insert sites"
ON public.sites FOR INSERT TO authenticated
WITH CHECK ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

CREATE POLICY "Super admin can update sites"
ON public.sites FOR UPDATE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

CREATE POLICY "Super admin can delete sites"
ON public.sites FOR DELETE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = 'super_admin'::user_role));

-- 6. `user_profiles`
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Managers can view department profiles" ON public.user_profiles;

CREATE POLICY "Users can view specific profiles"
ON public.user_profiles FOR SELECT TO authenticated
USING (
  (id = (select auth.uid())) OR
  (get_user_role((select auth.uid())) = 'super_admin'::text) OR
  ((get_user_role((select auth.uid())) = 'manager'::text) AND ((department_id = get_user_dept((select auth.uid()))) OR (manager_id = (select auth.uid()))))
);

DROP POLICY IF EXISTS "Users can update own basic info" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Managers can update subordinates" ON public.user_profiles;

CREATE POLICY "Users can update specific profiles"
ON public.user_profiles FOR UPDATE TO authenticated
USING (
  (id = (select auth.uid())) OR
  (get_user_role((select auth.uid())) = 'super_admin'::text) OR
  ((get_user_role((select auth.uid())) = 'manager'::text) AND (manager_id = (select auth.uid())))
)
WITH CHECK (
  (get_user_role((select auth.uid())) = 'super_admin'::text) OR
  ((get_user_role((select auth.uid())) = 'manager'::text) AND (manager_id = (select auth.uid()))) OR
  ((id = (select auth.uid())) AND (role = ( SELECT user_profiles_1.role FROM user_profiles user_profiles_1 WHERE (user_profiles_1.id = (select auth.uid())))) AND (status = ( SELECT user_profiles_1.status FROM user_profiles user_profiles_1 WHERE (user_profiles_1.id = (select auth.uid())))))
);

-- 7. `user_project_assignments`
DROP POLICY IF EXISTS "Managers manage assignments" ON public.user_project_assignments;
DROP POLICY IF EXISTS "Users see own assignments" ON public.user_project_assignments;

CREATE POLICY "Users and managers can view assignments"
ON public.user_project_assignments FOR SELECT TO authenticated
USING (
  (user_id = (select auth.uid())) OR
  (( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role]))
);

CREATE POLICY "Managers can insert assignments"
ON public.user_project_assignments FOR INSERT TO authenticated
WITH CHECK ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Managers can update assignments"
ON public.user_project_assignments FOR UPDATE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Managers can delete assignments"
ON public.user_project_assignments FOR DELETE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role])));

-- 8. `user_protocol_assignments`
DROP POLICY IF EXISTS "Managers manage protocol assignments" ON public.user_protocol_assignments;
DROP POLICY IF EXISTS "Users see own protocol assignments" ON public.user_protocol_assignments;

CREATE POLICY "Users and managers can view protocol assignments"
ON public.user_protocol_assignments FOR SELECT TO authenticated
USING (
  (user_id = (select auth.uid())) OR
  (( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role]))
);

CREATE POLICY "Managers can insert protocol assignments"
ON public.user_protocol_assignments FOR INSERT TO authenticated
WITH CHECK ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Managers can update protocol assignments"
ON public.user_protocol_assignments FOR UPDATE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Managers can delete protocol assignments"
ON public.user_protocol_assignments FOR DELETE TO authenticated
USING ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role])));


-- 9. `app_notifications`
DROP POLICY IF EXISTS "Users manage own notifications" ON public.app_notifications;

CREATE POLICY "Users can view own notifications"
ON public.app_notifications FOR SELECT TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own notifications"
ON public.app_notifications FOR INSERT TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
ON public.app_notifications FOR UPDATE TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own notifications"
ON public.app_notifications FOR DELETE TO authenticated
USING (user_id = (select auth.uid()));


-- 10. `log_queries`
DROP POLICY IF EXISTS "Managers create queries" ON public.log_queries;
DROP POLICY IF EXISTS "Users see queries on own logs" ON public.log_queries;
DROP POLICY IF EXISTS "Users update queries on own logs" ON public.log_queries;

CREATE POLICY "Managers create queries"
ON public.log_queries FOR INSERT TO authenticated
WITH CHECK ((( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Users see queries on own logs"
ON public.log_queries FOR SELECT TO authenticated
USING (
  (manager_id = (select auth.uid())) OR
  (log_entry_id IN ( SELECT log_entries.id FROM log_entries WHERE (log_entries.user_id = (select auth.uid())))) OR
  (( SELECT user_profiles.role FROM user_profiles WHERE (user_profiles.id = (select auth.uid()))) = ANY (ARRAY['manager'::user_role, 'super_admin'::user_role]))
);

CREATE POLICY "Users update queries on own logs"
ON public.log_queries FOR UPDATE TO authenticated
USING (log_entry_id IN ( SELECT log_entries.id FROM log_entries WHERE (log_entries.user_id = (select auth.uid()))));


-- 11. `saved_templates`
DROP POLICY IF EXISTS "Users manage own templates" ON public.saved_templates;

CREATE POLICY "Users can view own templates"
ON public.saved_templates FOR SELECT TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own templates"
ON public.saved_templates FOR INSERT TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own templates"
ON public.saved_templates FOR UPDATE TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own templates"
ON public.saved_templates FOR DELETE TO authenticated
USING (user_id = (select auth.uid()));
