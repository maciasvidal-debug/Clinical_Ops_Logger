const fs = require('fs');

const data = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');
const lines = data.split('\n');

for (let i = 0; i < lines.length; i++) {
  // common
  if (lines[i].includes("refresh: 'Refresh', email: 'Email',") && lines[i].includes("}")) {
    lines[i] = lines[i].replace("email: 'Email',", "email: 'Email', or: 'OR', created: 'Created: ', published: 'Published', start_date: 'Start Date: ',");
  }
  if (lines[i].includes("refresh: 'Actualizar', email: 'Correo',") && lines[i].includes("}")) {
    lines[i] = lines[i].replace("email: 'Correo',", "email: 'Correo', or: 'O', created: 'Creado: ', published: 'Publicado', start_date: 'Fecha de inicio: ',");
  }
  if (lines[i].includes("refresh: 'Atualizar', email: 'E-mail',") && lines[i].includes("}")) {
    lines[i] = lines[i].replace("email: 'E-mail',", "email: 'E-mail', or: 'OU', created: 'Criado: ', published: 'Publicado', start_date: 'Data de início: ',");
  }

  // auth
  if (lines[i].includes("accountRejected: 'Your account access has been rejected.'")) {
    lines[i] = lines[i].replace("accountRejected: 'Your account access has been rejected.',", "accountRejected: 'Your account access has been rejected.', selectRole: 'Select a role',");
  }
  if (lines[i].includes("accountRejected: 'El acceso a su cuenta ha sido rechazado.'")) {
    lines[i] = lines[i].replace("accountRejected: 'El acceso a su cuenta ha sido rechazado.',", "accountRejected: 'El acceso a su cuenta ha sido rechazado.', selectRole: 'Seleccione un rol',");
  }
  if (lines[i].includes("accountRejected: 'O acesso à sua conta foi rejeitado.'")) {
    lines[i] = lines[i].replace("accountRejected: 'O acesso à sua conta foi rejeitado.',", "accountRejected: 'O acesso à sua conta foi rejeitado.', selectRole: 'Selecione um cargo',");
  }

  // roles
  if (lines[i].includes("cta: 'CTA', ra: 'RA', }")) {
    lines[i] = lines[i].replace("ra: 'RA', }", "ra: 'RA', staff: 'Staff', }");
  }

  // status
  if (lines[i].includes("rejected: 'Rejected', }")) {
    lines[i] = lines[i].replace("rejected: 'Rejected', }", "rejected: 'Rejected', published: 'Published', }");
  }
  if (lines[i].includes("rejected: 'Rechazado', }")) {
    lines[i] = lines[i].replace("rejected: 'Rechazado', }", "rejected: 'Rechazado', published: 'Publicado', }");
  }
  if (lines[i].includes("rejected: 'Rejeitado', }")) {
    lines[i] = lines[i].replace("rejected: 'Rejeitado', }", "rejected: 'Rejeitado', published: 'Publicado', }");
  }

  // dashboard
  if (lines[i].includes("reviewTeamHistory: 'Review Team History', }")) {
    lines[i] = lines[i].replace("reviewTeamHistory: 'Review Team History', }", "reviewTeamHistory: 'Review Team History', productivityDiagnosis: 'Productivity Diagnosis', keepWorkingOn: 'Keep working on...', }");
  }
  if (lines[i].includes("reviewTeamHistory: 'Revisar Historial del Equipo', }")) {
    lines[i] = lines[i].replace("reviewTeamHistory: 'Revisar Historial del Equipo', }", "reviewTeamHistory: 'Revisar Historial del Equipo', productivityDiagnosis: 'Diagnóstico de Productividad', keepWorkingOn: 'Continuar trabajando en...', }");
  }
  if (lines[i].includes("reviewTeamHistory: 'Revisar Histórico da Equipe', }")) {
    lines[i] = lines[i].replace("reviewTeamHistory: 'Revisar Histórico da Equipe', }", "reviewTeamHistory: 'Revisar Histórico da Equipe', productivityDiagnosis: 'Diagnóstico de Produtividade', keepWorkingOn: 'Continuar trabalhando em...', }");
  }

  // logForm
  if (lines[i].includes("subTasks: 'Sub-Tasks', }")) {
    lines[i] = lines[i].replace("subTasks: 'Sub-Tasks', }", "subTasks: 'Sub-Tasks', noCategoriesAvailable: 'No categories available', }");
  }
  if (lines[i].includes("subTasks: 'Subtareas', }")) {
    lines[i] = lines[i].replace("subTasks: 'Subtareas', }", "subTasks: 'Subtareas', noCategoriesAvailable: 'No hay categorías disponibles', }");
  }
  if (lines[i].includes("subTasks: 'Subtarefas', }")) {
    lines[i] = lines[i].replace("subTasks: 'Subtarefas', }", "subTasks: 'Subtarefas', noCategoriesAvailable: 'Nenhuma categoria disponível', }");
  }

  // reports
  if (lines[i].includes("generateInsights: 'Generate AI Insights', }")) {
    lines[i] = lines[i].replace("generateInsights: 'Generate AI Insights', }", "generateInsights: 'Generate AI Insights', aiWeeklyInsights: 'AI Weekly Insights', timesheetReport: 'Timesheet Report', page: 'Page', resource: 'Resource', periodName: 'Period Name', date: 'Date', projectNum: 'Project No.', projectDesc: 'Project Description', taskNum: 'Task No.', taskDesc: 'Task Description', details: 'Details', status: 'Status', regularAmount: 'Regular Amount', total: 'TOTAL', allActivities: 'All Activities', filters: 'Filters', description: 'Description', aiInsightsSummary: 'AI Insights & Activity Summary', }");
  }
  if (lines[i].includes("generateInsights: 'Generar Insights IA', }")) {
    lines[i] = lines[i].replace("generateInsights: 'Generar Insights IA', }", "generateInsights: 'Generar Insights IA', aiWeeklyInsights: 'Insights Semanales de IA', timesheetReport: 'Informe de hoja de horas', page: 'Página', resource: 'Recurso', periodName: 'Nombre periodo', date: 'Fecha', projectNum: 'Nº Proyecto', projectDesc: 'Descripción proyecto', taskNum: 'Nº de Tarea', taskDesc: 'Descripción de la tarea', details: 'Detalles', status: 'Estado', regularAmount: 'Cantidad regular', total: 'TOTAL', allActivities: 'Todas las actividades', filters: 'Filtros', description: 'Descripción', aiInsightsSummary: 'Resumen de Actividades e Insights de IA', }");
  }
  if (lines[i].includes("generateInsights: 'Gerar Insights IA', }")) {
    lines[i] = lines[i].replace("generateInsights: 'Gerar Insights IA', }", "generateInsights: 'Gerar Insights IA', aiWeeklyInsights: 'Insights Semanais de IA', timesheetReport: 'Relatório de quadro de horários', page: 'Página', resource: 'Recurso', periodName: 'Nome do período', date: 'Data', projectNum: 'Nº Projeto', projectDesc: 'Descrição do projeto', taskNum: 'Nº Tarefa', taskDesc: 'Descrição da tarefa', details: 'Detalhes', status: 'Status', regularAmount: 'Quantidade regular', total: 'TOTAL', allActivities: 'Todas as Atividades', filters: 'Filtros', description: 'Descrição', aiInsightsSummary: 'Resumo de Atividades e Insights de IA', }");
  }
}

fs.writeFileSync('lib/i18n/dictionaries.ts', lines.join('\n'));
