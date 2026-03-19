-- Create a secure RPC function to "soft delete" a user account
-- It anonymizes the user_profile and disables the auth account.

CREATE OR REPLACE FUNCTION delete_user_account(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Verify the user requesting the deletion is the user being deleted
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'You can only delete your own account.';
  END IF;

  -- 1. Unassign from all active projects and protocols
  DELETE FROM public.user_project_assignments WHERE public.user_project_assignments.user_id = delete_user_account.user_id;
  DELETE FROM public.user_protocol_assignments WHERE public.user_protocol_assignments.user_id = delete_user_account.user_id;

  -- 2. Auto-reply to open queries (where the user is the one who created the log entry)
  UPDATE public.log_queries
  SET
    staff_response = 'El usuario eliminó su cuenta sin responder la consulta. Póngase en contacto directo con el usuario.',
    response_date = NOW(),
    status = 'resolved'
  WHERE status = 'open'
    AND log_entry_id IN (
      SELECT id FROM public.log_entries WHERE public.log_entries.user_id = delete_user_account.user_id
    );

  -- 3. Auto-reply to open queries (where the user is the manager who created the query, if any)
  -- If a manager deletes their account, their queries should probably be closed or reassigned.
  -- We'll just close them with a note.
  UPDATE public.log_queries
  SET
    staff_response = 'El manager eliminó su cuenta.',
    response_date = NOW(),
    status = 'resolved'
  WHERE status = 'open'
    AND manager_id = delete_user_account.user_id;

  -- 4. Anonymize user_profiles
  UPDATE public.user_profiles
  SET
    first_name = 'Usuario',
    last_name = 'Eliminado',
    email = 'anon_' || REPLACE(user_id::text, '-', '') || '@eliminado.com',
    status = 'rejected',
    role = 'staff' -- Lower permissions
  WHERE id = user_id;

  -- 5. Anonymize auth.users (to revoke access and remove PII)
  -- This requires SECURITY DEFINER and search_path to include auth.
  -- We'll update the email and scramble the password.
  -- Setting the email to a fake one prevents re-login with the old email,
  -- and also frees up the old email in case they want to sign up again (though we might not want that, but GDPR requires removing PII).
  UPDATE auth.users
  SET
    email = 'anon_' || REPLACE(user_id::text, '-', '') || '@eliminado.com',
    encrypted_password = crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')),
    raw_user_meta_data = '{}'::jsonb,
    raw_app_meta_data = '{}'::jsonb,
    email_confirmed_at = NULL,
    phone = NULL,
    banned_until = NOW() + INTERVAL '100 years' -- effectively ban the user
  WHERE id = user_id;

END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(uuid) TO authenticated;
