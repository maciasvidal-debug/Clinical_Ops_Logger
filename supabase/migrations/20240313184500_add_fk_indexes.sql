-- Migration: add_fk_indexes
-- Description: Adds covering indexes to foreign keys to optimize query performance and resolve `unindexed_foreign_keys` warnings.

CREATE INDEX IF NOT EXISTS idx_app_notifications_user_id ON public.app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_protocol_id ON public.log_entries(protocol_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_site_id ON public.log_entries(site_id);
CREATE INDEX IF NOT EXISTS idx_log_queries_manager_id ON public.log_queries(manager_id);
CREATE INDEX IF NOT EXISTS idx_protocols_project_id ON public.protocols(project_id);
CREATE INDEX IF NOT EXISTS idx_saved_templates_user_id ON public.saved_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_protocol_id ON public.sites(protocol_id);
CREATE INDEX IF NOT EXISTS idx_user_project_assignments_project_id ON public.user_project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_user_protocol_assignments_protocol_id ON public.user_protocol_assignments(protocol_id);
