const fs = require('fs');
let content = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');

const emptyState = `
      {activeTab === "general" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">
            Under Construction
          </h3>
          <p className="text-neutral-500 max-w-md">
            General settings are currently being developed. Check back soon for new configuration options.
          </p>
        </div>
      )}
`;

content = content.replace(
  'import { Plus, Trash2, Edit2, Shield, Settings, ChevronRight } from "lucide-react";',
  'import { Plus, Trash2, Edit2, Shield, Settings, ChevronRight, Wrench } from "lucide-react";'
);

const activitiesTabEndIndex = content.lastIndexOf('</div>\n      )}');
const newContent = content.slice(0, activitiesTabEndIndex + 15) + emptyState + content.slice(activitiesTabEndIndex + 15);

fs.writeFileSync('components/settings/SettingsView.tsx', newContent);
