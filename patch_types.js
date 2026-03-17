const fs = require('fs');
let d = fs.readFileSync('lib/i18n/types.ts', 'utf8');

d = d.replace(/team: string;/g, "team: string;\n    settings: string;");

fs.writeFileSync('lib/i18n/types.ts', d);
