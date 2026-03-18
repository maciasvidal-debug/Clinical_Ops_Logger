const fs = require('fs');

let tContent = fs.readFileSync('lib/i18n/types.ts', 'utf8');

// Dashboard Additions
tContent = tContent.replace(
  'viewHistory: string;',
  'viewHistory: string; noDataThisWeek: string;'
);

// Reports additions
tContent = tContent.replace(
  'export: string;',
  'export: string; generateInsights: string;'
);

fs.writeFileSync('lib/i18n/types.ts', tContent);


let dictContent = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

dictContent = dictContent.replace(
  "viewHistory: 'View History',",
  "viewHistory: 'View History', noDataThisWeek: 'No data for this week yet.',"
);
dictContent = dictContent.replace(
  "viewHistory: 'Ver Historial',",
  "viewHistory: 'Ver Historial', noDataThisWeek: 'No hay datos para esta semana todavía.',"
);
dictContent = dictContent.replace(
  "viewHistory: 'Ver Histórico',",
  "viewHistory: 'Ver Histórico', noDataThisWeek: 'Não há dados para esta semana ainda.',"
);

dictContent = dictContent.replace(
  "export: 'Export CSV',",
  "export: 'Export CSV', generateInsights: 'Generate AI Insights',"
);
dictContent = dictContent.replace(
  "export: 'Exportar CSV',",
  "export: 'Exportar CSV', generateInsights: 'Generar Insights con IA',"
);
dictContent = dictContent.replace(
  "export: 'Exportar CSV',",
  "export: 'Exportar CSV', generateInsights: 'Gerar Insights com IA',"
);

fs.writeFileSync('lib/i18n/dictionaries.ts', dictContent);
