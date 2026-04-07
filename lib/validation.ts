import type {
  UserProfile,
  LogEntry,
  Todo,
  DbActivityCategory,
  DbActivityTask,
  DbActivitySubtask,
  Project,
  Protocol,
  Site,
  UserRole,
  UserStatus
} from "./types.ts";

const VALID_ROLES: UserRole[] = [
  "super_admin",
  "manager",
  "crc",
  "cra",
  "data_entry",
  "recruitment_specialist",
  "retention_specialist",
  "cta",
  "ra"
];

const VALID_STATUSES: UserStatus[] = ["pending", "active", "rejected"];

function isString(val: any): val is string {
  return typeof val === "string";
}

function isNumber(val: any): val is number {
  return typeof val === "number";
}

function isBoolean(val: any): val is boolean {
  return typeof val === "boolean";
}

function isOptionalString(val: any): val is string | undefined {
  return val === undefined || isString(val);
}

function isOptionalNumber(val: any): val is number | undefined {
  return val === undefined || isNumber(val);
}

export function validateUserProfile(data: any): UserProfile | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.email)) return null;
  if (!VALID_ROLES.includes(data.role)) return null;
  if (!VALID_STATUSES.includes(data.status)) return null;

  return {
    id: data.id,
    email: data.email,
    first_name: isOptionalString(data.first_name) ? data.first_name : undefined,
    last_name: isOptionalString(data.last_name) ? data.last_name : undefined,
    role: data.role as UserRole,
    status: data.status as UserStatus,
    department_id: isOptionalString(data.department_id) ? data.department_id : undefined,
    manager_id: isOptionalString(data.manager_id) ? data.manager_id : undefined,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
    updated_at: isString(data.updated_at) ? data.updated_at : new Date().toISOString(),
  };
}

export function validateLogEntry(data: any): LogEntry | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.user_id) || !isString(data.date)) return null;
  if (!isNumber(data.duration_minutes)) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    date: data.date,
    duration_minutes: data.duration_minutes,
    project_id: isOptionalString(data.project_id) ? data.project_id : undefined,
    protocol_id: isOptionalString(data.protocol_id) ? data.protocol_id : undefined,
    site_id: isOptionalString(data.site_id) ? data.site_id : undefined,
    role: isString(data.role) ? data.role : "unknown",
    category: isString(data.category) ? data.category : "unknown",
    activity: isString(data.activity) ? data.activity : "unknown",
    sub_task: isOptionalString(data.sub_task) ? data.sub_task : undefined,
    notes: isString(data.notes) ? data.notes : "",
    todo_id: isOptionalString(data.todo_id) ? data.todo_id : undefined,
    priority: (data.priority === "low" || data.priority === "medium" || data.priority === "high" || data.priority === "critical") ? data.priority : undefined,
    status: (data.status === "completed" || data.status === "pending") ? data.status : undefined,
    synced: isBoolean(data.synced) ? data.synced : false,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
    updated_at: isString(data.updated_at) ? data.updated_at : new Date().toISOString(),
  };
}

export function validateTodo(data: any): Todo | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.user_id) || !isString(data.title)) return null;
  if (data.status !== "pending" && data.status !== "completed") return null;

  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    status: data.status,
    priority: (data.priority === "low" || data.priority === "medium" || data.priority === "high" || data.priority === "critical") ? data.priority : undefined,
    estimated_duration_minutes: isOptionalNumber(data.estimated_duration_minutes) ? data.estimated_duration_minutes : undefined,
    project_id: isOptionalString(data.project_id) ? data.project_id : undefined,
    protocol_id: isOptionalString(data.protocol_id) ? data.protocol_id : undefined,
    site_id: isOptionalString(data.site_id) ? data.site_id : undefined,
    category_id: isOptionalString(data.category_id) ? data.category_id : undefined,
    task_id: isOptionalString(data.task_id) ? data.task_id : undefined,
    subtask_id: isOptionalString(data.subtask_id) ? data.subtask_id : undefined,
    notes: isOptionalString(data.notes) ? data.notes : undefined,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
    updated_at: isString(data.updated_at) ? data.updated_at : new Date().toISOString(),
    completed_at: isOptionalString(data.completed_at) ? data.completed_at : undefined,
  };
}

function validateSubtask(data: any): DbActivitySubtask | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.task_id) || !isString(data.name)) return null;

  return {
    id: data.id,
    task_id: data.task_id,
    name: data.name,
    description: isOptionalString(data.description) ? data.description : undefined,
    is_active: isBoolean(data.is_active) ? data.is_active : true,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
    updated_at: isString(data.updated_at) ? data.updated_at : new Date().toISOString(),
  };
}

function validateTask(data: any): DbActivityTask | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.category_id) || !isString(data.name)) return null;

  const subtasks: DbActivitySubtask[] = [];
  if (Array.isArray(data.activity_subtasks)) {
    for (const st of data.activity_subtasks) {
      const validated = validateSubtask(st);
      if (validated) subtasks.push(validated);
    }
  }

  const taskRoles: { role: UserRole }[] = [];
  if (Array.isArray(data.task_roles)) {
    for (const tr of data.task_roles) {
      if (tr && typeof tr === "object" && VALID_ROLES.includes(tr.role)) {
        taskRoles.push({ role: tr.role as UserRole });
      }
    }
  }

  return {
    id: data.id,
    category_id: data.category_id,
    name: data.name,
    description: isOptionalString(data.description) ? data.description : undefined,
    is_active: isBoolean(data.is_active) ? data.is_active : true,
    role_context: (data.role_context === "site_led" || data.role_context === "cro_led" || data.role_context === "shared") ? data.role_context : undefined,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
    updated_at: isString(data.updated_at) ? data.updated_at : new Date().toISOString(),
    activity_subtasks: subtasks,
    task_roles: taskRoles,
  };
}

export function validateCategory(data: any): DbActivityCategory | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.name)) return null;

  const tasks: DbActivityTask[] = [];
  if (Array.isArray(data.activity_tasks)) {
    for (const t of data.activity_tasks) {
      const validated = validateTask(t);
      if (validated) tasks.push(validated);
    }
  }

  const categoryRoles: { role: UserRole }[] = [];
  if (Array.isArray(data.category_roles)) {
    for (const cr of data.category_roles) {
      if (cr && typeof cr === "object" && VALID_ROLES.includes(cr.role)) {
        categoryRoles.push({ role: cr.role as UserRole });
      }
    }
  }

  return {
    id: data.id,
    name: data.name,
    description: isOptionalString(data.description) ? data.description : undefined,
    is_active: isBoolean(data.is_active) ? data.is_active : true,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
    updated_at: isString(data.updated_at) ? data.updated_at : new Date().toISOString(),
    activity_tasks: tasks,
    category_roles: categoryRoles,
  };
}

export function validateProject(data: any): Project | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.name)) return null;

  return {
    id: data.id,
    name: data.name,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
  };
}

export function validateProtocol(data: any): Protocol | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.project_id) || !isString(data.name)) return null;

  return {
    id: data.id,
    project_id: data.project_id,
    name: data.name,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
  };
}

export function validateSite(data: any): Site | null {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.id) || !isString(data.protocol_id) || !isString(data.name) || !isString(data.country)) return null;

  return {
    id: data.id,
    protocol_id: data.protocol_id,
    name: data.name,
    address: isOptionalString(data.address) ? data.address : undefined,
    city: isOptionalString(data.city) ? data.city : undefined,
    country: data.country,
    region_id: isOptionalString(data.region_id) ? data.region_id : undefined,
    site_number: isOptionalString(data.site_number) ? data.site_number : undefined,
    created_at: isString(data.created_at) ? data.created_at : new Date().toISOString(),
  };
}
