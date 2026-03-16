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
          "name": "Gestión Regulatoria y Dossier",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "sometimiento_inicial",
              "name": "Sometimiento inicial a Comités de Ética (CEC/IRB)"
            },
            {
              "id": "act_isf",
              "name": "Actualización y foliación del Investigator Site File (ISF)"
            },
            {
              "id": "gest_cta",
              "name": "Gestión de firmas de Clinical Trial Agreement (CTA)"
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
          "name": "Ejecución de Reclutamiento",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "pre_screening_logs",
              "name": "Ejecución de Pre-screening y logs"
            },
            {
              "id": "gest_bd_pacientes",
              "name": "Gestión de bases de datos de pacientes potenciales"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. CALIDAD, CUMPLIMIENTO Y CIERRE",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Soporte a Auditoría y Monitorización",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Preparación de visitas (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Ejecución de actividades de Control de Calidad"
            },
            {
              "id": "resp_hallazgos",
              "name": "Respuesta a hallazgos de cartas de seguimiento (FUL)"
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
          "name": "Estrategias de Retención",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "coord_logistica",
              "name": "Coordinación de logística y transporte para sujetos"
            },
            {
              "id": "llamadas_seguimiento",
              "name": "Llamadas de recordatorio y seguimiento de visitas"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. EJECUCIÓN Y MONITORIZACIÓN (CONDUCT)",
      "tasks": [
        {
          "id": "control_visitas",
          "name": "Control de Visitas de Sujetos",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "prog_visitas",
              "name": "Programación de visitas en ventana y registro"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. CALIDAD, CUMPLIMIENTO Y CIERRE",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Soporte a Auditoría y Monitorización",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Preparación de visitas (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Ejecución de actividades de Control de Calidad"
            },
            {
              "id": "resp_hallazgos",
              "name": "Respuesta a hallazgos de cartas de seguimiento (FUL)"
            }
          ]
        }
      ]
    }
  ],
  "data_entry": [
    {
      "id": "conduct",
      "name": "03. EJECUCIÓN Y MONITORIZACIÓN (CONDUCT)",
      "tasks": [
        {
          "id": "gest_datos_ecrf",
          "name": "Gestión de Datos eCRF",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "transcripcion_fuente",
              "name": "Transcripción de fuente a eCRF"
            },
            {
              "id": "carga_labs",
              "name": "Carga de resultados de laboratorios y procedimientos"
            },
            {
              "id": "registro_logs",
              "name": "Registro y actualización de logs de CM/EAs"
            }
          ]
        },
        {
          "id": "resolucion_discrepancias",
          "name": "Resolución de Discrepancias",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "resp_tecnica_queries",
              "name": "Respuesta técnica a Queries"
            },
            {
              "id": "ejec_correcciones",
              "name": "Ejecución de correcciones en sistema EDC y fuente"
            },
            {
              "id": "gest_firmas_inv",
              "name": "Gestión de firmas del Investigador (Sign-off)"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. CALIDAD, CUMPLIMIENTO Y CIERRE",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Soporte a Auditoría y Monitorización",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Preparación de visitas (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Ejecución de actividades de Control de Calidad"
            },
            {
              "id": "resp_hallazgos",
              "name": "Respuesta a hallazgos de cartas de seguimiento (FUL)"
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
          "name": "Gestión Regulatoria y Dossier",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "sometimiento_inicial",
              "name": "Sometimiento inicial a Comités de Ética (CEC/IRB)"
            },
            {
              "id": "act_isf",
              "name": "Actualización y foliación del Investigator Site File (ISF)"
            },
            {
              "id": "gest_cta",
              "name": "Gestión de firmas de Clinical Trial Agreement (CTA)"
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
          "name": "Ejecución de Reclutamiento",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "pre_screening_logs",
              "name": "Ejecución de Pre-screening y logs"
            },
            {
              "id": "gest_bd_pacientes",
              "name": "Gestión de bases de datos de pacientes potenciales"
            }
          ]
        },
        {
          "id": "estrategias_retencion",
          "name": "Estrategias de Retención",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "coord_logistica",
              "name": "Coordinación de logística y transporte para sujetos"
            },
            {
              "id": "llamadas_seguimiento",
              "name": "Llamadas de recordatorio y seguimiento de visitas"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. EJECUCIÓN Y MONITORIZACIÓN (CONDUCT)",
      "tasks": [
        {
          "id": "gest_datos_ecrf",
          "name": "Gestión de Datos eCRF",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "transcripcion_fuente",
              "name": "Transcripción de fuente a eCRF"
            },
            {
              "id": "carga_labs",
              "name": "Carga de resultados de laboratorios y procedimientos"
            },
            {
              "id": "registro_logs",
              "name": "Registro y actualización de logs de CM/EAs"
            }
          ]
        },
        {
          "id": "resolucion_discrepancias",
          "name": "Resolución de Discrepancias",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "resp_tecnica_queries",
              "name": "Respuesta técnica a Queries"
            },
            {
              "id": "ejec_correcciones",
              "name": "Ejecución de correcciones en sistema EDC y fuente"
            },
            {
              "id": "gest_firmas_inv",
              "name": "Gestión de firmas del Investigador (Sign-off)"
            }
          ]
        },
        {
          "id": "control_visitas",
          "name": "Control de Visitas de Sujetos",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "prog_visitas",
              "name": "Programación de visitas en ventana y registro"
            }
          ]
        }
      ]
    },
    {
      "id": "safety_pv",
      "name": "04. SEGURIDAD Y FARMACOVIGILANCIA",
      "tasks": [
        {
          "id": "reporte_seguridad",
          "name": "Reporte de Seguridad",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "notif_saes",
              "name": "Notificación inicial y seguimiento de SAEs"
            },
            {
              "id": "recoleccion_fuentes",
              "name": "Recolección y anonimización de fuentes médicas"
            },
            {
              "id": "eval_medica",
              "name": "Evaluación médica de causalidad y severidad"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. CALIDAD, CUMPLIMIENTO Y CIERRE",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Soporte a Auditoría y Monitorización",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Preparación de visitas (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Ejecución de actividades de Control de Calidad"
            },
            {
              "id": "resp_hallazgos",
              "name": "Respuesta a hallazgos de cartas de seguimiento (FUL)"
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
              "name": "Facility assessment"
            },
            {
              "id": "ssv_pi",
              "name": "PI qualification review"
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
              "name": "Protocol training"
            },
            {
              "id": "siv_ip",
              "name": "IP handling review"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. EJECUCIÓN Y MONITORIZACIÓN (CONDUCT)",
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
              "name": "IP accountability"
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
              "name": "KRI review"
            },
            {
              "id": "cm_trend",
              "name": "Data trending analysis"
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
              "name": "Weekly check-in calls"
            },
            {
              "id": "sc_email",
              "name": "Email correspondence"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. CALIDAD, CUMPLIMIENTO Y CIERRE",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Soporte a Auditoría y Monitorización",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Preparación de visitas (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Ejecución de actividades de Control de Calidad"
            },
            {
              "id": "resp_hallazgos",
              "name": "Respuesta a hallazgos de cartas de seguimiento (FUL)"
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
              "name": "Final IP reconciliation"
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
      "name": "03. EJECUCIÓN Y MONITORIZACIÓN (CONDUCT)",
      "tasks": [
        {
          "id": "site_comm",
          "name": "Site Communication",
          "roleContext": "cro_led",
          "subTasks": [
            {
              "id": "sc_call",
              "name": "Weekly check-in calls"
            },
            {
              "id": "sc_email",
              "name": "Email correspondence"
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
          "name": "Gestión Regulatoria y Dossier",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "sometimiento_inicial",
              "name": "Sometimiento inicial a Comités de Ética (CEC/IRB)"
            },
            {
              "id": "act_isf",
              "name": "Actualización y foliación del Investigator Site File (ISF)"
            },
            {
              "id": "gest_cta",
              "name": "Gestión de firmas de Clinical Trial Agreement (CTA)"
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
              "name": "Facility assessment"
            },
            {
              "id": "ssv_pi",
              "name": "PI qualification review"
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
              "name": "Protocol training"
            },
            {
              "id": "siv_ip",
              "name": "IP handling review"
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
          "name": "Ejecución de Reclutamiento",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "pre_screening_logs",
              "name": "Ejecución de Pre-screening y logs"
            },
            {
              "id": "gest_bd_pacientes",
              "name": "Gestión de bases de datos de pacientes potenciales"
            }
          ]
        },
        {
          "id": "estrategias_retencion",
          "name": "Estrategias de Retención",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "coord_logistica",
              "name": "Coordinación de logística y transporte para sujetos"
            },
            {
              "id": "llamadas_seguimiento",
              "name": "Llamadas de recordatorio y seguimiento de visitas"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. EJECUCIÓN Y MONITORIZACIÓN (CONDUCT)",
      "tasks": [
        {
          "id": "gest_datos_ecrf",
          "name": "Gestión de Datos eCRF",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "transcripcion_fuente",
              "name": "Transcripción de fuente a eCRF"
            },
            {
              "id": "carga_labs",
              "name": "Carga de resultados de laboratorios y procedimientos"
            },
            {
              "id": "registro_logs",
              "name": "Registro y actualización de logs de CM/EAs"
            }
          ]
        },
        {
          "id": "resolucion_discrepancias",
          "name": "Resolución de Discrepancias",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "resp_tecnica_queries",
              "name": "Respuesta técnica a Queries"
            },
            {
              "id": "ejec_correcciones",
              "name": "Ejecución de correcciones en sistema EDC y fuente"
            },
            {
              "id": "gest_firmas_inv",
              "name": "Gestión de firmas del Investigador (Sign-off)"
            }
          ]
        },
        {
          "id": "control_visitas",
          "name": "Control de Visitas de Sujetos",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "prog_visitas",
              "name": "Programación de visitas en ventana y registro"
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
              "name": "IP accountability"
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
              "name": "KRI review"
            },
            {
              "id": "cm_trend",
              "name": "Data trending analysis"
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
              "name": "Weekly check-in calls"
            },
            {
              "id": "sc_email",
              "name": "Email correspondence"
            }
          ]
        }
      ]
    },
    {
      "id": "safety_pv",
      "name": "04. SEGURIDAD Y FARMACOVIGILANCIA",
      "tasks": [
        {
          "id": "reporte_seguridad",
          "name": "Reporte de Seguridad",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "notif_saes",
              "name": "Notificación inicial y seguimiento de SAEs"
            },
            {
              "id": "recoleccion_fuentes",
              "name": "Recolección y anonimización de fuentes médicas"
            },
            {
              "id": "eval_medica",
              "name": "Evaluación médica de causalidad y severidad"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. CALIDAD, CUMPLIMIENTO Y CIERRE",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Soporte a Auditoría y Monitorización",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Preparación de visitas (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Ejecución de actividades de Control de Calidad"
            },
            {
              "id": "resp_hallazgos",
              "name": "Respuesta a hallazgos de cartas de seguimiento (FUL)"
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
              "name": "Final IP reconciliation"
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
          "name": "Gestión Regulatoria y Dossier",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "sometimiento_inicial",
              "name": "Sometimiento inicial a Comités de Ética (CEC/IRB)"
            },
            {
              "id": "act_isf",
              "name": "Actualización y foliación del Investigator Site File (ISF)"
            },
            {
              "id": "gest_cta",
              "name": "Gestión de firmas de Clinical Trial Agreement (CTA)"
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
              "name": "Facility assessment"
            },
            {
              "id": "ssv_pi",
              "name": "PI qualification review"
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
              "name": "Protocol training"
            },
            {
              "id": "siv_ip",
              "name": "IP handling review"
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
          "name": "Ejecución de Reclutamiento",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "pre_screening_logs",
              "name": "Ejecución de Pre-screening y logs"
            },
            {
              "id": "gest_bd_pacientes",
              "name": "Gestión de bases de datos de pacientes potenciales"
            }
          ]
        },
        {
          "id": "estrategias_retencion",
          "name": "Estrategias de Retención",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "coord_logistica",
              "name": "Coordinación de logística y transporte para sujetos"
            },
            {
              "id": "llamadas_seguimiento",
              "name": "Llamadas de recordatorio y seguimiento de visitas"
            }
          ]
        }
      ]
    },
    {
      "id": "conduct",
      "name": "03. EJECUCIÓN Y MONITORIZACIÓN (CONDUCT)",
      "tasks": [
        {
          "id": "gest_datos_ecrf",
          "name": "Gestión de Datos eCRF",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "transcripcion_fuente",
              "name": "Transcripción de fuente a eCRF"
            },
            {
              "id": "carga_labs",
              "name": "Carga de resultados de laboratorios y procedimientos"
            },
            {
              "id": "registro_logs",
              "name": "Registro y actualización de logs de CM/EAs"
            }
          ]
        },
        {
          "id": "resolucion_discrepancias",
          "name": "Resolución de Discrepancias",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "resp_tecnica_queries",
              "name": "Respuesta técnica a Queries"
            },
            {
              "id": "ejec_correcciones",
              "name": "Ejecución de correcciones en sistema EDC y fuente"
            },
            {
              "id": "gest_firmas_inv",
              "name": "Gestión de firmas del Investigador (Sign-off)"
            }
          ]
        },
        {
          "id": "control_visitas",
          "name": "Control de Visitas de Sujetos",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "prog_visitas",
              "name": "Programación de visitas en ventana y registro"
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
              "name": "IP accountability"
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
              "name": "KRI review"
            },
            {
              "id": "cm_trend",
              "name": "Data trending analysis"
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
              "name": "Weekly check-in calls"
            },
            {
              "id": "sc_email",
              "name": "Email correspondence"
            }
          ]
        }
      ]
    },
    {
      "id": "safety_pv",
      "name": "04. SEGURIDAD Y FARMACOVIGILANCIA",
      "tasks": [
        {
          "id": "reporte_seguridad",
          "name": "Reporte de Seguridad",
          "roleContext": "site_led",
          "subTasks": [
            {
              "id": "notif_saes",
              "name": "Notificación inicial y seguimiento de SAEs"
            },
            {
              "id": "recoleccion_fuentes",
              "name": "Recolección y anonimización de fuentes médicas"
            },
            {
              "id": "eval_medica",
              "name": "Evaluación médica de causalidad y severidad"
            }
          ]
        }
      ]
    },
    {
      "id": "qa_closeout",
      "name": "05. CALIDAD, CUMPLIMIENTO Y CIERRE",
      "tasks": [
        {
          "id": "soporte_auditoria",
          "name": "Soporte a Auditoría y Monitorización",
          "roleContext": "shared",
          "subTasks": [
            {
              "id": "prep_visitas",
              "name": "Preparación de visitas (SDV/SDR readiness)"
            },
            {
              "id": "ejec_qc",
              "name": "Ejecución de actividades de Control de Calidad"
            },
            {
              "id": "resp_hallazgos",
              "name": "Respuesta a hallazgos de cartas de seguimiento (FUL)"
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
              "name": "Final IP reconciliation"
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
              "name": "Account provisioning"
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
