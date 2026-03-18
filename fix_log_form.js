const fs = require('fs');
let content = fs.readFileSync('components/log/LogFormView.tsx', 'utf8');

// Fix AI section text
content = content.replace(
  'Describe what you did in natural language, and let AI fill out the form for you.',
  '{t.logForm.aiDescription}'
);
content = content.replace(
  'placeholder="e.g., I spent 2 hours reviewing ICFs for Protocol A at Site 101..."',
  'placeholder={t.logForm.aiPlaceholder}'
);
content = content.replace(
  '>Auto-Fill<',
  '>{t.logForm.aiButton}<'
);
content = content.replace(
  'Auto-Fill',
  '{t.logForm.aiButton}'
); // the inside span

// Fix default selections manually as fallback
content = content.replace(
  '<option value="">No Projects Assigned</option>',
  '<option value="">{t.logForm.selectProject}</option>'
);
content = content.replace(
  '<option value="">No Protocols</option>',
  '<option value="">{t.logForm.selectProtocol}</option>'
);
content = content.replace(
  '<option value="">N/A or General</option>',
  '<option value="">{t.logForm.selectSite}</option>'
);

fs.writeFileSync('components/log/LogFormView.tsx', content);
