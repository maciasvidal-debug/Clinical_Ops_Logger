const fs = require('fs');
let code = fs.readFileSync('lib/i18n/types.ts', 'utf8');
code = code.replace(/status: { active: string; pending: string; rejected: string; };/g, "status: { active: string; pending: string; rejected: string; published: string; };");
fs.writeFileSync('lib/i18n/types.ts', code);
