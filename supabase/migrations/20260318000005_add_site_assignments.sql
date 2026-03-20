-- Idempotent schema update for user_site_assignments table

CREATE TABLE IF NOT EXISTS public.user_site_assignments (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, site_id)
);

-- Enable RLS
ALTER TABLE public.user_site_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_site_assignments_select_policy" ON public.user_site_assignments;
DROP POLICY IF EXISTS "user_site_assignments_insert_policy" ON public.user_site_assignments;
DROP POLICY IF EXISTS "user_site_assignments_delete_policy" ON public.user_site_assignments;

-- Create policies (managers and super admins can view and manage, assigned users can view)
CREATE POLICY "user_site_assignments_select_policy"
    ON public.user_site_assignments FOR SELECT
    USING (
        (SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) IN ('super_admin', 'manager')
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "user_site_assignments_insert_policy"
    ON public.user_site_assignments FOR INSERT
    WITH CHECK (
        (SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) IN ('super_admin', 'manager')
    );

CREATE POLICY "user_site_assignments_delete_policy"
    ON public.user_site_assignments FOR DELETE
    USING (
        (SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) IN ('super_admin', 'manager')
    );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_site_assignments_user_id ON public.user_site_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_site_assignments_site_id ON public.user_site_assignments(site_id);
