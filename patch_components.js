const fs = require('fs');

// DASHBOARD
let dash = fs.readFileSync('components/dashboard/DashboardView.tsx', 'utf8');
dash = dash.replace(/Today&apos;s Time/g, '{t.dashboard.todayLogs}'); // Reusing some strings
dash = dash.replace(/Pendiente/g, '{t.status.pending}');
dash = dash.replace(/Registrar Tiempo/g, '{t.navigation.log}');
dash = dash.replace(/Time by Category \(This Week\)/g, '{t.reports.timeByCategory}');

fs.writeFileSync('components/dashboard/DashboardView.tsx', dash);

// HISTORY
let hist = fs.readFileSync('components/history/HistoryView.tsx', 'utf8');
hist = hist.replace(/Reply to Query/g, '{t.history.reply}');
fs.writeFileSync('components/history/HistoryView.tsx', hist);

// REPORTS
let rep = fs.readFileSync('components/reports/ReportsView.tsx', 'utf8');
rep = rep.replace(/Analyze time distribution across studies and activities\./g, '{t.reports.subtitle}');
rep = rep.replace(/Export Timesheet \(PDF\)/g, '{t.reports.export}'); // Reusing export
fs.writeFileSync('components/reports/ReportsView.tsx', rep);

// TEAM
let team = fs.readFileSync('components/team/TeamView.tsx', 'utf8');
// The ones found are actually inside Javascript expressions or already translated
