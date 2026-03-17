const fs = require('fs');
let s = fs.readFileSync('components/settings/SettingsView.tsx', 'utf8');

// Replace settings view strings
s = s.replace(/Configuración del Sistema/g, '{t.settings.title}');
s = s.replace(/Administra las categorías, actividades y preferencias./g, '{t.settings.subtitle}');
s = s.replace(/Actividades & Roles/g, '{t.settings.activitiesAndRoles}');
s = s.replace(/Ajustes Generales/g, '{t.settings.generalSettings}');
s = s.replace(/Categorías de Actividades/g, '{t.settings.activityCategories}');
s = s.replace(/Nueva Categoría/g, '{t.settings.newCategory}');
s = s.replace(/Add Role/g, '{t.settings.addRole}');
s = s.replace(/Edit/g, '{t.common.edit}');
s = s.replace(/Add Sub-task/g, '{t.settings.addSubTask}');
s = s.replace(/Nueva Tarea/g, '{t.settings.newTask}');
s = s.replace(/No hay categorías configuradas. Por favor, crea una o corre el seed de base de datos./g, '{t.settings.noCategories}');
s = s.replace(/No tienes permisos para ver esta sección./g, '{t.auth.accessDenied}');

fs.writeFileSync('components/settings/SettingsView.tsx', s);

let d = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// en
d = d.replace(/legal: \{/, "settings: { title: 'System Settings', subtitle: 'Manage categories, activities, and preferences.', activitiesAndRoles: 'Activities & Roles', generalSettings: 'General Settings', activityCategories: 'Activity Categories', newCategory: 'New Category', addRole: 'Add Role', addSubTask: 'Add Sub-task', newTask: 'New Task', noCategories: 'No categories configured. Please create one or run the database seed.' },\n  legal: {");

// es
d = d.replace(/legal: \{/g, "settings: { title: 'Configuración del Sistema', subtitle: 'Administra las categorías, actividades y preferencias.', activitiesAndRoles: 'Actividades & Roles', generalSettings: 'Ajustes Generales', activityCategories: 'Categorías de Actividades', newCategory: 'Nueva Categoría', addRole: 'Agregar Rol', addSubTask: 'Agregar Sub-tarea', newTask: 'Nueva Tarea', noCategories: 'No hay categorías configuradas. Por favor, crea una o corre el seed de base de datos.' },\n  legal: {");

// pt (wait, the global replace just replaced it in ES and PT too! Let's check the result)
fs.writeFileSync('lib/i18n/dictionaries.ts', d);
