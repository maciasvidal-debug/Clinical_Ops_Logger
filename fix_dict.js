const fs = require('fs');

// We have 3 exports en, es, pt. Let's do string replacement but carefully.
let code = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// For EN:
code = code.replace(/common: { loading: 'Loading\.\.\.',(.*?)email: 'Email', /g, "common: { loading: 'Loading...',\$1email: 'Email', or: 'OR', created: 'Created: ', published: 'Published', start_date: 'Start Date: ', ");

code = code.replace(/accountRejected: 'Your account access has been rejected\.', /g, "accountRejected: 'Your account access has been rejected.', selectRole: 'Select a role', ");

code = code.replace(/ra: 'RA',\s*},/g, "ra: 'RA',\n      staff: 'Staff', },");

code = code.replace(/rejected: 'Rejected',\s*},/g, "rejected: 'Rejected', published: 'Published', },");

code = code.replace(/reviewTeamHistory: 'Review Team History', /g, "reviewTeamHistory: 'Review Team History', productivityDiagnosis: 'Productivity Diagnosis', keepWorkingOn: 'Keep working on...', ");

code = code.replace(/subTasks: 'sub-tasks', /g, "subTasks: 'sub-tasks', noCategoriesAvailable: 'No categories available', ");

code = code.replace(/generateInsights: 'Generate AI Insights', /g, "generateInsights: 'Generate AI Insights', aiWeeklyInsights: 'AI Weekly Insights', timesheetReport: 'Timesheet Report', page: 'Page', resource: 'Resource', periodName: 'Period Name', date: 'Date', projectNum: 'Project No.', projectDesc: 'Project Description', taskNum: 'Task No.', taskDesc: 'Task Description', details: 'Details', status: 'Status', regularAmount: 'Regular Amount', total: 'TOTAL', allActivities: 'All Activities', filters: 'Filters', description: 'Description', aiInsightsSummary: 'AI Insights & Activity Summary', ");

// For ES:
code = code.replace(/common: { loading: 'Cargando\.\.\.',(.*?)email: 'Correo', /g, "common: { loading: 'Cargando...',\$1email: 'Correo', or: 'O', created: 'Creado: ', published: 'Publicado', start_date: 'Fecha de inicio: ', ");

code = code.replace(/accountRejected: 'El acceso a su cuenta ha sido rechazado\.', /g, "accountRejected: 'El acceso a su cuenta ha sido rechazado.', selectRole: 'Seleccione un rol', ");

code = code.replace(/reviewTeamHistory: 'Revisar Historial del Equipo', /g, "reviewTeamHistory: 'Revisar Historial del Equipo', productivityDiagnosis: 'Diagnóstico de Productividad', keepWorkingOn: 'Continuar trabajando en...', ");

code = code.replace(/subTasks: 'subtareas', /g, "subTasks: 'subtareas', noCategoriesAvailable: 'No hay categorías disponibles', ");

code = code.replace(/generateInsights: 'Generar Insights IA', /g, "generateInsights: 'Generar Insights IA', aiWeeklyInsights: 'Insights Semanales de IA', timesheetReport: 'Informe de hoja de horas', page: 'Página', resource: 'Recurso', periodName: 'Nombre periodo', date: 'Fecha', projectNum: 'Nº Proyecto', projectDesc: 'Descripción proyecto', taskNum: 'Nº de Tarea', taskDesc: 'Descripción de la tarea', details: 'Detalles', status: 'Estado', regularAmount: 'Cantidad regular', total: 'TOTAL', allActivities: 'Todas las actividades', filters: 'Filtros', description: 'Descripción', aiInsightsSummary: 'Resumen de Actividades e Insights de IA', ");

// For PT:
code = code.replace(/common: { loading: 'Carregando\.\.\.',(.*?)email: 'E-mail', /g, "common: { loading: 'Carregando...',\$1email: 'E-mail', or: 'OU', created: 'Criado: ', published: 'Publicado', start_date: 'Data de início: ', ");

code = code.replace(/accountRejected: 'Sua solicitação de conta foi rejeitada\. Por favor contate o administrador\.', /g, "accountRejected: 'Sua solicitação de conta foi rejeitada. Por favor contate o administrador.', selectRole: 'Selecione um cargo', ");

code = code.replace(/reviewTeamHistory: 'Revisar Histórico da Equipe', /g, "reviewTeamHistory: 'Revisar Histórico da Equipe', productivityDiagnosis: 'Diagnóstico de Produtividade', keepWorkingOn: 'Continuar trabalhando em...', ");

code = code.replace(/subTasks: 'sub-tarefas', /g, "subTasks: 'sub-tarefas', noCategoriesAvailable: 'Nenhuma categoria disponível', ");

code = code.replace(/generateInsights: 'Gerar Insights com IA', /g, "generateInsights: 'Gerar Insights com IA', aiWeeklyInsights: 'Insights Semanais de IA', timesheetReport: 'Relatório de quadro de horários', page: 'Página', resource: 'Recurso', periodName: 'Nome do período', date: 'Data', projectNum: 'Nº Projeto', projectDesc: 'Descrição do projeto', taskNum: 'Nº Tarefa', taskDesc: 'Descrição da tarefa', details: 'Detalhes', status: 'Status', regularAmount: 'Quantidade regular', total: 'TOTAL', allActivities: 'Todas as Atividades', filters: 'Filtros', description: 'Descrição', aiInsightsSummary: 'Resumo de Atividades e Insights de IA', ");


fs.writeFileSync('lib/i18n/dictionaries.ts', code);
