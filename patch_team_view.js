const fs = require('fs');
let file = fs.readFileSync('components/team/TeamView.tsx', 'utf8');

// The TeamView component currently doesn't know WHO the current user is.
// We need to inject the currentUserProfile from props to apply the manager vs super_admin logic.

file = file.replace(
  /interface TeamViewProps \{/,
  'interface TeamViewProps {\n  currentUserProfile?: UserProfile;'
);

file = file.replace(
  /export function TeamView\(\{ \n  profiles,/,
  'export function TeamView({ \n  currentUserProfile,\n  profiles,'
);

// We filter the profiles based on role
const filterLogic = `
  const { t } = useTranslation();

  // Filter profiles based on role
  const visibleProfiles = useMemo(() => {
    if (!currentUserProfile) return [];
    if (currentUserProfile.role === "super_admin") {
      return profiles;
    }
    // For managers, only show their team
    return profiles.filter(p => p.manager_id === currentUserProfile.id || p.id === currentUserProfile.id);
  }, [profiles, currentUserProfile]);

  // Use visibleProfiles instead of profiles for rendering logic
`;

file = file.replace(
  /  const \{ t \} = useTranslation\(\);/,
  filterLogic
);

// Update pending and active profiles logic
file = file.replace(
  /const pendingProfiles = profiles\.filter\(p => p\.status === "pending"\);/,
  'const pendingProfiles = visibleProfiles.filter(p => p.status === "pending");'
);

file = file.replace(
  /const activeProfiles = profiles\.filter\(p => p\.status === "active"\);/,
  'const activeProfiles = visibleProfiles.filter(p => p.status === "active");'
);

// Allow super admin to assign managers to users.
// We will add a simple Manager selector for super admins when expanding a user
const managerSelector = `
                        {currentUserProfile?.role === "super_admin" && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2 border-b pb-1">Assign Manager</label>
                            <select
                              className="w-full max-w-sm p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                              value={profile.manager_id || ""}
                              onChange={async (e) => {
                                const newManagerId = e.target.value;
                                try {
                                  // This assumes you have an API or Supabase call here. Let's do a direct Supabase update for simplicity
                                  // or notify the parent. Since we don't have a direct function passed, we'll do it via supabase client directly if available,
                                  // but best is to update via store.
                                  // We will just alert the user that this requires a specific backend action for now, or implement it inline.
                                  const { supabase } = await import("@/lib/supabase");
                                  const { error } = await supabase.from("user_profiles").update({ manager_id: newManagerId || null }).eq("id", profile.id);
                                  if (error) throw error;
                                  toast.success("Manager updated. Please refresh.");
                                  onRefresh?.();
                                } catch (err) {
                                  toast.error("Failed to update manager");
                                }
                              }}
                            >
                              <option value="">-- No Manager --</option>
                              {profiles.filter(p => p.role === "manager").map(m => (
                                <option key={m.id} value={m.id}>{m.first_name} {m.last_name} (Manager)</option>
                              ))}
                            </select>
                          </div>
                        )}
`;

file = file.replace(
  /<div className="flex gap-8">/,
  `${managerSelector}\n                        <div className="flex gap-8">`
);

fs.writeFileSync('components/team/TeamView.tsx', file);
