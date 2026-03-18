const fs = require('fs');

let code = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

code = code.replace(/refresh: 'Refresh', email: 'Email',/g, "refresh: 'Refresh', email: 'Email', or: 'OR', created: 'Created: ', published: 'Published', start_date: 'Start Date: ',");
code = code.replace(/refresh: 'Actualizar', email: 'Correo',/g, "refresh: 'Actualizar', email: 'Correo', or: 'O', created: 'Creado: ', published: 'Publicado', start_date: 'Fecha de inicio: ',");
code = code.replace(/refresh: 'Atualizar', email: 'E-mail',/g, "refresh: 'Atualizar', email: 'E-mail', or: 'OU', created: 'Criado: ', published: 'Publicado', start_date: 'Data de início: ',");

code = code.replace(/accountRejected: 'Your account access has been rejected\.'/g, "accountRejected: 'Your account access has been rejected.', selectRole: 'Select a role',");
code = code.replace(/accountRejected: 'El acceso a su cuenta ha sido rechazado\.'/g, "accountRejected: 'El acceso a su cuenta ha sido rechazado.', selectRole: 'Seleccione un rol',");
code = code.replace(/accountRejected: 'O acesso à sua conta foi rejeitado\.'/g, "accountRejected: 'O acesso à sua conta foi rejeitado.', selectRole: 'Selecione um cargo',");

code = code.replace(/cta: 'CTA',\s*ra: 'RA',/g, "cta: 'CTA',\n      ra: 'RA',\n      staff: 'Staff',");

code = code.replace(/reviewTeamHistory: 'Review Team History',/g, "reviewTeamHistory: 'Review Team History', productivityDiagnosis: 'Productivity Diagnosis', keepWorkingOn: 'Keep working on...',");
code = code.replace(/reviewTeamHistory: 'Revisar Historial del Equipo',/g, "reviewTeamHistory: 'Revisar Historial del Equipo', productivityDiagnosis: 'Diagnóstico de Productividad', keepWorkingOn: 'Continuar trabajando en...',");
code = code.replace(/reviewTeamHistory: 'Revisar Histórico da Equipe',/g, "reviewTeamHistory: 'Revisar Histórico da Equipe', productivityDiagnosis: 'Diagnóstico de Produtividade', keepWorkingOn: 'Continuar trabalhando em...',");

code = code.replace(/subTasks: 'Sub-Tasks',/g, "subTasks: 'Sub-Tasks', noCategoriesAvailable: 'No categories available',");
code = code.replace(/subTasks: 'Subtareas',/g, "subTasks: 'Subtareas', noCategoriesAvailable: 'No hay categorías disponibles',");
code = code.replace(/subTasks: 'Subtarefas',/g, "subTasks: 'Subtarefas', noCategoriesAvailable: 'Nenhuma categoria disponível',");

code = code.replace(/generateInsights: 'Generate AI Insights',/g, "generateInsights: 'Generate AI Insights',\n      aiWeeklyInsights: 'AI Weekly Insights',\n      timesheetReport: 'Timesheet Report',\n      page: 'Page',\n      resource: 'Resource',\n      periodName: 'Period Name',\n      date: 'Date',\n      projectNum: 'Project No.',\n      projectDesc: 'Project Description',\n      taskNum: 'Task No.',\n      taskDesc: 'Task Description',\n      details: 'Details',\n      status: 'Status',\n      regularAmount: 'Regular Amount',\n      total: 'TOTAL',\n      allActivities: 'All Activities',\n      filters: 'Filters',\n      description: 'Description',\n      aiInsightsSummary: 'AI Insights & Activity Summary',");

code = code.replace(/generateInsights: 'Generar Insights IA',/g, "generateInsights: 'Generar Insights IA',\n      aiWeeklyInsights: 'Insights Semanales de IA',\n      timesheetReport: 'Informe de hoja de horas',\n      page: 'Página',\n      resource: 'Recurso',\n      periodName: 'Nombre periodo',\n      date: 'Fecha',\n      projectNum: 'Nº Proyecto',\n      projectDesc: 'Descripción proyecto',\n      taskNum: 'Nº de Tarea',\n      taskDesc: 'Descripción de la tarea',\n      details: 'Detalles',\n      status: 'Estado',\n      regularAmount: 'Cantidad regular',\n      total: 'TOTAL',\n      allActivities: 'Todas las actividades',\n      filters: 'Filtros',\n      description: 'Descripción',\n      aiInsightsSummary: 'Resumen de Actividades e Insights de IA',");

code = code.replace(/generateInsights: 'Gerar Insights IA',/g, "generateInsights: 'Gerar Insights IA',\n      aiWeeklyInsights: 'Insights Semanais de IA',\n      timesheetReport: 'Relatório de quadro de horários',\n      page: 'Página',\n      resource: 'Recurso',\n      periodName: 'Nome do período',\n      date: 'Data',\n      projectNum: 'Nº Projeto',\n      projectDesc: 'Descrição do projeto',\n      taskNum: 'Nº Tarefa',\n      taskDesc: 'Descrição da tarefa',\n      details: 'Detalhes',\n      status: 'Status',\n      regularAmount: 'Quantidade regular',\n      total: 'TOTAL',\n      allActivities: 'Todas as Atividades',\n      filters: 'Filtros',\n      description: 'Descrição',\n      aiInsightsSummary: 'Resumo de Atividades e Insights de IA',");

fs.writeFileSync('lib/i18n/dictionaries.ts', code);
