const fs = require('fs');

const path = 'lib/i18n/dictionaries.ts';
let code = fs.readFileSync(path, 'utf8');

// en
code = code.replace(/refresh: 'Refresh', email: 'Email',\s*},/g, "refresh: 'Refresh', email: 'Email', or: 'OR', created: 'Created: ', published: 'Published', start_date: 'Start Date: ', },");
code = code.replace(/accountRejected: 'Your account access has been rejected\.',\s*},/g, "accountRejected: 'Your account access has been rejected.', selectRole: 'Select a role', },");
code = code.replace(/cta: 'CTA',\s*ra: 'RA',\s*},/g, "cta: 'CTA', ra: 'RA', staff: 'Staff', },");
code = code.replace(/rejected: 'Rejected',\s*},/g, "rejected: 'Rejected', published: 'Published', },");
code = code.replace(/reviewTeamHistory: 'Review Team History',\s*},/g, "reviewTeamHistory: 'Review Team History', productivityDiagnosis: 'Productivity Diagnosis', keepWorkingOn: 'Keep working on...', },");
code = code.replace(/subTasks: 'Sub-Tasks',\s*},/g, "subTasks: 'Sub-Tasks', noCategoriesAvailable: 'No categories available', },");
code = code.replace(/generateInsights: 'Generate AI Insights',\s*},/g, "generateInsights: 'Generate AI Insights', aiWeeklyInsights: 'AI Weekly Insights', timesheetReport: 'Timesheet Report', page: 'Page', resource: 'Resource', periodName: 'Period Name', date: 'Date', projectNum: 'Project No.', projectDesc: 'Project Description', taskNum: 'Task No.', taskDesc: 'Task Description', details: 'Details', status: 'Status', regularAmount: 'Regular Amount', total: 'TOTAL', allActivities: 'All Activities', filters: 'Filters', description: 'Description', aiInsightsSummary: 'AI Insights & Activity Summary', },");

// es
code = code.replace(/refresh: 'Actualizar', email: 'Correo',\s*},/g, "refresh: 'Actualizar', email: 'Correo', or: 'O', created: 'Creado: ', published: 'Publicado', start_date: 'Fecha de inicio: ', },");
code = code.replace(/accountRejected: 'El acceso a su cuenta ha sido rechazado\.',\s*},/g, "accountRejected: 'El acceso a su cuenta ha sido rechazado.', selectRole: 'Seleccione un rol', },");
code = code.replace(/rejected: 'Rechazado',\s*},/g, "rejected: 'Rechazado', published: 'Publicado', },");
code = code.replace(/reviewTeamHistory: 'Revisar Historial del Equipo',\s*},/g, "reviewTeamHistory: 'Revisar Historial del Equipo', productivityDiagnosis: 'Diagnóstico de Productividad', keepWorkingOn: 'Continuar trabajando en...', },");
code = code.replace(/subTasks: 'Subtareas',\s*},/g, "subTasks: 'Subtareas', noCategoriesAvailable: 'No hay categorías disponibles', },");
code = code.replace(/generateInsights: 'Generar Insights IA',\s*},/g, "generateInsights: 'Generar Insights IA', aiWeeklyInsights: 'Insights Semanales de IA', timesheetReport: 'Informe de hoja de horas', page: 'Página', resource: 'Recurso', periodName: 'Nombre periodo', date: 'Fecha', projectNum: 'Nº Proyecto', projectDesc: 'Descripción proyecto', taskNum: 'Nº de Tarea', taskDesc: 'Descripción de la tarea', details: 'Detalles', status: 'Estado', regularAmount: 'Cantidad regular', total: 'TOTAL', allActivities: 'Todas las actividades', filters: 'Filtros', description: 'Descripción', aiInsightsSummary: 'Resumen de Actividades e Insights de IA', },");

// pt
code = code.replace(/refresh: 'Atualizar', email: 'E-mail',\s*},/g, "refresh: 'Atualizar', email: 'E-mail', or: 'OU', created: 'Criado: ', published: 'Publicado', start_date: 'Data de início: ', },");
code = code.replace(/accountRejected: 'O acesso à sua conta foi rejeitado\.',\s*},/g, "accountRejected: 'O acesso à sua conta foi rejeitado.', selectRole: 'Selecione um cargo', },");
code = code.replace(/rejected: 'Rejeitado',\s*},/g, "rejected: 'Rejeitado', published: 'Publicado', },");
code = code.replace(/reviewTeamHistory: 'Revisar Histórico da Equipe',\s*},/g, "reviewTeamHistory: 'Revisar Histórico da Equipe', productivityDiagnosis: 'Diagnóstico de Produtividade', keepWorkingOn: 'Continuar trabalhando em...', },");
code = code.replace(/subTasks: 'Subtarefas',\s*},/g, "subTasks: 'Subtarefas', noCategoriesAvailable: 'Nenhuma categoria disponível', },");
code = code.replace(/generateInsights: 'Gerar Insights IA',\s*},/g, "generateInsights: 'Gerar Insights IA', aiWeeklyInsights: 'Insights Semanais de IA', timesheetReport: 'Relatório de quadro de horários', page: 'Página', resource: 'Recurso', periodName: 'Nome do período', date: 'Data', projectNum: 'Nº Projeto', projectDesc: 'Descrição do projeto', taskNum: 'Nº Tarefa', taskDesc: 'Descrição da tarefa', details: 'Detalhes', status: 'Status', regularAmount: 'Quantidade regular', total: 'TOTAL', allActivities: 'Todas as Atividades', filters: 'Filtros', description: 'Descrição', aiInsightsSummary: 'Resumo de Atividades e Insights de IA', },");

fs.writeFileSync(path, code);
