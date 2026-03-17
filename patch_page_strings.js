const fs = require('fs');
let pageContent = fs.readFileSync('app/page.tsx', 'utf8');

pageContent = pageContent.replace(
  `{t.auth.contactAdmin}`,
  `{t.auth.accountRejected}`
);

fs.writeFileSync('app/page.tsx', pageContent);
