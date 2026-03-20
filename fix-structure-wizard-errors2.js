const fs = require('fs');
const file = 'components/settings/StructureWizard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const pRes = await createProject\(newProjectName\.trim\(\)\);\n        if \(\!pRes\.success \|\| \!pRes\.data\) throw new Error\(pRes\.error \|\| "Failed to create project"\);\n        projectId = pRes\.data\.id;/g, `const pRes = await createProject(newProjectName.trim());
        if (!pRes) throw new Error("Failed to create project");
        projectId = pRes.id;`);

content = content.replace(/const ptRes = await createProtocol\(newProtocolName\.trim\(\), projectId\);\n        if \(\!ptRes\.success \|\| \!ptRes\.data\) throw new Error\(ptRes\.error \|\| "Failed to create protocol"\);\n        protocolId = ptRes\.data\.id;/g, `const ptRes = await createProtocol(projectId, newProtocolName.trim());
        if (!ptRes) throw new Error("Failed to create protocol");
        protocolId = ptRes.id;`);

content = content.replace(/const mzRes = await createMicroZone\(microZoneName\.trim\(\), protocolId, "specific_zoning"\);\n        if \(\!mzRes\.success \|\| \!mzRes\.data\) throw new Error\(mzRes\.error \|\| "Failed to create micro-zone"\);\n        microZoneId = mzRes\.data\.id;/g, `const mzRes = await createMicroZone({ site_id: "pending_override_or_leave_null", name: microZoneName.trim() });
        if (!mzRes) throw new Error("Failed to create micro-zone");
        microZoneId = mzRes.id;`);

content = content.replace(/if \(\!sRes\.success \|\| \!sRes\.data\) throw new Error\(sRes\.error \|\| "Failed to create site"\);/g, `if (!sRes) throw new Error("Failed to create site");`);
content = content.replace(/assignSiteToManager\(selectedManagerId, sRes\.data\.id\)/g, `assignSiteToManager(selectedManagerId, sRes.id)`);
content = content.replace(/if \(\!assignRes\.success\)/g, `if (!assignRes)`);
content = content.replace(/assignRes\.error \|\| /g, ``);

fs.writeFileSync(file, content);
