-- Migration: add_telemetry_and_math
-- Description: Adds priority field to tasks/todos and creates mathematical views for predictive/explanatory models.

-- 1. Modify `todos` table
ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT NULL;

-- 2. Modify `log_entries` to link clearly with todos/tasks if needed and track priority
ALTER TABLE public.log_entries
ADD COLUMN IF NOT EXISTS todo_id UUID REFERENCES public.todos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- 3. Create a view for the Predictive Model (Duration Estimation)
-- This view calculates the average duration per user and category/activity.
CREATE OR REPLACE VIEW public.vw_user_task_duration_stats AS
SELECT
    user_id,
    category,
    activity,
    COUNT(*) as total_tasks,
    AVG(duration_minutes) as avg_duration_minutes,
    STDDEV(duration_minutes) as stddev_duration_minutes,
    MIN(duration_minutes) as min_duration_minutes,
    MAX(duration_minutes) as max_duration_minutes
FROM
    public.log_entries
WHERE
    status = 'completed' AND duration_minutes > 0
GROUP BY
    user_id, category, activity;

-- 4. Create a view for the Explanatory Model (Importance Weights / Priority Alignment)
-- This view aggregates time spent by priority level.
CREATE OR REPLACE VIEW public.vw_user_priority_alignment AS
SELECT
    user_id,
    priority,
    SUM(duration_minutes) as total_duration_minutes,
    COUNT(*) as tasks_count
FROM
    public.log_entries
WHERE
    status = 'completed' AND duration_minutes > 0
GROUP BY
    user_id, priority;

-- 5. Set up Row Level Security (RLS) for the new views
-- Views don't have RLS by default, we need to create secure wrapper functions or just grant select,
-- but since we query via service role or user, we can create secure RPC functions for the API.

CREATE OR REPLACE FUNCTION get_user_duration_stats(p_category TEXT, p_activity TEXT)
RETURNS TABLE (
    avg_duration_minutes NUMERIC,
    total_tasks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.avg_duration_minutes::NUMERIC,
        v.total_tasks::BIGINT
    FROM public.vw_user_task_duration_stats v
    WHERE v.user_id = auth.uid()
      AND v.category = p_category
      AND v.activity = p_activity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_priority_alignment()
RETURNS TABLE (
    priority VARCHAR,
    total_duration_minutes NUMERIC,
    tasks_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.priority::VARCHAR,
        v.total_duration_minutes::NUMERIC,
        v.tasks_count::BIGINT
    FROM public.vw_user_priority_alignment v
    WHERE v.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
