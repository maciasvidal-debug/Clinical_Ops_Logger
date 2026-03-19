const fs = require('fs');
let file = fs.readFileSync('components/team/TeamView.tsx', 'utf8');

// There's a problem with the injected code, `profile.id` vs `p.id`
// `profile` doesn't exist in the outer scope, it's inside the `.map(p =>`
file = file.replace(
  /value=\{profile\.manager_id \|\| ""\}/,
  'value={p.manager_id || ""}'
);
file = file.replace(
  /\.eq\("id", profile\.id\)/,
  '.eq("id", p.id)'
);

// We also need to fix visibleProfiles logic. It was:
// const pendingProfiles = visibleProfiles.filter(p => p.status === "pending");
// If there was an error in replacement, let's fix it by regex:
file = file.replace(
  /const pendingProfiles = profiles\.filter\(p => p\.status === "pending"\);/,
  'const pendingProfiles = visibleProfiles ? visibleProfiles.filter(p => p.status === "pending") : profiles.filter(p => p.status === "pending");'
);

file = file.replace(
  /const activeProfiles = profiles\.filter\(p => p\.status === "active"\);/,
  'const activeProfiles = visibleProfiles ? visibleProfiles.filter(p => p.status === "active") : profiles.filter(p => p.status === "active");'
);

fs.writeFileSync('components/team/TeamView.tsx', file);
