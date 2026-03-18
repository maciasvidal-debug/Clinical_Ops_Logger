const fs = require('fs');

let code = fs.readFileSync('components/auth/PendingApprovalView.tsx', 'utf8');
code = code.replace('SiteFlow Clinical Ops Logger', '{t.shell.appSubtitle}');
fs.writeFileSync('components/auth/PendingApprovalView.tsx', code);
