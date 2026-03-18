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
  role_context?: "site_led" | "cro_led" | "shared";
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

export const ROLE_HIERARCHY: Record<string, ActivityCategory[]> = {
  "ra": [
    {
      "id": "startup_reg",
      "name": "01. START-UP & REGULATORY",
      "tasks": [
        {
          "id": "gest_reg_dossier",
          "name": "Regulatory Management and Dossier",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "sometimiento_inicial",
              "name": "Initial Submission to Ethics Committees (CEC/IRB)"
            },
            {
              "id": "act_isf",
              "name": "Investigator Site File (ISF) Update and Pagination"
            },
            {
              "id": "gest_cta",
              "name": "Clinical Trial Agreement (CTA) Signature Management"
            }
          ]
        }
      ]
    }
  ],
  "recruitment_specialist": [
    {
      "id": "recruitment_retention",
      "name": "02. RECRUITMENT & RETENTION",
      "tasks": [
        {
          "id": "ejec_reclutamiento",
          "name": "Recruitment Execution",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "pre_screening_logs",
              "name": "Pre-screening Execution and Logs"
            },
            {
              "id": "gest_bd_pacientes",
              "name": "Potential Patient Database Management"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. QUALITY, COMPLIANCE & CLOSE-OUT",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Audit and Monitoring Support",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Visit Preparation (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Quality Control Activities Execution"
            },
            {
              "id": "resp_hallazgos",
              "name": "Follow-up Letter (FUL) Findings Response"
            }
          ]
        }
      ]
    }
  ],
  "retention_specialist": [
    {
      "id": "recruitment_retention",
      "name": "02. RECRUITMENT & RETENTION",
      "tasks": [
        {
          "id": "estrategias_retencion",
          "name": "Retention Strategies",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "coord_logistica",
              "name": "Logistics and Transport Coordination for Subjects"
            },
            {
              "id": "llamadas_seguimiento",
              "name": "Reminder Calls and Visit Follow-up"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. CONDUCT & MONITORING",
      "tasks": [
        {
          "id": "control_visitas",
          "name": "Subject Visit Control",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "prog_visitas",
              "name": "In-window Visit Scheduling and Registration"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. QUALITY, COMPLIANCE & CLOSE-OUT",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Audit and Monitoring Support",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Visit Preparation (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Quality Control Activities Execution"
            },
            {
              "id": "resp_hallazgos",
              "name": "Follow-up Letter (FUL) Findings Response"
            }
          ]
        }
      ]
    }
  ],
  "data_entry": [
    {
      "id": "conduct",
      "name": "03. CONDUCT & MONITORING",
      "tasks": [
        {
          "id": "gest_datos_ecrf",
          "name": "eCRF Data Management",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "transcripcion_fuente",
              "name": "Source to eCRF Transcription"
            },
            {
              "id": "carga_labs",
              "name": "Laboratory and Procedure Results Upload"
            },
            {
              "id": "registro_logs",
              "name": "AE/SAE Logs Registration and Update"
            }
          ]
        },
        {
          "id": "resolucion_discrepancias",
          "name": "Query Resolution",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "resp_tecnica_queries",
              "name": "Technical Response to Queries"
            },
            {
              "id": "ejec_correcciones",
              "name": "Corrections Execution in EDC and Source"
            },
            {
              "id": "gest_firmas_inv",
              "name": "Investigator Sign-off Management"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. QUALITY, COMPLIANCE & CLOSE-OUT",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Audit and Monitoring Support",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Visit Preparation (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Quality Control Activities Execution"
            },
            {
              "id": "resp_hallazgos",
              "name": "Follow-up Letter (FUL) Findings Response"
            }
          ]
        }
      ]
    }
  ],
  "crc": [
    {
      "id": "startup_reg",
      "name": "01. START-UP & REGULATORY",
      "tasks": [
        {
          "id": "gest_reg_dossier",
          "name": "Regulatory Management and Dossier",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "sometimiento_inicial",
              "name": "Initial Submission to Ethics Committees (CEC/IRB)"
            },
            {
              "id": "act_isf",
              "name": "Investigator Site File (ISF) Update and Pagination"
            },
            {
              "id": "gest_cta",
              "name": "Clinical Trial Agreement (CTA) Signature Management"
            }
          ]
        }
      ]
    },
    {
      "id": "recruitment_retention",
      "name": "02. RECRUITMENT & RETENTION",
      "tasks": [
        {
          "id": "ejec_reclutamiento",
          "name": "Recruitment Execution",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "pre_screening_logs",
              "name": "Pre-screening Execution and Logs"
            },
            {
              "id": "gest_bd_pacientes",
              "name": "Potential Patient Database Management"
            }
          ]
        },
        {
          "id": "estrategias_retencion",
          "name": "Retention Strategies",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "coord_logistica",
              "name": "Logistics and Transport Coordination for Subjects"
            },
            {
              "id": "llamadas_seguimiento",
              "name": "Reminder Calls and Visit Follow-up"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. CONDUCT & MONITORING",
      "tasks": [
        {
          "id": "gest_datos_ecrf",
          "name": "eCRF Data Management",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "transcripcion_fuente",
              "name": "Source to eCRF Transcription"
            },
            {
              "id": "carga_labs",
              "name": "Laboratory and Procedure Results Upload"
            },
            {
              "id": "registro_logs",
              "name": "AE/SAE Logs Registration and Update"
            }
          ]
        },
        {
          "id": "resolucion_discrepancias",
          "name": "Query Resolution",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "resp_tecnica_queries",
              "name": "Technical Response to Queries"
            },
            {
              "id": "ejec_correcciones",
              "name": "Corrections Execution in EDC and Source"
            },
            {
              "id": "gest_firmas_inv",
              "name": "Investigator Sign-off Management"
            }
          ]
        },
        {
          "id": "control_visitas",
          "name": "Subject Visit Control",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "prog_visitas",
              "name": "In-window Visit Scheduling and Registration"
            }
          ]
        }
      ]
    },
    {
      "id": "safety_pv",
      "name": "04. SAFETY & PHARMACOVIGILANCE",
      "tasks": [
        {
          "id": "reporte_seguridad",
          "name": "Safety Reporting",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "notif_saes",
              "name": "SAE Initial Notification and Follow-up"
            },
            {
              "id": "recoleccion_fuentes",
              "name": "Medical Source Collection and Anonymization"
            },
            {
              "id": "eval_medica",
              "name": "Medical Assessment of Causality and Severity"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. QUALITY, COMPLIANCE & CLOSE-OUT",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Audit and Monitoring Support",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Visit Preparation (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Quality Control Activities Execution"
            },
            {
              "id": "resp_hallazgos",
              "name": "Follow-up Letter (FUL) Findings Response"
            }
          ]
        }
      ]
    }
  ],
  "cra": [
    {
      "id": "startup_reg",
      "name": "01. START-UP & REGULATORY",
      "tasks": [
        {
          "id": "ssv",
          "name": "Site Selection Visit (SSV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "ssv_fac",
              "name": "Facility Assessment"
            },
            {
              "id": "ssv_pi",
              "name": "PI Qualification Review"
            }
          ]
        },
        {
          "id": "siv",
          "name": "Site Initiation Visit (SIV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "siv_train",
              "name": "Protocol Training"
            },
            {
              "id": "siv_ip",
              "name": "IP Handling Review"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. CONDUCT & MONITORING",
      "tasks": [
        {
          "id": "rmv",
          "name": "Routine Monitoring Visit (RMV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "rmv_sdv",
              "name": "SDV/SDR"
            },
            {
              "id": "rmv_ip",
              "name": "IP Accountability"
            }
          ]
        },
        {
          "id": "central_mon",
          "name": "Centralized Monitoring",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "cm_kri",
              "name": "KRI Review"
            },
            {
              "id": "cm_trend",
              "name": "Data Trending Analysis"
            }
          ]
        },
        {
          "id": "site_comm",
          "name": "Site Communication",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "sc_call",
              "name": "Weekly Check-in Calls"
            },
            {
              "id": "sc_email",
              "name": "Email Correspondence"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. QUALITY, COMPLIANCE & CLOSE-OUT",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Audit and Monitoring Support",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Visit Preparation (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Quality Control Activities Execution"
            },
            {
              "id": "resp_hallazgos",
              "name": "Follow-up Letter (FUL) Findings Response"
            }
          ]
        },
        {
          "id": "cov",
          "name": "Close-Out Visit (COV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "cov_ip",
              "name": "Final IP Reconciliation"
            }
          ]
        }
      ]
    }
  ],
  "cta": [
    {
      "id": "startup_reg",
      "name": "01. START-UP & REGULATORY",
      "tasks": [
        {
          "id": "doc_proc",
          "name": "Trial Master File (TMF) Processing",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "dp_up",
              "name": "Uploading to eTMF"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. CONDUCT & MONITORING",
      "tasks": [
        {
          "id": "site_comm",
          "name": "Site Communication",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "sc_call",
              "name": "Weekly Check-in Calls"
            },
            {
              "id": "sc_email",
              "name": "Email Correspondence"
            }
          ]
        }
      ]
    }
  ],
  "manager": [
    {
      "id": "startup_reg",
      "name": "01. START-UP & REGULATORY",
      "tasks": [
        {
          "id": "gest_reg_dossier",
          "name": "Regulatory Management and Dossier",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "sometimiento_inicial",
              "name": "Initial Submission to Ethics Committees (CEC/IRB)"
            },
            {
              "id": "act_isf",
              "name": "Investigator Site File (ISF) Update and Pagination"
            },
            {
              "id": "gest_cta",
              "name": "Clinical Trial Agreement (CTA) Signature Management"
            }
          ]
        },
        {
          "id": "ssv",
          "name": "Site Selection Visit (SSV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "ssv_fac",
              "name": "Facility Assessment"
            },
            {
              "id": "ssv_pi",
              "name": "PI Qualification Review"
            }
          ]
        },
        {
          "id": "siv",
          "name": "Site Initiation Visit (SIV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "siv_train",
              "name": "Protocol Training"
            },
            {
              "id": "siv_ip",
              "name": "IP Handling Review"
            }
          ]
        },
        {
          "id": "doc_proc",
          "name": "Trial Master File (TMF) Processing",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "dp_up",
              "name": "Uploading to eTMF"
            }
          ]
        }
      ]
    },
    {
      "id": "recruitment_retention",
      "name": "02. RECRUITMENT & RETENTION",
      "tasks": [
        {
          "id": "ejec_reclutamiento",
          "name": "Recruitment Execution",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "pre_screening_logs",
              "name": "Pre-screening Execution and Logs"
            },
            {
              "id": "gest_bd_pacientes",
              "name": "Potential Patient Database Management"
            }
          ]
        },
        {
          "id": "estrategias_retencion",
          "name": "Retention Strategies",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "coord_logistica",
              "name": "Logistics and Transport Coordination for Subjects"
            },
            {
              "id": "llamadas_seguimiento",
              "name": "Reminder Calls and Visit Follow-up"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. CONDUCT & MONITORING",
      "tasks": [
        {
          "id": "gest_datos_ecrf",
          "name": "eCRF Data Management",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "transcripcion_fuente",
              "name": "Source to eCRF Transcription"
            },
            {
              "id": "carga_labs",
              "name": "Laboratory and Procedure Results Upload"
            },
            {
              "id": "registro_logs",
              "name": "AE/SAE Logs Registration and Update"
            }
          ]
        },
        {
          "id": "resolucion_discrepancias",
          "name": "Query Resolution",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "resp_tecnica_queries",
              "name": "Technical Response to Queries"
            },
            {
              "id": "ejec_correcciones",
              "name": "Corrections Execution in EDC and Source"
            },
            {
              "id": "gest_firmas_inv",
              "name": "Investigator Sign-off Management"
            }
          ]
        },
        {
          "id": "control_visitas",
          "name": "Subject Visit Control",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "prog_visitas",
              "name": "In-window Visit Scheduling and Registration"
            }
          ]
        },
        {
          "id": "rmv",
          "name": "Routine Monitoring Visit (RMV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "rmv_sdv",
              "name": "SDV/SDR"
            },
            {
              "id": "rmv_ip",
              "name": "IP Accountability"
            }
          ]
        },
        {
          "id": "central_mon",
          "name": "Centralized Monitoring",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "cm_kri",
              "name": "KRI Review"
            },
            {
              "id": "cm_trend",
              "name": "Data Trending Analysis"
            }
          ]
        },
        {
          "id": "site_comm",
          "name": "Site Communication",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "sc_call",
              "name": "Weekly Check-in Calls"
            },
            {
              "id": "sc_email",
              "name": "Email Correspondence"
            }
          ]
        }
      ]
    },
    {
      "id": "safety_pv",
      "name": "04. SAFETY & PHARMACOVIGILANCE",
      "tasks": [
        {
          "id": "reporte_seguridad",
          "name": "Safety Reporting",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "notif_saes",
              "name": "SAE Initial Notification and Follow-up"
            },
            {
              "id": "recoleccion_fuentes",
              "name": "Medical Source Collection and Anonymization"
            },
            {
              "id": "eval_medica",
              "name": "Medical Assessment of Causality and Severity"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. QUALITY, COMPLIANCE & CLOSE-OUT",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Audit and Monitoring Support",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Visit Preparation (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Quality Control Activities Execution"
            },
            {
              "id": "resp_hallazgos",
              "name": "Follow-up Letter (FUL) Findings Response"
            }
          ]
        },
        {
          "id": "cov",
          "name": "Close-Out Visit (COV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "cov_ip",
              "name": "Final IP Reconciliation"
            }
          ]
        }
      ]
    }
  ],
  "super_admin": [
    {
      "id": "startup_reg",
      "name": "01. START-UP & REGULATORY",
      "tasks": [
        {
          "id": "gest_reg_dossier",
          "name": "Regulatory Management and Dossier",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "sometimiento_inicial",
              "name": "Initial Submission to Ethics Committees (CEC/IRB)"
            },
            {
              "id": "act_isf",
              "name": "Investigator Site File (ISF) Update and Pagination"
            },
            {
              "id": "gest_cta",
              "name": "Clinical Trial Agreement (CTA) Signature Management"
            }
          ]
        },
        {
          "id": "ssv",
          "name": "Site Selection Visit (SSV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "ssv_fac",
              "name": "Facility Assessment"
            },
            {
              "id": "ssv_pi",
              "name": "PI Qualification Review"
            }
          ]
        },
        {
          "id": "siv",
          "name": "Site Initiation Visit (SIV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "siv_train",
              "name": "Protocol Training"
            },
            {
              "id": "siv_ip",
              "name": "IP Handling Review"
            }
          ]
        },
        {
          "id": "doc_proc",
          "name": "Trial Master File (TMF) Processing",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "dp_up",
              "name": "Uploading to eTMF"
            }
          ]
        }
      ]
    },
    {
      "id": "recruitment_retention",
      "name": "02. RECRUITMENT & RETENTION",
      "tasks": [
        {
          "id": "ejec_reclutamiento",
          "name": "Recruitment Execution",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "pre_screening_logs",
              "name": "Pre-screening Execution and Logs"
            },
            {
              "id": "gest_bd_pacientes",
              "name": "Potential Patient Database Management"
            }
          ]
        },
        {
          "id": "estrategias_retencion",
          "name": "Retention Strategies",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "coord_logistica",
              "name": "Logistics and Transport Coordination for Subjects"
            },
            {
              "id": "llamadas_seguimiento",
              "name": "Reminder Calls and Visit Follow-up"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. CONDUCT & MONITORING",
      "tasks": [
        {
          "id": "gest_datos_ecrf",
          "name": "eCRF Data Management",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "transcripcion_fuente",
              "name": "Source to eCRF Transcription"
            },
            {
              "id": "carga_labs",
              "name": "Laboratory and Procedure Results Upload"
            },
            {
              "id": "registro_logs",
              "name": "AE/SAE Logs Registration and Update"
            }
          ]
        },
        {
          "id": "resolucion_discrepancias",
          "name": "Query Resolution",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "resp_tecnica_queries",
              "name": "Technical Response to Queries"
            },
            {
              "id": "ejec_correcciones",
              "name": "Corrections Execution in EDC and Source"
            },
            {
              "id": "gest_firmas_inv",
              "name": "Investigator Sign-off Management"
            }
          ]
        },
        {
          "id": "control_visitas",
          "name": "Subject Visit Control",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "prog_visitas",
              "name": "In-window Visit Scheduling and Registration"
            }
          ]
        },
        {
          "id": "rmv",
          "name": "Routine Monitoring Visit (RMV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "rmv_sdv",
              "name": "SDV/SDR"
            },
            {
              "id": "rmv_ip",
              "name": "IP Accountability"
            }
          ]
        },
        {
          "id": "central_mon",
          "name": "Centralized Monitoring",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "cm_kri",
              "name": "KRI Review"
            },
            {
              "id": "cm_trend",
              "name": "Data Trending Analysis"
            }
          ]
        },
        {
          "id": "site_comm",
          "name": "Site Communication",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "sc_call",
              "name": "Weekly Check-in Calls"
            },
            {
              "id": "sc_email",
              "name": "Email Correspondence"
            }
          ]
        }
      ]
    },
    {
      "id": "safety_pv",
      "name": "04. SAFETY & PHARMACOVIGILANCE",
      "tasks": [
        {
          "id": "reporte_seguridad",
          "name": "Safety Reporting",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "notif_saes",
              "name": "SAE Initial Notification and Follow-up"
            },
            {
              "id": "recoleccion_fuentes",
              "name": "Medical Source Collection and Anonymization"
            },
            {
              "id": "eval_medica",
              "name": "Medical Assessment of Causality and Severity"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. QUALITY, COMPLIANCE & CLOSE-OUT",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Audit and Monitoring Support",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Visit Preparation (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Quality Control Activities Execution"
            },
            {
              "id": "resp_hallazgos",
              "name": "Follow-up Letter (FUL) Findings Response"
            }
          ]
        },
        {
          "id": "cov",
          "name": "Close-Out Visit (COV)",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "cov_ip",
              "name": "Final IP Reconciliation"
            }
          ]
        }
      ]
    },
    {
      "id": "sys_admin",
      "name": "06. SYSTEM ADMINISTRATION",
      "tasks": [
        {
          "id": "user_mgt",
          "name": "User Management",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "um_prov",
              "name": "Account Provisioning"
            }
          ]
        }
      ]
    }
  ]
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
