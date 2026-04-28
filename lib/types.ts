export type UserRole =
  | "super_admin"
  | "manager"
  | "crc"
  | "cra"
  | "data_entry"
  | "recruitment_specialist"
  | "retention_specialist"
  | "cta"
  | "ra";

export type UserStatus = "pending" | "active" | "rejected";

export type View = "dashboard" | "log" | "history" | "reports" | "team" | "settings";

export interface DbActivitySubtask {
  id: string;
  task_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  terms_accepted_at?: string;
  terms_version?: string;
}

export interface DbActivityTask {
  role_context?: "site_led" | "cro_led" | "shared";
  id: string;
  category_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  activity_subtasks?: DbActivitySubtask[];
  task_roles?: { role: UserRole }[];
}

export interface DbActivityCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_roles?: { role: UserRole }[];
  activity_tasks?: DbActivityTask[];
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  status: "pending" | "completed";
  priority?: "low" | "medium" | "high" | "critical";
  estimated_duration_minutes?: number;
  project_id?: string;
  protocol_id?: string;
  site_id?: string;
  category_id?: string;
  task_id?: string;
  subtask_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  status: UserStatus;
  department_id?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Protocol {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}


export interface MicroZone {
  id: string;
  site_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  protocol_id: string;
  name: string;
  address?: string;
  city?: string;
  country: string;
  region_id?: string;
  created_at: string;
  regions?: Region;
  micro_zones?: MicroZone[];
  site_number?: string;
}


export interface Region {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRegion {
  user_id: string;
  region_id: string;
  created_at: string;
  // Joined fields for UI
  regions?: Region;
}

export interface LogEntry {

  id: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  project_id?: string;
  protocol_id?: string;
  site_id?: string;
  role: string;
  category: string;
  activity: string;
  sub_task?: string;
  notes: string;
  todo_id?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "completed" | "pending";
  synced: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields for UI
  user_profiles?: {
    first_name?: string;
    last_name?: string;
  };
  log_queries?: LogQuery[];
}

export interface LogQuery {
  id: string;
  log_entry_id: string;
  manager_id: string;
  manager_name: string;
  question: string;
  question_date: string;
  staff_response?: string;
  response_date?: string;
  status: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface UserProjectAssignment {
  user_id: string;
  project_id: string;
}

export interface UserProtocolAssignment {
  user_id: string;
  protocol_id: string;
}

export interface ActivityTask {
  roleContext?: "site_led" | "cro_led" | "shared";
  id: string;
  name: string;
  subTasks?: { id: string; name: string }[];
}

export interface ActivityCategory {
  id: string;
  name: string;
  tasks: ActivityTask[];
}

export const ROLE_PERMISSIONS: Record<UserRole, { canViewAllLogs: boolean }> = {
  super_admin: { canViewAllLogs: true },
  manager: { canViewAllLogs: true },
  crc: { canViewAllLogs: false },
  cra: { canViewAllLogs: false },
  data_entry: { canViewAllLogs: false },
  recruitment_specialist: { canViewAllLogs: false },
  retention_specialist: { canViewAllLogs: false },
  cta: { canViewAllLogs: false },
  ra: { canViewAllLogs: false },
};


// --- AI & Math Models Telemetry Types ---
export interface TaskDurationStats {
  avg_duration_minutes: number;
  total_tasks: number;
}

export interface PriorityAlignmentStats {
  priority: "low" | "medium" | "high" | "critical";
  total_duration_minutes: number;
  tasks_count: number;
}

export interface UserSiteAssignment {
  user_id: string;
  site_id: string;
}
