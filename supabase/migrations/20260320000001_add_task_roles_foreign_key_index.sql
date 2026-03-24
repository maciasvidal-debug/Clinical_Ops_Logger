-- Add index for foreign key if not exists (Best practices)
CREATE INDEX IF NOT EXISTS idx_task_roles_task_id ON task_roles(task_id);
