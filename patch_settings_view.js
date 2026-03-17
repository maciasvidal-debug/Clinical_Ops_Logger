const fs = require('fs');

let content = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');

// Imports
content = content.replace(
  `import { useTranslation } from "@/lib/i18n";`,
  `import { useTranslation } from "@/lib/i18n";\nimport { useDynamicTranslation } from "@/lib/i18n/utils";`
);

content = content.replace(
  `const { t } = useTranslation();`,
  `const { t } = useTranslation();\n  const { dt } = useDynamicTranslation();`
);

// Dynamic strings
content = content.replace(/\{cat\.name\}/g, '{dt(cat.name)}');
content = content.replace(/\{task\.name\}/g, '{dt(task.name)}');
content = content.replace(/\{st\.name\}/g, '{dt(st.name)}');

fs.writeFileSync('components/settings/SettingsView.tsx', content);
