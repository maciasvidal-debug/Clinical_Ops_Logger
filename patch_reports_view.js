const fs = require('fs');
let file = fs.readFileSync('components/reports/ReportsView.tsx', 'utf8');

// Import useAppStore and Region
file = file.replace(
  /import \{ LogEntry, Project, UserProfile, ROLE_PERMISSIONS \} from "@\/lib\/types";/,
  'import { LogEntry, Project, UserProfile, ROLE_PERMISSIONS, Region, Site } from "@/lib/types";\nimport { useAppStore } from "@/lib/store";'
);

// Add region filter state
file = file.replace(
  /const \[dateFilter, setDateFilter\] = useState<"week" \| "month" \| "quarter" \| "year">/,
  'const [selectedRegionId, setSelectedRegionId] = useState<string>("all");\n  const [dateFilter, setDateFilter] = useState<"week" | "month" | "quarter" | "year">'
);

// Get regions and sites from store
file = file.replace(
  /export function ReportsView\(\{ logs, profile, projects \}: ReportsViewProps\) \{/,
  'export function ReportsView({ logs, profile, projects }: ReportsViewProps) {\n  const { regions, sites } = useAppStore();'
);

// Filter the logs by region
const regionFilterLogic = `
  // Filter logs by selected region
  const logsFilteredByRegion = useMemo(() => {
    if (selectedRegionId === "all") return visibleLogs;

    // Find all sites that belong to this region
    const sitesInRegion = sites.filter(s => s.region_id === selectedRegionId).map(s => s.id);

    // Only return logs where the site_id is in the selected region
    return visibleLogs.filter(log => log.site_id && sitesInRegion.includes(log.site_id));
  }, [visibleLogs, selectedRegionId, sites]);
`;

file = file.replace(
  /  const filteredLogs = useMemo\(\(\) => \{/,
  `${regionFilterLogic}\n\n  const filteredLogs = useMemo(() => {`
);

// Change `visibleLogs` to `logsFilteredByRegion` in the time filter
file = file.replace(
  /return visibleLogs\.filter\(\(log\) => \{/,
  'return logsFilteredByRegion.filter((log) => {'
);

// Add Region Dropdown in UI
const regionDropdown = `
          {/* Region Filter */}
          <div className="flex flex-col gap-1 w-full md:w-auto min-w-[150px]">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </label>
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer shadow-sm"
            >
              <option value="all">All Regions</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
`;

file = file.replace(
  /\{profile\.role !== "manager" && profile\.role !== "super_admin" && \(/,
  `${regionDropdown}\n          {profile.role !== "manager" && profile.role !== "super_admin" && (`
);

fs.writeFileSync('components/reports/ReportsView.tsx', file);
