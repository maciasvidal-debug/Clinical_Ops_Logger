-- Create task_roles table
CREATE TABLE IF NOT EXISTS task_roles (
    task_id UUID NOT NULL REFERENCES activity_tasks(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (task_id, role)
);

-- RLS for task_roles
ALTER TABLE task_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotency)
DROP POLICY IF EXISTS "Allow public read access on task_roles" ON task_roles;
DROP POLICY IF EXISTS "Allow authenticated read access on task_roles" ON task_roles;
DROP POLICY IF EXISTS "Allow super_admin and manager all access on task_roles" ON task_roles;

-- Recreate policies
CREATE POLICY "Allow authenticated read access on task_roles"
    ON task_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow super_admin and manager all access on task_roles"
    ON task_roles FOR ALL
    TO authenticated
    USING (
        (SELECT role FROM user_profiles WHERE id = (select auth.uid())) IN ('super_admin', 'manager')
    )
    WITH CHECK (
        (SELECT role FROM user_profiles WHERE id = (select auth.uid())) IN ('super_admin', 'manager')
    );

-- Seed new Admin category
DO $$
DECLARE
    admin_cat_id UUID;
    t_personal UUID;
    t_finanzas UUID;
    t_reuniones UUID;
BEGIN
    -- Check if category already exists to be idempotent
    SELECT id INTO admin_cat_id FROM activity_categories WHERE name = '06. GESTIÓN ADMINISTRATIVA Y DEL SITIO';

    IF admin_cat_id IS NULL THEN
        INSERT INTO activity_categories (name, description, is_active)
        VALUES ('06. GESTIÓN ADMINISTRATIVA Y DEL SITIO', 'Tareas administrativas exclusivas para Managers y Site Admins', true)
        RETURNING id INTO admin_cat_id;

        -- Assign only to manager
        INSERT INTO category_roles (category_id, role)
        VALUES (admin_cat_id, 'manager');

        -- Tarea: Gestión de Personal
        INSERT INTO activity_tasks (category_id, name, is_active, role_context)
        VALUES (admin_cat_id, 'Gestión de Personal', true, 'site_led')
        RETURNING id INTO t_personal;

        INSERT INTO activity_subtasks (task_id, name, is_active)
        VALUES
            (t_personal, 'Evaluaciones de desempeño', true),
            (t_personal, 'Capacitación interna', true),
            (t_personal, 'Asignación de recursos', true);

        -- Tarea: Gestión Financiera y Contratos
        INSERT INTO activity_tasks (category_id, name, is_active, role_context)
        VALUES (admin_cat_id, 'Gestión Financiera y Contratos', true, 'site_led')
        RETURNING id INTO t_finanzas;

        INSERT INTO activity_subtasks (task_id, name, is_active)
        VALUES
            (t_finanzas, 'Revisión de pagos/viáticos', true),
            (t_finanzas, 'Facturación del sitio', true),
            (t_finanzas, 'Negociaciones', true);

        -- Tarea: Reuniones y Reportes
        INSERT INTO activity_tasks (category_id, name, is_active, role_context)
        VALUES (admin_cat_id, 'Reuniones y Reportes', true, 'shared')
        RETURNING id INTO t_reuniones;

        INSERT INTO activity_subtasks (task_id, name, is_active)
        VALUES
            (t_reuniones, 'Reuniones de equipo del sitio', true),
            (t_reuniones, 'Revisión de métricas de calidad', true),
            (t_reuniones, 'Preparación de reportes de estado', true);

    END IF;
END $$;
