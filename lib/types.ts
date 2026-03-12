export type Role = "Admin" | "Manager" | "CRA" | "CRC" | "CTA" | "DE" | "RA" | "SR" | "RS";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface UserAssignment {
  userId: string;
  projectIds: string[];
  protocolIds: string[];
}

export interface LogQuery {
  id: string;
  managerName: string;
  question: string;
  questionDate: string;
  staffResponse?: string;
  responseDate?: string;
  status: "OPEN" | "RESOLVED";
}

export interface SubTask {
  id: string;
  name: string;
}

export interface ActivityTask {
  id: string;
  name: string;
  subTasks?: SubTask[];
}

export interface ActivityCategory {
  id: string;
  name: string;
  tasks: ActivityTask[];
}

export interface Project {
  id: string;
  name: string;
}

export interface Protocol {
  id: string;
  projectId: string;
  name: string;
}

export interface Site {
  id: string;
  protocolId: string;
  name: string;
  country: string;
}

export interface LogEntry {
  id: string;
  date: string; // ISO string
  durationMinutes: number;
  projectId: string;
  protocolId: string;
  siteId: string;
  userId: string;
  userName: string;
  role: Role;
  category: string;
  activity: string;
  subTask?: string;
  notes: string;
  synced?: boolean; // For offline sync tracking
  queries?: LogQuery[];
}

export const PROJECTS: Project[] = [
  { id: "PRJ-JIT", name: "Just in-Time (JIT)" },
  { id: "PRJ-FSP", name: "Functional Service Provider (FSP)" },
  { id: "PRJ-FULL", name: "Full Service" }
];

export const PROTOCOLS: Protocol[] = [
  { id: "PROT-101", projectId: "PRJ-JIT", name: "Oncology Phase III (PROT-101)" },
  { id: "PROT-202", projectId: "PRJ-JIT", name: "Cardiology Phase II (PROT-202)" },
  { id: "PROT-303", projectId: "PRJ-FSP", name: "Neurology Observational (PROT-303)" },
  { id: "PROT-404", projectId: "PRJ-FULL", name: "Vaccine Trial (PROT-404)" },
];

export const SITES: Site[] = [
  { id: "SITE-US-01", protocolId: "PROT-101", name: "Mayo Clinic", country: "USA" },
  { id: "SITE-US-02", protocolId: "PROT-101", name: "MD Anderson", country: "USA" },
  { id: "SITE-UK-01", protocolId: "PROT-202", name: "London General", country: "UK" },
  { id: "SITE-ES-01", protocolId: "PROT-303", name: "Hospital Clinic", country: "Spain" },
  { id: "SITE-MX-01", protocolId: "PROT-404", name: "Hospital General", country: "Mexico" },
];

export const ROLES: Role[] = ["Admin", "Manager", "CRA", "CRC", "CTA", "DE", "RA", "SR", "RS"];

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Alice (Manager)", role: "Manager" },
  { id: "u2", name: "Bob (CRA)", role: "CRA" },
  { id: "u3", name: "Charlie (CRC)", role: "CRC" },
  { id: "u4", name: "Diana (Subject Recruiter)", role: "SR" },
  { id: "u5", name: "Evan (Retention Specialist)", role: "RS" },
];

export const ROLE_HIERARCHY: Record<Role, ActivityCategory[]> = {
  CRA: [
    {
      id: "site_visits",
      name: "Site Monitoring Visits",
      tasks: [
        { id: "ssv", name: "Site Selection Visit (SSV)", subTasks: [{id: "ssv_fac", name: "Facility assessment"}, {id: "ssv_pi", name: "PI qualification review"}, {id: "ssv_pop", name: "Patient population analysis"}] },
        { id: "siv", name: "Site Initiation Visit (SIV)", subTasks: [{id: "siv_train", name: "Protocol training"}, {id: "siv_ip", name: "IP handling review"}, {id: "siv_edc", name: "EDC training"}, {id: "siv_isf", name: "ISF review"}] },
        { id: "rmv", name: "Routine Monitoring Visit (RMV)", subTasks: [{id: "rmv_sdv", name: "SDV/SDR"}, {id: "rmv_ip", name: "IP accountability"}, {id: "rmv_reg", name: "Regulatory review"}, {id: "rmv_act", name: "Action item resolution"}] },
        { id: "cov", name: "Close-Out Visit (COV)", subTasks: [{id: "cov_ip", name: "Final IP reconciliation"}, {id: "cov_arch", name: "ISF archiving"}] },
      ]
    },
    {
      id: "remote_mgt",
      name: "Remote Monitoring & Management",
      tasks: [
        { id: "central_mon", name: "Centralized Monitoring", subTasks: [{id: "cm_kri", name: "KRI review"}, {id: "cm_trend", name: "Data trending analysis"}, {id: "cm_query", name: "Query resolved/closed"}] },
        { id: "site_comm", name: "Site Communication", subTasks: [{id: "sc_call", name: "Weekly check-in calls"}, {id: "sc_email", name: "Email correspondence"}, {id: "sc_letter", name: "Follow-up letters"}] },
      ]
    },
    {
      id: "sdv_sdr",
      name: "Source Data Verification (SDV)",
      tasks: [
        { id: "icf_rev", name: "Informed Consent", subTasks: [{id: "icf_sig", name: "Signature verification"}, {id: "icf_ver", name: "Version control check"}, {id: "icf_proc", name: "Process documentation review"}] },
        { id: "safety_rev", name: "Safety & AE/SAE", subTasks: [{id: "saf_sae", name: "SAE reconciliation"}, {id: "saf_grad", name: "AE grading/attribution check"}, {id: "saf_time", name: "Safety reporting timeline check"}] },
      ]
    }
  ],
  CRC: [
    {
      id: "patient_visits",
      name: "Patient Visits & Clinical",
      tasks: [
        { id: "screening", name: "Screening & Consent", subTasks: [{id: "scr_cons", name: "Consent visit completed"}, {id: "scr_dec", name: "Participant declined at consenting"}, {id: "scr_fail", name: "Participant screenfailed"}, {id: "scr_recons", name: "Participant reconsented"}] },
        { id: "randomization", name: "Randomization", subTasks: [{id: "rnd_enr", name: "Participant Randomized/Enrolled"}, {id: "rnd_irt", name: "IRT/IWRS entry"}] },
        { id: "treatment", name: "Study Visits", subTasks: [{id: "vis_fu", name: "Follow-up visit completed"}, {id: "vis_eot", name: "EOT visit completed"}, {id: "vis_saf", name: "Safety follow up completed"}, {id: "vis_comp", name: "Participant completed study"}] },
        { id: "discontinuation", name: "Subject Disposition", subTasks: [{id: "disp_withdrew", name: "Participant withdrew consent"}, {id: "disp_lost", name: "Participant lost to follow up"}, {id: "disp_off", name: "Participant off study/discontinued"}] },
      ]
    },
    {
      id: "data_doc",
      name: "Data & Documentation",
      tasks: [
        { id: "safety_rep", name: "Safety Reporting", subTasks: [{id: "sae_init", name: "Initial SAE entered"}, {id: "sae_fu", name: "SAE follow-up report entered"}] },
        { id: "edc_entry", name: "EDC Entry & Queries", subTasks: [{id: "edc_trans", name: "Visit data transcription"}, {id: "edc_query", name: "Query responded/answered"}] },
        { id: "source_doc", name: "Source Documentation", subTasks: [{id: "src_notes", name: "Chart notes creation"}, {id: "src_alcoa", name: "ALCOA-C review"}] },
      ]
    },
    {
      id: "site_support",
      name: "Site Support & Quality",
      tasks: [
        { id: "qc_audit", name: "QC & Inspections", subTasks: [{id: "sup_qc", name: "Support QC activities"}, {id: "sup_mon", name: "Support monitoring visit"}, {id: "sup_aud", name: "Support audit or inspection"}] },
        { id: "ip_ops", name: "IP Management", subTasks: [{id: "ip_disp", name: "Dispensing/Accountability"}] },
      ]
    }
  ],
  SR: [
    {
      id: "outreach",
      name: "Outreach & Advertising",
      tasks: [
        { id: "campaign", name: "Campaign Management", subTasks: [{id: "camp_social", name: "Social media ad placement"}, {id: "camp_radio", name: "Radio/Print ad tracking"}, {id: "camp_flyer", name: "Community flyer distribution"}] },
        { id: "db_mining", name: "Database Mining", subTasks: [{id: "db_emr", name: "EMR/EHR screening"}, {id: "db_chart", name: "Chart review for eligibility"}, {id: "db_reg", name: "Patient registry search"}] },
      ]
    },
    {
      id: "pre_screening",
      name: "Pre-Screening",
      tasks: [
        { id: "pt_contact", name: "Patient Contact", subTasks: [{id: "pt_phone", name: "Initial phone screening"}, {id: "pt_email", name: "Email outreach"}, {id: "pt_detail", name: "Study detail explanation"}] },
        { id: "scheduling", name: "Scheduling", subTasks: [{id: "sch_visit", name: "Screening visit booking"}, {id: "sch_trans", name: "Transportation arrangement"}, {id: "sch_rem", name: "Reminder calls"}] },
      ]
    }
  ],
  RS: [
    {
      id: "pt_engagement",
      name: "Patient Engagement",
      tasks: [
        { id: "retention_comms", name: "Retention Communications", subTasks: [{id: "ret_call", name: "Retention call made"}, {id: "ret_text", name: "Retention text sent"}, {id: "ret_email", name: "Retention email sent"}] },
        { id: "adherence", name: "Visit Adherence", subTasks: [{id: "adh_rem", name: "Appointment reminders"}, {id: "adh_resch", name: "Rescheduling missed visits"}] },
      ]
    },
    {
      id: "dropout_prev",
      name: "Dropout Prevention",
      tasks: [
        { id: "issue_res", name: "Issue Resolution", subTasks: [{id: "iss_stipend", name: "Stipend/Reimbursement troubleshooting"}, {id: "iss_counsel", name: "Patient family counseling"}] },
      ]
    }
  ],
  RA: [
    {
      id: "irb_iec",
      name: "IRB/IEC Submissions",
      tasks: [
        { id: "init_sub", name: "Initial Submissions", subTasks: [{id: "init_prot", name: "Protocol/ICF preparation"}, {id: "init_trans", name: "Local translation review"}, {id: "init_ib", name: "Investigator brochure submission"}] },
        { id: "maint_sub", name: "Maintenance", subTasks: [{id: "maint_cont", name: "Continuing reviews/Annual reports"}, {id: "maint_amend", name: "Protocol amendments"}, {id: "maint_susar", name: "Safety report (SUSAR) distribution"}] },
      ]
    },
    {
      id: "ess_docs",
      name: "Essential Documents",
      tasks: [
        { id: "site_level", name: "Site Level (ISF)", subTasks: [{id: "site_1572", name: "1572/DOA updates"}, {id: "site_fin", name: "Financial disclosure collection"}, {id: "site_cv", name: "CV/Medical License tracking"}] },
        { id: "sponsor_level", name: "Sponsor Level (TMF)", subTasks: [{id: "spon_green", name: "Regulatory greenlight package"}, {id: "spon_cta", name: "Clinical Trial Agreement (CTA) routing"}] },
      ]
    }
  ],
  CTA: [
    {
      id: "tmf_mgt",
      name: "Trial Master File (TMF)",
      tasks: [
        { id: "doc_proc", name: "Document Processing", subTasks: [{id: "dp_up", name: "Uploading to eTMF"}, {id: "dp_meta", name: "Metadata tagging"}, {id: "dp_qc", name: "QC review (Quality Control)"}] },
        { id: "tmf_maint", name: "TMF Maintenance", subTasks: [{id: "tm_miss", name: "Missing document tracking"}, {id: "tm_per", name: "Periodic TMF review"}, {id: "tm_arch", name: "Archiving prep"}] },
      ]
    },
    {
      id: "study_logistics",
      name: "Study Logistics",
      tasks: [
        { id: "clin_supplies", name: "Clinical Supplies", subTasks: [{id: "cs_kit", name: "Lab kit ordering"}, {id: "cs_calib", name: "Equipment calibration tracking"}, {id: "cs_man", name: "Study manual distribution"}] },
        { id: "mtg_mgt", name: "Meeting Management", subTasks: [{id: "mm_im", name: "Investigator meeting prep"}, {id: "mm_min", name: "Team meeting minutes"}, {id: "mm_ag", name: "Agenda distribution"}] },
      ]
    }
  ],
  DE: [
    {
      id: "edc_mgt",
      name: "EDC Management",
      tasks: [
        { id: "data_trans", name: "Data Transcription", subTasks: [{id: "dt_first", name: "First pass data entry"}, {id: "dt_sec", name: "Second pass verification"}] },
        { id: "query_mgt", name: "Query Management", subTasks: [{id: "qm_res", name: "Query resolved/closed"}, {id: "qm_man", name: "Manual query generation"}, {id: "qm_age", name: "Query aging tracking"}] },
      ]
    },
    {
      id: "db_ops",
      name: "Database Operations",
      tasks: [
        { id: "db_lock", name: "Database Lock Prep", subTasks: [{id: "dl_soft", name: "Soft lock review"}, {id: "dl_miss", name: "Missing page tracking"}, {id: "dl_pd", name: "Protocol deviation logging"}] },
      ]
    }
  ],
  Manager: [
    {
      id: "proj_mgt",
      name: "Project Management",
      tasks: [
        { id: "time_budg", name: "Timeline & Budget", subTasks: [{id: "tb_mile", name: "Milestone tracking"}, {id: "tb_inv", name: "Invoice review"}, {id: "tb_ven", name: "Vendor management"}] },
        { id: "resourcing", name: "Resourcing", subTasks: [{id: "res_ass", name: "CRA/CRC assignment"}, {id: "res_work", name: "Workload balancing"}, {id: "res_time", name: "Timesheet approval"}] },
      ]
    },
    {
      id: "qual_over",
      name: "Quality & Oversight",
      tasks: [
        { id: "metric_rev", name: "Metric Review", subTasks: [{id: "mr_enr", name: "Enrollment tracking"}, {id: "mr_query", name: "Query resolution rates"}, {id: "mr_pd", name: "Protocol deviation trending"}] },
        { id: "escalation", name: "Escalation", subTasks: [{id: "esc_capa", name: "CAPA management"}, {id: "esc_noncomp", name: "Site non-compliance handling"}, {id: "esc_spon", name: "Sponsor reporting"}] },
      ]
    }
  ],
  Admin: [
    {
      id: "sys_admin",
      name: "System Administration",
      tasks: [
        { id: "user_mgt", name: "User Management", subTasks: [{id: "um_prov", name: "Account provisioning"}, {id: "um_role", name: "Role assignment"}, {id: "um_aud", name: "Access audits"}] },
        { id: "study_config", name: "Study Configuration", subTasks: [{id: "sc_edc", name: "EDC integration setup"}, {id: "sc_site", name: "Site creation"}, {id: "sc_drop", name: "Dropdown list management"}] },
      ]
    }
  ]
};

export interface Permission {
  canViewAllLogs: boolean;
  canDeleteLogs: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, Permission> = {
  Admin: { canViewAllLogs: true, canDeleteLogs: true },
  Manager: { canViewAllLogs: true, canDeleteLogs: false },
  RA: { canViewAllLogs: true, canDeleteLogs: false },
  CRA: { canViewAllLogs: false, canDeleteLogs: true },
  CRC: { canViewAllLogs: false, canDeleteLogs: true },
  CTA: { canViewAllLogs: false, canDeleteLogs: true },
  DE: { canViewAllLogs: false, canDeleteLogs: true },
  SR: { canViewAllLogs: false, canDeleteLogs: true },
  RS: { canViewAllLogs: false, canDeleteLogs: true }
};

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: "info" | "warning" | "success" | "error";
  link?: string;
}

export interface SavedTemplate {
  id: string;
  userId: string;
  name: string;
  projectId: string;
  protocolId: string;
  activityCategory: string;
  activityTask: string;
  notes?: string;
  icon?: string;
}

export function dbRoleToAppRole(dbRole: string): Role {
  switch (dbRole) {
    case 'super_admin': return 'Admin';
    case 'manager': return 'Manager';
    case 'crc': return 'CRC';
    case 'cra': return 'CRA';
    case 'data_entry': return 'DE';
    case 'recruitment_specialist': return 'SR';
    case 'retention_specialist': return 'RS';
    case 'cta': return 'CTA';
    case 'ra': return 'RA';
    default: return 'CRC';
  }
}
