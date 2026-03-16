-- Migration to add role_context enum and column to activity_tasks table

-- 1. Create ENUM type for role_context
DO $$ BEGIN
    CREATE TYPE task_role_context AS ENUM ('site_led', 'cro_led', 'shared');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role_context column to activity_tasks, defaulting to site_led
ALTER TABLE public.activity_tasks
ADD COLUMN IF NOT EXISTS role_context task_role_context DEFAULT 'site_led';

-- 3. Update existing tasks that are specifically mentioned in the request.
-- Instruction: "asigne site_led por defecto a los registros existentes y actualice los nombres de tareas con el sufijo (Site)".
UPDATE public.activity_tasks
SET
  role_context = 'site_led',
  name = name || ' (Site)'
WHERE
  role_context = 'site_led' AND name NOT LIKE '% (Site)%';


-- 4. Seed new structure (Idempotent upserts)
-- Given the requested Tree structure, let's create it.
-- We need a function to ensure UUID generation based on names or just using fixed UUIDs.
-- Or better, we can insert or update based on names if we don't have UUIDs beforehand.
-- The user didn't ask to create a seeding script as part of the database migration, but they asked for:
-- "Migración: Script SQL idempotente que asigne site_led por defecto a los registros existentes y actualice los nombres de tareas con el sufijo (Site)."
-- which is what I've done above.
-- However, we can use gen_random_uuid() and unique constraints to idempotently insert the new tree.
-- For safety, I'll stop at the column migration and data update requested,
-- and the rest of the new Tree structure will be added via UI or seed if needed,
-- but the prompt explicitly said: "asigne site_led por defecto a los registros existentes y actualice los nombres de tareas con el sufijo (Site). Si es posible una la conexión MCP para aplicar el script."
