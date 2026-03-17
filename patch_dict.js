const fs = require('fs');
let d = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// replace settings in navigation
d = d.replace(/reports: 'Reports', team: 'Team', signOut: 'Sign Out'/, "reports: 'Reports', team: 'Team', settings: 'Settings', signOut: 'Sign Out'");
d = d.replace(/reports: 'Reportes', team: 'Equipo', signOut: 'Cerrar Sesión'/, "reports: 'Reportes', team: 'Equipo', settings: 'Ajustes', signOut: 'Cerrar Sesión'");
d = d.replace(/reports: 'Relatórios', team: 'Equipe', signOut: 'Sair'/, "reports: 'Relatórios', team: 'Equipe', settings: 'Configurações', signOut: 'Sair'");

fs.writeFileSync('lib/i18n/dictionaries.ts', d);
