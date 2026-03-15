-- Create system_errors table for centralized error logging
CREATE TABLE IF NOT EXISTS public.system_errors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_errors_created_at ON public.system_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_errors_user_id ON public.system_errors(user_id);

-- Enable RLS
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (authenticated or anon) to insert errors
-- We want to capture errors even if the user isn't fully logged in
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'system_errors' AND policyname = 'Anyone can insert system errors'
    ) THEN
        CREATE POLICY "Anyone can insert system errors" ON public.system_errors
            FOR INSERT WITH CHECK (true);
    END IF;
END
$$;

-- Policy: Only super admins and managers can view errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'system_errors' AND policyname = 'Super admins and managers can view errors'
    ) THEN
        CREATE POLICY "Super admins and managers can view errors" ON public.system_errors
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE id = (select auth.uid())
                    AND role IN ('super_admin', 'manager')
                )
            );
    END IF;
END
$$;
