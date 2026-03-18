const fs = require('fs');
let content = fs.readFileSync('components/log/LogFormView.tsx', 'utf8');

content = content.replace(
  'placeholder="Add any additional context or details..."',
  'placeholder={t.logForm.notesPlaceholder}'
);

fs.writeFileSync('components/log/LogFormView.tsx', content);
