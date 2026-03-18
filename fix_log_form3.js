const fs = require('fs');
let content = fs.readFileSync('components/log/LogFormView.tsx', 'utf8');

content = content.replace(
  'placeholder=\'e.g., "Spent 2 hours doing remote monitoring for site 01 on protocol 101"\'',
  'placeholder={t.logForm.aiPlaceholder}'
);

content = content.replace(
  '<span>Auto-fill</span>',
  '<span>{t.logForm.aiButton}</span>'
);

fs.writeFileSync('components/log/LogFormView.tsx', content);
