const fs = require('fs');
let content = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

content = content.replace(
  "noCategories: 'No hay categorías configuradas. Por favor, crea una o corre el seed de base de datos.' }",
  "noCategories: 'No hay categorías configuradas. Por favor, crea una o corre el seed de base de datos.', underConstruction: 'En Construcción', generalSettingsDesc: 'Los ajustes generales están siendo desarrollados. Vuelve pronto para nuevas opciones de configuración.' }"
);

content = content.replace(
  "noCategories: 'Nenhuma categoria configurada. Crie uma ou execute o seed do banco de dados.' }",
  "noCategories: 'Nenhuma categoria configurada. Crie uma ou execute o seed do banco de dados.', underConstruction: 'Em Construção', generalSettingsDesc: 'As configurações gerais estão em desenvolvimento. Volte em breve para novas opções de configuração.' }"
);

fs.writeFileSync('lib/i18n/dictionaries.ts', content);
