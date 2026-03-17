const fs = require('fs');
let d = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// I need to properly format dictionaries.ts to avoid duplicating keys or misplacing them.
d = d.replace(/export const pt: Dictionary = \{([\s\S]*?)settings: \{ title: 'Configuración del Sistema', subtitle: 'Administra las categorías, actividades y preferencias\.', activitiesAndRoles: 'Actividades & Roles', generalSettings: 'Ajustes Generales', activityCategories: 'Categorías de Actividades', newCategory: 'Nueva Categoría', addRole: 'Agregar Rol', addSubTask: 'Agregar Sub-tarea', newTask: 'Nueva Tarea', noCategories: 'No hay categorías configuradas\. Por favor, crea una o corre el seed de base de datos\.' \},/g,
"export const pt: Dictionary = {$1settings: { title: 'Configurações do Sistema', subtitle: 'Gerencie categorias, atividades e preferências.', activitiesAndRoles: 'Atividades e Funções', generalSettings: 'Configurações Gerais', activityCategories: 'Categorias de Atividades', newCategory: 'Nova Categoria', addRole: 'Adicionar Função', addSubTask: 'Adicionar Sub-tarefa', newTask: 'Nova Tarefa', noCategories: 'Nenhuma categoria configurada. Crie uma ou execute o seed do banco de dados.' },");

fs.writeFileSync('lib/i18n/dictionaries.ts', d);

let t = fs.readFileSync('lib/i18n/types.ts', 'utf8');
t = t.replace(/legal: \{/g, "settings: {\n    title: string;\n    subtitle: string;\n    activitiesAndRoles: string;\n    generalSettings: string;\n    activityCategories: string;\n    newCategory: string;\n    addRole: string;\n    addSubTask: string;\n    newTask: string;\n    noCategories: string;\n  };\n  legal: {");
fs.writeFileSync('lib/i18n/types.ts', t);
