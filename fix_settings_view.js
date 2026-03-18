const fs = require('fs');
let content = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');

content = content.replace(
  'import { Plus, Trash2, Edit2, Shield, Settings, ChevronRight, Wrench } from "lucide-react";',
  'import { Plus, Trash2, Edit2, Shield, Settings, ChevronRight, Wrench } from "lucide-react";\nimport { useTranslation } from "@/lib/i18n";'
);

// We need to replace the text in the empty state
content = content.replace(
  'Under Construction',
  '{t.settings.underConstruction}'
);

content = content.replace(
  'General settings are currently being developed. Check back soon for new configuration options.',
  '{t.settings.generalSettingsDesc}'
);

fs.writeFileSync('components/settings/SettingsView.tsx', content);
