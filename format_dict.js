const fs = require('fs');
let code = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// The file has multiple exports maybe or duplicated lines that I missed, let's just do a clean replacement by parsing and generating.
