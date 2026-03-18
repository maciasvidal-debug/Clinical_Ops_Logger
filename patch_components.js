const fs = require('fs');

function replaceInFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    if (search instanceof RegExp) {
        content = content.replace(search, replace);
    } else {
        content = content.split(search).join(replace);
    }
  }
  fs.writeFileSync(path, content);
}

replaceInFile('components/dashboard/DashboardView.tsx', [
  ['>Diagnóstico de Productividad<', '>{dt("productivityDiagnosis")}<'],
  ['>Continuar trabajando en...<', '>{dt("keepWorkingOn")}<'],
  ['Creado:', '{dt("created")}']
]);

replaceInFile('components/reports/ReportsView.tsx', [
  ['>AI Weekly Insights<', '>{t.reports.aiWeeklyInsights}<']
]);

replaceInFile('components/reports/TimesheetReport.tsx', [
  ['>Informe de hoja de horas<', '>{t.reports.timesheetReport}<'],
  ['>SiteFlow App<', '>{t.shell.appName}<'],
  ['Page: 1 of 1', '{t.reports.page}: 1 of 1'], // Need to just replace the whole text
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
]);

replaceInFile('components/log/LogFormView.tsx', [
  ['>No categories available<', '>{t.logForm.noCategoriesAvailable}<']
]);

replaceInFile('components/auth/AuthView.tsx', [
  ['>CRA<', '>{t.roles.cra}<'],
  ['>CRC<', '>{t.roles.crc}<'],
  ['>Data Entry<', '>{t.roles.data_entry}<'],
  ['>Recruitment Specialist<', '>{t.roles.recruitment_specialist}<'],
  ['>Retention Specialist<', '>{t.roles.retention_specialist}<'],
  ['>CTA<', '>{t.roles.cta}<'],
  ['>RA<', '>{t.roles.ra}<'],
  ['>Manager<', '>{t.roles.manager}<'],
  ['>OR<', '>{t.common.or}<']
]);

replaceInFile('components/history/HistoryView.tsx', [
  ['>Manager<', '>{t.roles.manager}<'],
  ['>Staff<', '>{t.roles.staff}<']
]);
