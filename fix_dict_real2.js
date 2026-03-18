const fs = require('fs');

let content = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// The ES one has two generateInsights:
content = content.replace(
  "generateInsights: 'Generar Insights con IA', generateInsights: 'Gerar Insights com IA'",
  "generateInsights: 'Generar Insights con IA'"
);

// We need to look exactly at the lines to fix them
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('reports: {') && lines[i].includes('Generar Insights con IA')) {
        // Fix duplicate if any
        let replaced = lines[i].replace(/generateInsights: 'Generar Insights con IA', generateInsights: '[^']+',/, "generateInsights: 'Generar Insights con IA',");
        lines[i] = replaced;
    }

    // Fix PT missing
    if (lines[i].includes("reports: {") && lines[i].includes("Relatórios") && !lines[i].includes("generateInsights")) {
        lines[i] = lines[i].replace("export: 'Exportar CSV' },", "export: 'Exportar CSV', generateInsights: 'Gerar Insights com IA' },");
    }
}

fs.writeFileSync('lib/i18n/dictionaries.ts', lines.join('\n'));
