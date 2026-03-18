const fs = require('fs');

let content = fs.readFileSync('components/log/LogFormView.tsx', 'utf8');

// The file already imports `dt`
// Add dt() wraps where DB dynamic options are mapped

// 1. Projects
content = content.replace(
  '<option key={p.id} value={p.id}>{p.name}</option>',
  '<option key={p.id} value={p.id}>{dt(p.name)}</option>'
);

// 2. Protocols
content = content.replace(
  '<option key={p.id} value={p.id}>{p.name}</option>',
  '<option key={p.id} value={p.id}>{dt(p.name)}</option>'
);

// 3. Categories
content = content.replace(
  '<option key={c} value={c}>{c}</option>',
  '<option key={c} value={c}>{dt(c)}</option>'
);

// 4. Activities
content = content.replace(
  '<span className="font-medium text-neutral-900 group-hover:text-indigo-700 transition-colors block leading-tight">{activity.name}</span>',
  '<span className="font-medium text-neutral-900 group-hover:text-indigo-700 transition-colors block leading-tight">{dt(activity.name)}</span>'
);

// 5. Sub-tasks
content = content.replace(
  '<span className="text-sm font-medium text-neutral-700">{task}</span>',
  '<span className="text-sm font-medium text-neutral-700">{dt(task)}</span>'
);

fs.writeFileSync('components/log/LogFormView.tsx', content);
