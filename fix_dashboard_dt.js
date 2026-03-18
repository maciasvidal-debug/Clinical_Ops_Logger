const fs = require('fs');

let content = fs.readFileSync('components/dashboard/DashboardView.tsx', 'utf8');

// Dashboard does not use `dt` yet. Let's add it.
content = content.replace(
  'const { t, language } = useTranslation();',
  'const { t, language } = useTranslation();\n  const { dt } = useDynamicTranslation();'
);

content = content.replace(
  '<span className="font-medium text-neutral-900 group-hover:text-indigo-600 transition-colors">{entry.activity}</span>',
  '<span className="font-medium text-neutral-900 group-hover:text-indigo-600 transition-colors">{dt(entry.activity)}</span>'
);

content = content.replace(
  '<p className="text-xs text-neutral-500 mt-1">{entry.category}</p>',
  '<p className="text-xs text-neutral-500 mt-1">{dt(entry.category)}</p>'
);

content = content.replace(
  '<span className="text-sm font-medium text-neutral-900 truncate pr-4">{category}</span>',
  '<span className="text-sm font-medium text-neutral-900 truncate pr-4">{dt(category)}</span>'
);

fs.writeFileSync('components/dashboard/DashboardView.tsx', content);
