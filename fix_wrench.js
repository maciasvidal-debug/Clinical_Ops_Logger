const fs = require('fs');
let content = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');

// Ensure Wrench is imported
if (!content.includes('Wrench')) {
  content = content.replace(
    /import {([^}]+)} from "lucide-react";/g,
    (match, p1) => {
      if (p1.includes('Wrench')) return match;
      return `import {${p1}, Wrench } from "lucide-react";`;
    }
  );
} else {
    content = content.replace(
    /import {([^}]+)} from "lucide-react";/,
    (match, p1) => {
      if (p1.includes('Wrench')) return match;
      return `import {${p1}, Wrench } from "lucide-react";`;
    }
  );
}

fs.writeFileSync('components/settings/SettingsView.tsx', content);
