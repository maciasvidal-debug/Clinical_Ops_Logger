const fs = require('fs');

let file = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');

// Update imports
file = file.replace(
  /import \{ DeleteAccountModal \} from "\.\/DeleteAccountModal";/,
  'import { DeleteAccountModal } from "./DeleteAccountModal";\nimport { StructureWizard } from "./StructureWizard";\nimport { Building } from "lucide-react";'
);

// Add Structure Tab button
const structureTabButton = `
        {(profile.role === "super_admin") && (
          <button
            onClick={() => setActiveTab("structure")}
            className={\`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors \${
              activeTab === "structure"
                ? "bg-white text-indigo-600 border-t-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700 bg-gray-50/50"
            }\`}
          >
            <Building size={16} />
            Structure
          </button>
        )}
`;

// Update activeTab Type
file = file.replace(
  /const \[activeTab, setActiveTab\] = useState<"activities" \| "general" \| "regions">/,
  'const [activeTab, setActiveTab] = useState<"activities" | "general" | "regions" | "structure">'
);

// Inject Tab button before the first tab
file = file.replace(
  /        \{\(activeTab === "activities" && \(profile\.role === "super_admin" \|\| profile\.role === "manager"\)\) && \(/,
  `        {/* TABS HEADER */}\n        <div className="flex border-b border-gray-200 mb-6">\n          ${structureTabButton}\n`
);

// Correct the layout of the tabs header, finding the actual tab rendering
// The current code has the tabs hardcoded, we need to inject the button in the right place
file = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');

file = file.replace(
  /          <button\n            onClick=\{\(\) => setActiveTab\("activities"\)\}/,
  `${structureTabButton}\n          <button\n            onClick={() => setActiveTab("activities")}`
);

const structureSection = `
        {activeTab === "structure" && profile.role === "super_admin" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Structure Management</h3>
              <p className="text-gray-500">Create new Projects, Protocols, and Sites using the Wizard.</p>
            </div>
            <StructureWizard onComplete={() => setActiveTab("structure")} />
          </div>
        )}
`;

file = file.replace(
  /        \{\(activeTab === "general" \|\| \(activeTab === "activities" && profile\.role !== "super_admin" && profile\.role !== "manager"\)\) && \(/,
  `${structureSection}\n        {(activeTab === "general" || (activeTab === "activities" && profile.role !== "super_admin" && profile.role !== "manager")) && (`
);

fs.writeFileSync('components/settings/SettingsView.tsx', file);
