-- Idempotent schema update for micro_zones table

CREATE TABLE IF NOT EXISTS public.micro_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.micro_zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "micro_zones_select_policy" ON public.micro_zones;
DROP POLICY IF EXISTS "micro_zones_insert_policy" ON public.micro_zones;
DROP POLICY IF EXISTS "micro_zones_update_policy" ON public.micro_zones;
DROP POLICY IF EXISTS "micro_zones_delete_policy" ON public.micro_zones;

-- Create policies (managers and super admins can view and manage)
CREATE POLICY "micro_zones_select_policy"
    ON public.micro_zones FOR SELECT
    USING (
        (SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) IN ('super_admin', 'manager', 'cra', 'crc')
    );

CREATE POLICY "micro_zones_insert_policy"
    ON public.micro_zones FOR INSERT
    WITH CHECK (
        (SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) IN ('super_admin', 'manager')
    );

CREATE POLICY "micro_zones_update_policy"
    ON public.micro_zones FOR UPDATE
    USING (
        (SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) IN ('super_admin', 'manager')
    );

CREATE POLICY "micro_zones_delete_policy"
    ON public.micro_zones FOR DELETE
    USING (
        (SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) IN ('super_admin', 'manager')
    );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_micro_zones_site_id ON public.micro_zones(site_id);
