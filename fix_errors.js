const fs = require('fs');

// 1. Fix Wrench import in SettingsView.tsx
let settingsContent = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');
settingsContent = settingsContent.replace(
  'import { Plus, Trash2, Edit2, Shield, Settings, ChevronRight, Wrench } from "lucide-react";\nimport { useTranslation } from "@/lib/i18n";',
  'import { Plus, Trash2, Edit2, Shield, Settings, ChevronRight, Wrench } from "lucide-react";\nimport { useTranslation } from "@/lib/i18n";'
);
// It seems the import was added to the wrong line in a previous step, let's fix the imports properly
settingsContent = settingsContent.replace(
  /import { Plus, Trash2, Edit2, Shield, Settings, ChevronRight } from "lucide-react";/g,
  'import { Plus, Trash2, Edit2, Shield, Settings, ChevronRight, Wrench } from "lucide-react";'
);
fs.writeFileSync('components/settings/SettingsView.tsx', settingsContent);

// 2. Fix missing translations in dictionaries.ts
let dictContent = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');
dictContent = dictContent.replace(
  /noCategories: 'No hay categorías configuradas. Por favor crea una o ejecuta el seed de la base de datos.' }/g,
  "noCategories: 'No hay categorías configuradas. Por favor crea una o ejecuta el seed de la base de datos.', underConstruction: 'En Construcción', generalSettingsDesc: 'Los ajustes generales están siendo desarrollados. Vuelve pronto para nuevas opciones de configuración.' }"
);
dictContent = dictContent.replace(
  /noCategories: 'Nenhuma categoria configurada. Por favor crie uma ou execute o seed do banco de dados.' }/g,
  "noCategories: 'Nenhuma categoria configurada. Por favor crie uma ou execute o seed do banco de dados.', underConstruction: 'Em Construção', generalSettingsDesc: 'As configurações gerais estão em desenvolvimento. Volte em breve para novas opções de configuração.' }"
);
fs.writeFileSync('lib/i18n/dictionaries.ts', dictContent);

// 3. Fix the favicon (delete app/favicon.ico as next uses metadata, and we'll let it use the svg or default)
if (fs.existsSync('app/favicon.ico')) {
    fs.unlinkSync('app/favicon.ico');
}
