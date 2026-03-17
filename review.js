const fs = require('fs');

const filesToReview = [
  'app/page.tsx',
  'components/settings/SettingsView.tsx',
  'components/dashboard/DashboardView.tsx',
  'components/history/HistoryView.tsx',
  'components/log/LogFormView.tsx',
  'components/reports/ReportsView.tsx',
  'components/team/TeamView.tsx'
];

for (const file of filesToReview) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`Checking ${file}...`);
  // Look for potential hardcoded strings inside JSX
  // Very rough regex
  const matches = content.match(/>([^<{}A-Za-z]+[A-Za-z]+[^<{}]+)</g);
  if (matches) {
     const text = matches.map(m => m.slice(1, -1).trim()).filter(m => m.length > 2 && !m.includes('t.'));
     if (text.length > 0) {
       console.log(`Potential strings in ${file}:`, text.slice(0, 10)); // print first 10
     }
  }
}
