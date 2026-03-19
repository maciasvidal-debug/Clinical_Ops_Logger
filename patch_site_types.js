const fs = require('fs');
let file = fs.readFileSync('lib/types.ts', 'utf8');

file = file.replace(
  /export interface Site \{\n  id: string;\n  protocol_id: string;\n  name: string;\n  country: string;\n  created_at: string;\n\}/,
  'export interface Site {\n  id: string;\n  protocol_id: string;\n  number?: string;\n  name: string;\n  address?: string;\n  city?: string;\n  country: string;\n  region_id?: string;\n  created_at: string;\n  regions?: Region;\n}'
);

fs.writeFileSync('lib/types.ts', file);
