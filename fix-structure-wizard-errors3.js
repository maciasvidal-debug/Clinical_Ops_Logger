const fs = require('fs');
const file = 'components/settings/StructureWizard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/region: finalRegion,\n/g, '');
content = content.replace(/micro_zone_id: microZoneId/g, ''); // Will not use since payload schema does not seem to have it
content = content.replace(/const mzRes = await createMicroZone\(\{ site_id: "pending_override_or_leave_null", name: microZoneName\.trim\(\) \}\);\n        if \(\!mzRes\) throw new Error\("Failed to create micro-zone"\);\n        microZoneId = mzRes\.id;\n/g, '');

fs.writeFileSync(file, content);
