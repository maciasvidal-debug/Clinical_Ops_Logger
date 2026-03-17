import { useTranslation } from './index';

export function useDynamicTranslation() {
  const { language } = useTranslation();

  const translateDynamic = (text: string | undefined | null): string => {
    if (!text) return '';
    const normalized = text.toLowerCase().trim();

    // Map known English terms to Spanish
    const enToEs: Record<string, string> = {
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
      'other': 'Otro'
    };

    // Map known Spanish terms to English
    const esToEn: Record<string, string> = {
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
      'visita de iniciación del sitio (siv)': 'Site Initiation Visit',
      'visita de cierre': 'Close-out Visit',
      'otro': 'Other'
    };

    // Map known English terms to Portuguese
    const enToPt: Record<string, string> = {
      'site management': 'Gestão do Local',
      'document review': 'Revisão de Documentos',
      'patient visit': 'Visita de Paciente',
      'data entry': 'Entrada de Dados',
      'query resolution': 'Resolução de Consultas',
      'training': 'Treinamento',
      'meeting': 'Reunião',
      'preparation': 'Preparação',
      'follow up': 'Acompanhamento',
      'icf review': 'Revisão de ICF',
      'protocol review': 'Revisão de Protocolo',
      'source data verification': 'Verificação de Dados Fonte',
      'travel': 'Viagem',
      'admin': 'Administração',
      'monitoring visit': 'Visita de Monitoramento',
      'site initiation visit': 'Visita de Iniciação do Local (SIV)',
      'close-out visit': 'Visita de Encerramento',
      'other': 'Outro'
    };

    if (language === 'es') {
      return enToEs[normalized] || text;
    } else if (language === 'en') {
      return esToEn[normalized] || text;
    } else if (language === 'pt') {
      // First try English to PT, if not found, it might be in Spanish so try ES to EN to PT
      if (enToPt[normalized]) return enToPt[normalized];
      const asEn = esToEn[normalized];
      if (asEn && enToPt[asEn.toLowerCase()]) return enToPt[asEn.toLowerCase()];
      return text;
    }

    return text;
  };

  return { dt: translateDynamic };
}
