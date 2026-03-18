const fs = require('fs');

let content = fs.readFileSync('lib/i18n/utils.ts', 'utf8');

const newEnToEs = `
      'site management': 'Gestión del Sitio',
      'document review': 'Revisión de Documentos',
      'patient visit': 'Visita de Paciente',
      'data entry': 'Ingreso de Datos',
      'query resolution': 'Resolución de Consultas',
      'training': 'Capacitación',
      'meeting': 'Reunión',
      'preparation': 'Preparación',
      'follow up': 'Seguimiento',
      'icf review': 'Revisión de ICF',
      'protocol review': 'Revisión de Protocolo',
      'source data verification': 'Verificación de Datos Fuente',
      'travel': 'Viaje',
      'admin': 'Administración',
      'monitoring visit': 'Visita de Monitoreo',
      'site initiation visit': 'Visita de Iniciación del Sitio (SIV)',
      'close-out visit': 'Visita de Cierre',
      'other': 'Otro',
      // DB Terms
      'start-up & regulatory': 'START-UP & REGULATORIO',
      '01. start-up & regulatory': '01. START-UP & REGULATORIO',
      'regulatory management and dossier': 'Gestión Regulatoria y Dossier',
      'site selection visit (ssv)': 'Visita de Selección del Sitio (SSV)',
      'site initiation visit (siv)': 'Visita de Iniciación del Sitio (SIV)',
      'trial master file (tmf) processing': 'Procesamiento de Trial Master File (TMF)',
      'initial submission to ethics committees (cec/irb)': 'Sometimiento inicial a Comités de Ética (CEC/IRB)',
      'investigator site file (isf) update and pagination': 'Actualización y foliación del Investigator Site File (ISF)',
      'clinical trial agreement (cta) signature management': 'Gestión de firmas de Clinical Trial Agreement (CTA)',
      // DB Mock Projects
      'just in-time (jit)': 'Just in-Time (JIT)',
      'oncology phase iii (prc)': 'Oncología Fase III (PRC)'
`;

const newEsToEn = `
      'gestión del sitio': 'Site Management',
      'revisión de documentos': 'Document Review',
      'visita de paciente': 'Patient Visit',
      'ingreso de datos': 'Data Entry',
      'resolución de consultas': 'Query Resolution',
      'capacitación': 'Training',
      'reunión': 'Meeting',
      'preparación': 'Preparation',
      'seguimiento': 'Follow up',
      'revisión de icf': 'ICF Review',
      'revisión de protocolo': 'Protocol Review',
      'verificación de datos fuente': 'Source Data Verification',
      'viaje': 'Travel',
      'administración': 'Admin',
      'visita de monitoreo': 'Monitoring Visit',
      'visita de iniciación del sitio (siv)': 'Site Initiation Visit (SIV)',
      'visita de cierre': 'Close-out Visit',
      'otro': 'Other',
      // DB Terms
      'start-up & regulatorio': 'START-UP & REGULATORY',
      '01. start-up & regulatorio': '01. START-UP & REGULATORY',
      'gestión regulatoria y dossier': 'Regulatory Management and Dossier',
      'visita de selección del sitio (ssv)': 'Site Selection Visit (SSV)',
      'procesamiento de trial master file (tmf)': 'Trial Master File (TMF) Processing',
      'sometimiento inicial a comités de ética (cec/irb)': 'Initial Submission to Ethics Committees (CEC/IRB)',
      'actualización y foliación del investigator site file (isf)': 'Investigator Site File (ISF) Update and Pagination',
      'gestión de firmas de clinical trial agreement (cta)': 'Clinical Trial Agreement (CTA) Signature Management',
      // DB Mock Projects
      'oncología fase iii (prc)': 'Oncology Phase III (PRC)'
`;

content = content.replace(
  /'site management': 'Gestión del Sitio',[\s\S]*?'other': 'Otro'/m,
  newEnToEs.trim()
);

content = content.replace(
  /'gestión del sitio': 'Site Management',[\s\S]*?'otro': 'Other'/m,
  newEsToEn.trim()
);

fs.writeFileSync('lib/i18n/utils.ts', content);
