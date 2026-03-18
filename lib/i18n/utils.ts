import { useTranslation } from './index';


export function useDynamicTranslation() {
  const { language } = useTranslation();

  const translateDynamic = (text: string | undefined | null): string => {
    if (!text) return '';
    const normalized = text.toLowerCase().trim();

    // Map known English terms to Spanish
    const enToEs: Record<string, string> = {
      // Categories
      '01. start-up & regulatory': '01. START-UP Y REGULATORIO',
      '02. recruitment & retention': '02. RECLUTAMIENTO Y RETENCIÓN',
      '03. conduct & monitoring': '03. CONDUCCIÓN Y MONITOREO',
      '04. safety & pharmacovigilance': '04. SEGURIDAD Y FARMACOVIGILANCIA',
      '05. quality, compliance & close-out': '05. CALIDAD, CUMPLIMIENTO Y CIERRE',
      '06. system administration': '06. ADMINISTRACIÓN DEL SISTEMA',

      // Tasks
      'regulatory management and dossier': 'Gestión Regulatoria y Dossier',
      'site selection visit (ssv)': 'Visita de Selección del Sitio (SSV)',
      'site initiation visit (siv)': 'Visita de Iniciación del Sitio (SIV)',
      'trial master file (tmf) processing': 'Procesamiento de Trial Master File (TMF)',
      'recruitment execution': 'Ejecución de Reclutamiento',
      'retention strategies': 'Estrategias de Retención',
      'ecrf data management': 'Gestión de Datos eCRF',
      'query resolution': 'Resolución de Consultas',
      'subject visit control': 'Control de Visitas de Sujetos',
      'routine monitoring visit (rmv)': 'Visita de Monitoreo de Rutina (RMV)',
      'centralized monitoring': 'Monitoreo Centralizado',
      'site communication': 'Comunicación con el Sitio',
      'safety reporting': 'Reporte de Seguridad',
      'audit and monitoring support': 'Soporte a Auditoría y Monitoreo',
      'close-out visit (cov)': 'Visita de Cierre (COV)',
      'user management': 'Gestión de Usuarios',

      // Sub-tasks
      'initial submission to ethics committees (cec/irb)': 'Sometimiento inicial a Comités de Ética (CEC/IRB)',
      'investigator site file (isf) update and pagination': 'Actualización y foliación del Investigator Site File (ISF)',
      'clinical trial agreement (cta) signature management': 'Gestión de firmas de Clinical Trial Agreement (CTA)',
      'facility assessment': 'Evaluación de Instalaciones',
      'pi qualification review': 'Revisión de Cualificación del IP',
      'protocol training': 'Entrenamiento de Protocolo',
      'ip handling review': 'Revisión de Manejo de IP',
      'uploading to etmf': 'Carga en eTMF',
      'pre-screening execution and logs': 'Ejecución de Pre-screening y logs',
      'potential patient database management': 'Gestión de bases de datos de pacientes potenciales',
      'logistics and transport coordination for subjects': 'Coordinación de logística y transporte para sujetos',
      'reminder calls and visit follow-up': 'Llamadas de recordatorio y seguimiento de visitas',
      'source to ecrf transcription': 'Transcripción de fuente a eCRF',
      'laboratory and procedure results upload': 'Carga de resultados de laboratorios y procedimientos',
      'ae/sae logs registration and update': 'Registro y actualización de logs de CM/EAs',
      'technical response to queries': 'Respuesta técnica a Consultas',
      'corrections execution in edc and source': 'Ejecución de correcciones en sistema EDC y fuente',
      'investigator sign-off management': 'Gestión de firmas del Investigador (Sign-off)',
      'in-window visit scheduling and registration': 'Programación de visitas en ventana y registro',
      'sdv/sdr': 'SDV/SDR',
      'ip accountability': 'Contabilidad de IP',
      'kri review': 'Revisión de KRI',
      'data trending analysis': 'Análisis de Tendencias de Datos',
      'weekly check-in calls': 'Llamadas de seguimiento semanales',
      'email correspondence': 'Correspondencia por correo',
      'sae initial notification and follow-up': 'Notificación inicial y seguimiento de SAEs',
      'medical source collection and anonymization': 'Recolección y anonimización de fuentes médicas',
      'medical assessment of causality and severity': 'Evaluación médica de causalidad y severidad',
      'visit preparation (sdv/sdr readiness)': 'Preparación de visitas (SDV/SDR readiness)',
      'quality control activities execution': 'Ejecución de actividades de Control de Calidad',
      'follow-up letter (ful) findings response': 'Respuesta a hallazgos de cartas de seguimiento (FUL)',
      'final ip reconciliation': 'Reconciliación Final de IP',
      'account provisioning': 'Aprovisionamiento de Cuenta',

      // DB Mock Projects
      'just in-time (jit)': 'Just in-Time (JIT)',
      'oncology phase iii (prc)': 'Oncología Fase III (PRC)'
    };

    // Map known English terms to Portuguese
    const enToPt: Record<string, string> = {
      // Categories
      '01. start-up & regulatory': '01. START-UP E REGULATÓRIO',
      '02. recruitment & retention': '02. RECRUTAMENTO E RETENÇÃO',
      '03. conduct & monitoring': '03. CONDUÇÃO E MONITORAMENTO',
      '04. safety & pharmacovigilance': '04. SEGURANÇA E FARMACOVIGILÂNCIA',
      '05. quality, compliance & close-out': '05. QUALIDADE, CONFORMIDADE E ENCERRAMENTO',
      '06. system administration': '06. ADMINISTRAÇÃO DO SISTEMA',

      // Tasks
      'regulatory management and dossier': 'Gestão Regulatória e Dossiê',
      'site selection visit (ssv)': 'Visita de Seleção do Local (SSV)',
      'site initiation visit (siv)': 'Visita de Iniciação do Local (SIV)',
      'trial master file (tmf) processing': 'Processamento do Trial Master File (TMF)',
      'recruitment execution': 'Execução de Recrutamento',
      'retention strategies': 'Estratégias de Retenção',
      'ecrf data management': 'Gestão de Dados eCRF',
      'query resolution': 'Resolução de Consultas',
      'subject visit control': 'Controle de Visitas de Sujeitos',
      'routine monitoring visit (rmv)': 'Visita de Monitoramento de Rotina (RMV)',
      'centralized monitoring': 'Monitoramento Centralizado',
      'site communication': 'Comunicação com o Local',
      'safety reporting': 'Relatórios de Segurança',
      'audit and monitoring support': 'Suporte a Auditoria e Monitoramento',
      'close-out visit (cov)': 'Visita de Encerramento (COV)',
      'user management': 'Gestão de Usuários',

      // Sub-tasks
      'initial submission to ethics committees (cec/irb)': 'Submissão Inicial aos Comitês de Ética (CEC/IRB)',
      'investigator site file (isf) update and pagination': 'Atualização e Paginação do Investigator Site File (ISF)',
      'clinical trial agreement (cta) signature management': 'Gestão de Assinaturas do Clinical Trial Agreement (CTA)',
      'facility assessment': 'Avaliação de Instalações',
      'pi qualification review': 'Revisão de Qualificação do IP',
      'protocol training': 'Treinamento de Protocolo',
      'ip handling review': 'Revisão de Manuseio de IP',
      'uploading to etmf': 'Upload para eTMF',
      'pre-screening execution and logs': 'Execução de Pré-triagem e Logs',
      'potential patient database management': 'Gestão de Banco de Dados de Pacientes Potenciais',
      'logistics and transport coordination for subjects': 'Coordenação de Logística e Transporte para Sujeitos',
      'reminder calls and visit follow-up': 'Chamadas de Lembrete e Acompanhamento de Visitas',
      'source to ecrf transcription': 'Transcrição de Fonte para eCRF',
      'laboratory and procedure results upload': 'Upload de Resultados de Laboratório e Procedimentos',
      'ae/sae logs registration and update': 'Registro e Atualização de Logs AE/SAE',
      'technical response to queries': 'Resposta Técnica a Consultas',
      'corrections execution in edc and source': 'Execução de Correções no EDC e Fonte',
      'investigator sign-off management': 'Gestão de Assinaturas do Investigador (Sign-off)',
      'in-window visit scheduling and registration': 'Agendamento e Registro de Visitas na Janela',
      'sdv/sdr': 'SDV/SDR',
      'ip accountability': 'Contabilidade de IP',
      'kri review': 'Revisão de KRI',
      'data trending analysis': 'Análise de Tendências de Dados',
      'weekly check-in calls': 'Chamadas Semanais de Acompanhamento',
      'email correspondence': 'Correspondência por E-mail',
      'sae initial notification and follow-up': 'Notificação Inicial e Acompanhamento de SAE',
      'medical source collection and anonymization': 'Coleta de Fonte Médica e Anonimização',
      'medical assessment of causality and severity': 'Avaliação Médica de Causalidade e Gravidade',
      'visit preparation (sdv/sdr readiness)': 'Preparação de Visita (SDV/SDR Readiness)',
      'quality control activities execution': 'Execução de Atividades de Controle de Qualidade',
      'follow-up letter (ful) findings response': 'Resposta a Descobertas de Carta de Acompanhamento (FUL)',
      'final ip reconciliation': 'Reconciliação Final de IP',
      'account provisioning': 'Provisionamento de Conta',

      // DB Mock Projects
      'just in-time (jit)': 'Just in-Time (JIT)',
      'oncology phase iii (prc)': 'Oncologia Fase III (PRC)'
    };

    if (language === 'es') {
      return enToEs[normalized] || text;
    } else if (language === 'pt') {
      return enToPt[normalized] || text;
    }

    return text;
  };

  return { dt: translateDynamic };
}
