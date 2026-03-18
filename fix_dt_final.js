const fs = require('fs');

let logContent = fs.readFileSync('components/log/LogFormView.tsx', 'utf8');
logContent = logContent.replace(/\{dt\(/g, '{dt('); // dummy replace to see if dt is used but undefined
if (!logContent.includes('const { dt } = useDynamicTranslation()')) {
    logContent = logContent.replace(
        'const { t, language } = useTranslation();',
        'const { t, language } = useTranslation();\n  const { dt } = useDynamicTranslation();'
    );
}
fs.writeFileSync('components/log/LogFormView.tsx', logContent);

let dictContent = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');
// Fix ES duplicate
dictContent = dictContent.replace(
    "export: 'Exportar CSV', generateInsights: 'Generar Insights con IA', generateInsights: 'Generar Insights con IA',",
    "export: 'Exportar CSV', generateInsights: 'Generar Insights con IA',"
);
// Fix PT missing
dictContent = dictContent.replace(
    "export: 'Exportar CSV' },",
    "export: 'Exportar CSV', generateInsights: 'Gerar Insights com IA' },"
);
fs.writeFileSync('lib/i18n/dictionaries.ts', dictContent);
