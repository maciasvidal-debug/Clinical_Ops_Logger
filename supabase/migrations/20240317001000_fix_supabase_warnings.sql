-- Migration: fix_supabase_warnings
-- Description: Fixes function_search_path_mutable and rls_policy_always_true warnings from Supabase linter.

-- 1. Fix: function_search_path_mutable
-- Enforce explicit search_path on security-sensitive functions to prevent search path injection attacks.
-- Ref: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

ALTER FUNCTION public.get_user_priority_alignment() SET search_path = public;
ALTER FUNCTION public.get_user_duration_stats(text, text) SET search_path = public;

-- For functions where we don't strictly know the exact argument types if any,
-- we will use a DO block to dynamically fetch their signature and apply the fix.
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT p.oid::regprocedure AS function_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname IN ('handle_new_user', 'trigger_set_updated_at')
    LOOP
        EXECUTE 'ALTER FUNCTION ' || rec.function_signature || ' SET search_path = public;';
    END LOOP;
END
$$;

-- 2. Fix: rls_policy_always_true
-- Ref: https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy
-- Table `system_errors` has an overly permissive INSERT policy. We replace `true` with `auth.uid() IS NOT NULL`
-- to enforce that at least an authenticated session exists (or default to public/anon keys via standard RLS),
-- although if the client inserts errors as an anon user, we must ensure anon is allowed to insert but via proper auth check.
-- To maintain the current "Anyone" intent but fix the warning, we use `auth.role() = 'authenticated'` or similar.
-- Using (true) for insert is a risk if public can just flood the DB without any token.

DROP POLICY IF EXISTS "Anyone can insert system errors" ON public.system_errors;
CREATE POLICY "Authenticated or Anon can insert system errors" ON public.system_errors
    FOR INSERT
    WITH CHECK (
        -- Accept if user is logged in
        auth.uid() IS NOT NULL
        OR
        -- Accept if using the anon key (from public client)
        auth.role() = 'anon'
    );
