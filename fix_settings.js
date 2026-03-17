const fs = require('fs');
let s = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');

// The global replace messed up imports and jsx tags:
s = s.replace(/\{t\.common\.edit\}2/g, 'Edit2');

fs.writeFileSync('components/settings/SettingsView.tsx', s);
