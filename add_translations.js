const fs = require('fs');

let content = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

content = content.replace(
  "noCategories: 'No categories configured. Please create one or run the database seed.' }",
  "noCategories: 'No categories configured. Please create one or run the database seed.', underConstruction: 'Under Construction', generalSettingsDesc: 'General settings are currently being developed. Check back soon for new configuration options.' }"
);

content = content.replace(
  "noCategories: 'No hay categorías configuradas. Por favor crea una o ejecuta el seed de la base de datos.' }",
  "noCategories: 'No hay categorías configuradas. Por favor crea una o ejecuta el seed de la base de datos.', underConstruction: 'En Construcción', generalSettingsDesc: 'Los ajustes generales están siendo desarrollados. Vuelve pronto para nuevas opciones de configuración.' }"
);

content = content.replace(
  "noCategories: 'Nenhuma categoria configurada. Por favor crie uma ou execute o seed do banco de dados.' }",
  "noCategories: 'Nenhuma categoria configurada. Por favor crie uma ou execute o seed do banco de dados.', underConstruction: 'Em Construção', generalSettingsDesc: 'As configurações gerais estão em desenvolvimento. Volte em breve para novas opções de configuração.' }"
);

fs.writeFileSync('lib/i18n/dictionaries.ts', content);

let typesContent = fs.readFileSync('lib/i18n/types.ts', 'utf8');
typesContent = typesContent.replace(
  "noCategories: string;",
  "noCategories: string;\n    underConstruction: string;\n    generalSettingsDesc: string;"
);
fs.writeFileSync('lib/i18n/types.ts', typesContent);
