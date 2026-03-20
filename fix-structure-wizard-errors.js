const fs = require('fs');
const file = 'components/settings/StructureWizard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/t\.settings\.projectNameRequired/g, '"El nombre del proyecto es obligatorio"');
content = content.replace(/t\.settings\.selectProjectFirst/g, '"Debes seleccionar un proyecto primero"');
content = content.replace(/t\.settings\.protocolNameRequired/g, '"El nombre del protocolo es obligatorio"');
content = content.replace(/t\.settings\.selectProtocolFirst/g, '"Debes seleccionar un protocolo primero"');
content = content.replace(/t\.settings\.siteDetailsRequired/g, '"Los detalles del sitio son obligatorios"');
content = content.replace(/t\.settings\.siteCreatedSuccess/g, '"Sitio creado exitosamente"');

fs.writeFileSync(file, content);
