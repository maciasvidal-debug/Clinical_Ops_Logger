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

export interface DbActivitySubtask {
  id: string;
  task_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbActivityTask {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  activity_subtasks?: DbActivitySubtask[];
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
  id: string; // text in DB
  name: string;
  created_at: string;
}

export interface Protocol {
  id: string; // text in DB
  project_id: string;
  name: string;
  created_at: string;
}

export interface Site {
  id: string; // text in DB
  protocol_id: string;
  name: string;
  country: string;
  created_at: string;
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
  id: string;
  name: string;
  subTasks?: { id: string; name: string }[];
}

export interface ActivityCategory {
  id: string;
  name: string;
  tasks: ActivityTask[];
}

export const ROLE_HIERARCHY: Record<string, ActivityCategory[]> = {
  cra: [
    {
      id: "site_visits",
      name: "Site Monitoring Visits",
      tasks: [
        {
          id: "ssv",
          name: "Site Selection Visit (SSV)",
          subTasks: [
            { id: "ssv_fac", name: "Facility assessment" },
            { id: "ssv_pi", name: "PI qualification review" },
          ],
        },
        {
          id: "siv",
          name: "Site Initiation Visit (SIV)",
          subTasks: [
            { id: "siv_train", name: "Protocol training" },
            { id: "siv_ip", name: "IP handling review" },
          ],
        },
        {
          id: "rmv",
          name: "Routine Monitoring Visit (RMV)",
          subTasks: [
            { id: "rmv_sdv", name: "SDV/SDR" },
            { id: "rmv_ip", name: "IP accountability" },
          ],
        },
        {
          id: "cov",
          name: "Close-Out Visit (COV)",
          subTasks: [{ id: "cov_ip", name: "Final IP reconciliation" }],
        },
      ],
    },
    {
      id: "remote_mgt",
      name: "Remote Monitoring & Management",
      tasks: [
        {
          id: "central_mon",
          name: "Centralized Monitoring",
          subTasks: [
            { id: "cm_kri", name: "KRI review" },
            { id: "cm_trend", name: "Data trending analysis" },
          ],
        },
        {
          id: "site_comm",
          name: "Site Communication",
          subTasks: [
            { id: "sc_call", name: "Weekly check-in calls" },
            { id: "sc_email", name: "Email correspondence" },
          ],
        },
      ],
    },
  ],
  crc: [
    {
      id: "patient_visits",
      name: "Patient Visits & Clinical",
      tasks: [
        {
          id: "screening",
          name: "Screening & Consent",
          subTasks: [
            { id: "scr_cons", name: "Consent visit completed" },
            { id: "scr_fail", name: "Participant screenfailed" },
          ],
        },
        {
          id: "randomization",
          name: "Randomization",
          subTasks: [
            { id: "rnd_enr", name: "Participant Randomized/Enrolled" },
          ],
        },
        {
          id: "treatment",
          name: "Study Visits",
          subTasks: [
            { id: "vis_fu", name: "Follow-up visit completed" },
            { id: "vis_eot", name: "EOT visit completed" },
          ],
        },
      ],
    },
  ],
  recruitment_specialist: [
    {
      id: "outreach",
      name: "Outreach & Advertising",
      tasks: [
        {
          id: "campaign",
          name: "Campaign Management",
          subTasks: [{ id: "camp_social", name: "Social media ad placement" }],
        },
      ],
    },
  ],
  retention_specialist: [
    {
      id: "pt_engagement",
      name: "Patient Engagement",
      tasks: [
        {
          id: "retention_comms",
          name: "Retention Communications",
          subTasks: [{ id: "ret_call", name: "Retention call made" }],
        },
      ],
    },
  ],
  ra: [
    {
      id: "irb_iec",
      name: "IRB/IEC Submissions",
      tasks: [
        {
          id: "init_sub",
          name: "Initial Submissions",
          subTasks: [{ id: "init_prot", name: "Protocol/ICF preparation" }],
        },
      ],
    },
  ],
  cta: [
    {
      id: "tmf_mgt",
      name: "Trial Master File (TMF)",
      tasks: [
        {
          id: "doc_proc",
          name: "Document Processing",
          subTasks: [{ id: "dp_up", name: "Uploading to eTMF" }],
        },
      ],
    },
  ],
  data_entry: [
    {
      id: "edc_mgt",
      name: "EDC Management",
      tasks: [
        {
          id: "data_trans",
          name: "Data Transcription",
          subTasks: [{ id: "dt_first", name: "First pass data entry" }],
        },
      ],
    },
  ],
  manager: [
    {
      id: "proj_mgt",
      name: "Project Management",
      tasks: [
        {
          id: "resourcing",
          name: "Resourcing",
          subTasks: [
            { id: "res_ass", name: "CRA/CRC assignment" },
            { id: "res_time", name: "Timesheet approval" },
          ],
        },
      ],
    },
  ],
  super_admin: [
    {
      id: "sys_admin",
      name: "System Administration",
      tasks: [
        {
          id: "user_mgt",
          name: "User Management",
          subTasks: [{ id: "um_prov", name: "Account provisioning" }],
        },
      ],
    },
  ],
};

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
