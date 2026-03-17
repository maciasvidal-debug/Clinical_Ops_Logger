-- Migration to fix Supabase Warnings: unindexed_foreign_keys

-- 1. Index for log_entries.todo_id
CREATE INDEX IF NOT EXISTS idx_log_entries_todo_id ON public.log_entries(todo_id);

-- 2. Indexes for todos foreign keys
CREATE INDEX IF NOT EXISTS idx_todos_category_id ON public.todos(category_id);
CREATE INDEX IF NOT EXISTS idx_todos_project_id ON public.todos(project_id);
CREATE INDEX IF NOT EXISTS idx_todos_protocol_id ON public.todos(protocol_id);
CREATE INDEX IF NOT EXISTS idx_todos_site_id ON public.todos(site_id);
CREATE INDEX IF NOT EXISTS idx_todos_subtask_id ON public.todos(subtask_id);
CREATE INDEX IF NOT EXISTS idx_todos_task_id ON public.todos(task_id);
