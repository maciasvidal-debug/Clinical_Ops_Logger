export type Language = 'en' | 'es' | 'pt';

export interface Dictionary {
  common: {
    loading: string; save: string; cancel: string; delete: string; edit: string; close: string; success: string; error: string; yes: string; no: string; confirm: string;
  };
  navigation: { dashboard: string; log: string; history: string; reports: string; team: string; };
  auth: { signIn: string; signUp: string; createAccount: string; haveAccount: string; noAccount: string; firstName: string; lastName: string; roleTitle: string; termsPrefix: string; termsLink: string; termsAnd: string; privacyLink: string; signOut: string; email: string; password: string; accessDenied: string; pendingApproval: string; contactAdmin: string; };
  roles: { manager: string; cra: string; lead: string; super_admin: string; };
  status: { active: string; pending: string; rejected: string; };
  dashboard: { overview: string; todayLogs: string; thisWeekLogs: string; openQueries: string; actions: string; logNewActivity: string; viewHistory: string; quickLog: string; repeatRecent: string; activityDistribution: string; recentEntries: string; viewAll: string; noRecentEntries: string; time: string; entries: string; };
  shell: { appName: string; appSubtitle: string; smartTimer: string; stopLog: string; notifications: string; markAllRead: string; clearAll: string; noNotifications: string; };
  logForm: { title: string; subtitle: string; aiSmartLogging: string; aiDescription: string; aiPlaceholder: string; aiButton: string; date: string; duration: string; project: string; protocol: string; siteOptional: string; category: string; specificActivity: string; task: string; notesOptional: string; notesPlaceholder: string; submit: string; selectProject: string; selectProtocol: string; selectSite: string; hours: string; minutes: string; aiSuccess: string; aiError: string; };
  history: { title: string; subtitle: string; searchPlaceholder: string; allProjects: string; allProtocols: string; date: string; duration: string; project: string; category: string; activity: string; noLogs: string; openQuery: string; askQuestion: string; question: string; reply: string; yourReply: string; sendReply: string; };
  reports: { title: string; subtitle: string; timeByProject: string; timeByCategory: string; noData: string; export: string; };
  team: { title: string; subtitle: string; users: string; projects: string; protocols: string; name: string; role: string; status: string; actions: string; approve: string; reject: string; };
  legal: { termsTitle: string; privacyTitle: string; termsContent: string; privacyContent: string; };
}
