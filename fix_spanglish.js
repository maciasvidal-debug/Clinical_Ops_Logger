const fs = require('fs');

// Fix DashboardView
let dash = fs.readFileSync('components/dashboard/DashboardView.tsx', 'utf8');
dash = dash.replace(
  '{todayLogs.length} entries',
  '{todayLogs.length} {t.dashboard.entries}'
);
dash = dash.replace(
  '{thisWeekLogs.length} entries',
  '{thisWeekLogs.length} {t.dashboard.entries}'
);
dash = dash.replace(
  'Log New Activity',
  '{t.dashboard.logNewActivity}'
);
dash = dash.replace(
  'View My History',
  '{t.dashboard.viewHistory}'
);
dash = dash.replace(
  'Team Management',
  '{t.dashboard.teamManagement}'
);
dash = dash.replace(
  'Review Team History',
  '{t.dashboard.reviewTeamHistory}'
);
dash = dash.replace(
  'No data for this week yet.',
  '{t.dashboard.noDataThisWeek}'
);
dash = dash.replace(
  'No activities logged yet.',
  '{t.dashboard.noRecentEntries}'
);
fs.writeFileSync('components/dashboard/DashboardView.tsx', dash);

// Fix HistoryView
let hist = fs.readFileSync('components/history/HistoryView.tsx', 'utf8');
hist = hist.replace(
  '<p>No activities found.</p>',
  '<p>{t.history.noLogs}</p>'
);
hist = hist.replace(
  'View and manage past activities.',
  '{t.history.subtitle}'
);
hist = hist.replace(
  'Search activities, categories, or notes...',
  '{t.history.searchPlaceholder}'
);
fs.writeFileSync('components/history/HistoryView.tsx', hist);

// Fix ReportsView
let rep = fs.readFileSync('components/reports/ReportsView.tsx', 'utf8');
rep = rep.replace(
  'Visualiza la distribución del tiempo y estadísticas.',
  '{t.reports.subtitle}'
);
rep = rep.replace(
  'Not enough data to generate reports. Log some activities first.',
  '{t.reports.noData}'
);
rep = rep.replace(
  'Generate AI Insights',
  '{t.reports.generateInsights}'
);
fs.writeFileSync('components/reports/ReportsView.tsx', rep);
