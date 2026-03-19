const fs = require('fs');
let store = fs.readFileSync('lib/store.ts', 'utf8');

// The app currently fetches master data sequentially without Promise.all in fetchAppData
// Let's optimize it.
const fetchAppDataCode = `
    const [
      logsRes,
      projectsRes,
      protocolsRes,
      sitesRes,
      notifsRes,
      profilesRes,
      projAssigRes,
      protoAssigRes
    ] = await Promise.all([
      logsQuery.order("date", { ascending: false }),
      supabase.from("projects").select("*"),
      supabase.from("protocols").select("*"),
      supabase.from("sites").select("*, regions(*)"),
      supabase.from("app_notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      (role === "super_admin" || role === "manager") ? supabase.from("user_profiles").select("*") : Promise.resolve({ data: [] }),
      supabase.from("user_project_assignments").select("*"),
      supabase.from("user_protocol_assignments").select("*")
    ]);

    if (logsRes.data) setLogs(logsRes.data as LogEntry[]);
    if (projectsRes.data) setProjects(projectsRes.data);
    if (protocolsRes.data) setProtocols(protocolsRes.data);
    if (sitesRes.data) setSites(sitesRes.data);
    if (notifsRes.data) setNotifications(notifsRes.data);
    if (profilesRes.data && profilesRes.data.length > 0) setProfiles(profilesRes.data);
    if (projAssigRes.data) setProjectAssignments(projAssigRes.data);
    if (protoAssigRes.data) setProtocolAssignments(protoAssigRes.data);
`;

const oldFetchAppDataPattern = /\s+const \{ data: logsData \} = await logsQuery\.order\("date", \{ ascending: false \}\);\n\s+if \(logsData\) setLogs\(logsData as LogEntry\[\]\);\n\n\s+\/\/ Fetch master data[\s\S]*?if \(protoAssigData\) setProtocolAssignments\(protoAssigData\);/;

store = store.replace(oldFetchAppDataPattern, fetchAppDataCode);

// Add the refresh/set state exports for the new Structure wizard
const setExports = `
    setProjects,
    setProtocols,
    setSites,
`;

store = store.replace(
  /    protocols,/,
  `    protocols,\n${setExports}`
);

fs.writeFileSync('lib/store.ts', store);
