const fs = require('fs');
let s = fs.readFileSync('app/page.tsx', 'utf8');

s = s.replace(/\[logs, user, profile, notifications, todos\]/g, '[logs, user, profile, notifications, todos, t.shell.notifications]');

fs.writeFileSync('app/page.tsx', s);
