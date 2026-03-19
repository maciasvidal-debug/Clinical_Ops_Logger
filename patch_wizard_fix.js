const fs = require('fs');

// 1. Fix types.ts
let types = fs.readFileSync('lib/types.ts', 'utf8');
types = types.replace(/  number\?: string;\n/, '');
fs.writeFileSync('lib/types.ts', types);

// 2. Fix actions_structure.ts
let actions = fs.readFileSync('lib/actions_structure.ts', 'utf8');
actions = actions.replace(/  number\?: string;\n/, '  id: string;\n');
actions = actions.replace(
  /export async function createSite\(payload: CreateSitePayload\): Promise<Site> \{\n  \/\/ Use crypto\.randomUUID\(\) for the site ID if Supabase doesn't auto-generate it \(since id is string, typically UUID or varchar\)\n  const id = crypto\.randomUUID\(\);\n  const \{ data, error \} = await supabase\n    \.from\("sites"\)\n    \.insert\(\[\{ id, \.\.\.payload \}\]\)/,
  'export async function createSite(payload: CreateSitePayload): Promise<Site> {\n  const { data, error } = await supabase\n    .from("sites")\n    .insert([payload])'
);
fs.writeFileSync('lib/actions_structure.ts', actions);

// 3. Fix StructureWizard.tsx
let wizard = fs.readFileSync('components/settings/StructureWizard.tsx', 'utf8');
wizard = wizard.replace(
  /      await createSite\(\{\n        protocol_id: finalProtocolId,\n        number: siteNumber\.trim\(\),\n/,
  '      await createSite({\n        id: siteNumber.trim(),\n        protocol_id: finalProtocolId,\n'
);
wizard = wizard.replace(
  /<p className="font-bold text-gray-900 text-xl">#\{siteNumber\} - \{siteName\}<\/p>/,
  '<p className="font-bold text-gray-900 text-xl">Site {siteNumber} - {siteName}</p>'
);
fs.writeFileSync('components/settings/StructureWizard.tsx', wizard);

// 4. Update the SQL Migration
let sql = fs.readFileSync('supabase/migrations/20260318000003_update_sites_schema.sql', 'utf8');
sql = sql.replace(/ADD COLUMN IF NOT EXISTS number TEXT,\n/, '');
sql = sql.replace(/-- Create an index on the site number as it might be queried often\nCREATE INDEX IF NOT EXISTS idx_sites_number ON public\.sites\(number\);\n/, '');
fs.writeFileSync('supabase/migrations/20260318000003_update_sites_schema.sql', sql);
