const fs = require('fs');
let file = fs.readFileSync('components/reports/ReportsView.tsx', 'utf8');

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

if (!file.includes("Region Filter")) {
  file = file.replace(
    /        <div className="flex flex-col md:flex-row gap-4 items-end">/,
    `        <div className="flex flex-col md:flex-row gap-4 items-end">\n${regionDropdown}`
  );
}

fs.writeFileSync('components/reports/ReportsView.tsx', file);
