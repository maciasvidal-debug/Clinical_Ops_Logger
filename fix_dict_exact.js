const fs = require('fs');

let content = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

content = content.replace(
  "generateInsights: 'Gerar Insights com IA', generateInsights: 'Generar Insights con IA',",
  "generateInsights: 'Generar Insights con IA',"
);

content = content.replace(
  "export: 'Exportar CSV', },",
  "export: 'Exportar CSV', generateInsights: 'Gerar Insights com IA', },"
);

fs.writeFileSync('lib/i18n/dictionaries.ts', content);
