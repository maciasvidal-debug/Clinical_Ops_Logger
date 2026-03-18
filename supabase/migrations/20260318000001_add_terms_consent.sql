-- Adicionar campos de aceptación de términos en la tabla user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT;

-- Actualizar el trigger function para que guarde estos metadatos cuando se crea el usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, role, status, terms_accepted_at, terms_version)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'role', 'cra'),
    'pending',
    (new.raw_user_meta_data->>'terms_accepted_at')::TIMESTAMPTZ,
    new.raw_user_meta_data->>'terms_version'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
