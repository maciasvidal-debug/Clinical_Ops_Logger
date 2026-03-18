const fs = require('fs');
let code = fs.readFileSync('components/reports/TimesheetReport.tsx', 'utf8');

// The file was modified previously by patch_components.js, so restoring it undoes the translation changes. We need to re-apply translation changes but also import `useTranslation` properly.

code = code.replace("import { format, parseISO } from 'date-fns';", "import { format, parseISO } from 'date-fns';\nimport { useTranslation } from '../../lib/i18n/context';");

code = code.replace("export function TimesheetReport({\n  profile,\n  logs,\n  onClose\n}: {\n  profile: UserProfile;\n  logs: LogEntry[];\n  onClose: () => void;\n}) {", "export function TimesheetReport({\n  profile,\n  logs,\n  onClose\n}: {\n  profile: UserProfile;\n  logs: LogEntry[];\n  onClose: () => void;\n}) {\n  const { t } = useTranslation();");

// Replacements from patch_components.js
const replacements = [
  ['>Informe de hoja de horas<', '>{t.reports.timesheetReport}<'],
  ['>SiteFlow App<', '>{t.shell.appName}<'],
  ['Page: 1 of 1', '{t.reports.page}: 1 of 1'],
  ['>Recurso<', '>{t.reports.resource}<'],
  ['>Nombre periodo<', '>{t.reports.periodName}<'],
  ['>Fecha<', '>{t.reports.date}<'],
  ['>Nº Proyecto<', '>{t.reports.projectNum}<'],
  ['>Descripción proyecto<', '>{t.reports.projectDesc}<'],
  ['>Nº de Tarea<', '>{t.reports.taskNum}<'],
  ['>Descripción de la tarea<', '>{t.reports.taskDesc}<'],
  ['>Details<', '>{t.reports.details}<'],
  ['>Estado<', '>{t.reports.status}<'],
  ['>Cantidad regular<', '>{t.reports.regularAmount}<'],
  ['>TOTAL<', '>{t.reports.total}<'],
  ['>Publicado<', '>{t.status.published}<'],
  ['>MM/dd/yyyy Total<', '>MM/dd/yyyy {t.reports.total}<'],
  ['>AI Insights & Activity Summary<', '>{t.reports.aiInsightsSummary}<'],
  [/Fecha de inicio:/g, '{t.common.start_date}'],
  [/Descripción: All Activities/g, '{t.reports.description}: {t.reports.allActivities}'],
  [/Filters:/g, '{t.reports.filters}:']
];

for (const [search, replace] of replacements) {
    if (search instanceof RegExp) {
        code = code.replace(search, replace);
    } else {
        code = code.split(search).join(replace);
    }
}

fs.writeFileSync('components/reports/TimesheetReport.tsx', code);
