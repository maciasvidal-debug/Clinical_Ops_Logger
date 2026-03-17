const fs = require('fs');

let d = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// The replace logic I used earlier duplicated settings in EN because of the `g` flag or how I matched.
// Let's just fix it by removing the duplicate ES settings inside the EN object.

d = d.replace(`  settings: { title: 'System Settings', subtitle: 'Manage categories, activities, and preferences.', activitiesAndRoles: 'Activities & Roles', generalSettings: 'General Settings', activityCategories: 'Activity Categories', newCategory: 'New Category', addRole: 'Add Role', addSubTask: 'Add Sub-task', newTask: 'New Task', noCategories: 'No categories configured. Please create one or run the database seed.' },
  settings: { title: 'Configuración del Sistema', subtitle: 'Administra las categorías, actividades y preferencias.', activitiesAndRoles: 'Actividades & Roles', generalSettings: 'Ajustes Generales', activityCategories: 'Categorías de Actividades', newCategory: 'Nueva Categoría', addRole: 'Agregar Rol', addSubTask: 'Agregar Sub-tarea', newTask: 'Nueva Tarea', noCategories: 'No hay categorías configuradas. Por favor, crea una o corre el seed de base de datos.' },`,
  `  settings: { title: 'System Settings', subtitle: 'Manage categories, activities, and preferences.', activitiesAndRoles: 'Activities & Roles', generalSettings: 'General Settings', activityCategories: 'Activity Categories', newCategory: 'New Category', addRole: 'Add Role', addSubTask: 'Add Sub-task', newTask: 'New Task', noCategories: 'No categories configured. Please create one or run the database seed.' },`);

fs.writeFileSync('lib/i18n/dictionaries.ts', d);
