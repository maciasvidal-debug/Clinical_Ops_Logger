-- Idempotent schema update for sites table
-- Adding number, address, and city

ALTER TABLE public.sites
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS site_number TEXT;
