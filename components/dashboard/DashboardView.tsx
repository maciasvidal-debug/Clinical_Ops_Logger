import { updateLogEntryStatus, saveTodo, getPriorityAlignment, generatePriorityInsight } from "@/lib/actions";
import { useAppStore } from "@/lib/store";
import React, { useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { useDynamicTranslation } from "@/lib/i18n/utils";
import {
  LogEntry,
  UserProfile,
  Project,
  Protocol,
  Todo
} from "@/lib/types";
import {
  format,
  subDays,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import {
  Clock,
  Activity,
  CheckCircle2,
  MessageSquare,
  Copy,
  BarChart3,
  PieChart,
  ListTodo
} from "lucide-react";

interface DashboardViewProps {
  logs: LogEntry[];
  onNavigate: (view: "log" | "history") => void;
  profile: UserProfile | null;
  onRepeatLog?: (log: LogEntry) => void;
}

export function DashboardView({
  logs,
  onNavigate,
  profile,
  onRepeatLog,
}: DashboardViewProps) {
  const { t, language } = useTranslation();
  const { dt } = useDynamicTranslation();
  const { todos, updateTodo } = useAppStore();

  const pendingTodos = React.useMemo(() => {
    return todos.filter((t: Todo) => t.status === "pending" && t.user_id === profile?.id);
  }, [todos, profile?.id]);

  const todayString = new Date().toDateString();

  const { todayLogs, todayMinutes, thisWeekLogs, thisWeekMinutes } = React.useMemo(() => {
    const today = new Date(todayString);
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const tLogs: LogEntry[] = [];
    const wLogs: LogEntry[] = [];
    let tMinutes = 0;
    let wMinutes = 0;

    for (const log of logs) {
      const logDate = new Date(log.date);

      if (logDate >= sevenDaysAgo) {
        wLogs.push(log);
        wMinutes += log.duration_minutes;

        if (
          logDate.getDate() === today.getDate() &&
          logDate.getMonth() === today.getMonth() &&
          logDate.getFullYear() === today.getFullYear()
        ) {
          tLogs.push(log);
          tMinutes += log.duration_minutes;
        }
      }
    }

    return {
      todayLogs: tLogs,
      todayMinutes: tMinutes,
      thisWeekLogs: wLogs,
      thisWeekMinutes: wMinutes,
    };
  }, [logs, todayString]);


  const [priorityInsight, setPriorityInsight] = React.useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = React.useState(false);

  React.useEffect(() => {
    const fetchInsight = async () => {
      if (profile?.id) {
        setLoadingInsight(true);
        const stats = await getPriorityAlignment();
        if (stats.success && stats.data) {
          const insight = await generatePriorityInsight(stats.data, language);
          if (insight.success && insight.data) {
            setPriorityInsight(insight.data);
          }
        }
        setLoadingInsight(false);
      }
    };
    fetchInsight();

  }, [profile?.id, language]);

  const openQueriesCount = useMemo(() => {
    return logs.reduce(
      (acc, log) =>
        acc + (log.log_queries?.filter((q) => q.status === "OPEN").length || 0),
      0,
    );
  }, [logs]);

  // Deeper Metrics
  const isManager = profile?.role === "manager" || profile?.role === "super_admin";

  const currentWeekLogs = useMemo(() => {
    const today = new Date(todayString);
    return logs.filter((log) => {
      const logDate = parseISO(log.date);
      return isWithinInterval(logDate, {
        start: startOfWeek(today),
        end: endOfWeek(today),
      });
    });
  }, [logs, todayString]);

  const categoryDistribution = useMemo(() => {
    const dist = new Map<string, number>();
    for (let i = 0; i < currentWeekLogs.length; i++) {
      const log = currentWeekLogs[i];
      if (log.category) {
        dist.set(log.category, (dist.get(log.category) || 0) + log.duration_minutes);
      }
    }
    return Array.from(dist.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [currentWeekLogs]);

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{t.navigation.dashboard}</h2>
        <p className="text-neutral-500">{t.dashboard.overview}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-neutral-600">
              {t.dashboard.todayLogs}
            </h3>
          </div>
          <p className="text-3xl font-light tracking-tight text-neutral-900">
            {formatHours(todayMinutes)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {todayLogs.length} {t.dashboard.entries}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-neutral-600">{t.dashboard.thisWeekLogs}</h3>
          </div>
          <p className="text-3xl font-light tracking-tight text-neutral-900">
            {formatHours(thisWeekMinutes)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {thisWeekLogs.length} {t.dashboard.entries}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-center items-center text-center">
          {openQueriesCount > 0 && (
            <div
              className="w-full mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => onNavigate("history")}
            >
              <div className="flex items-center gap-2 text-amber-800">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">{t.dashboard.openQueries}</span>
              </div>
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {openQueriesCount}
              </span>
            </div>
          )}
          
          <div className="w-full space-y-3">
            <button
              onClick={() => onNavigate("log")}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 animate-breathe flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Activity className="w-5 h-5" />
              {t.dashboard.logNewActivity}
            </button>
            <button
              onClick={() => onNavigate("history")}
              className="w-full py-3.5 text-indigo-600 hover:bg-indigo-50 rounded-2xl font-semibold transition-all duration-200 border border-transparent hover:border-indigo-100 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {t.dashboard.viewHistory}
            </button>
            
            {isManager && (
              <div className="pt-5 mt-5 border-t border-neutral-100 w-full flex flex-col items-center">
                <p className="text-[10px] text-neutral-400 mb-3 uppercase tracking-[0.2em] font-bold">
                  {t.dashboard.teamManagement}
                </p>
                <button
                  onClick={() => onNavigate("history")}
                  className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  {t.dashboard.reviewTeamHistory}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deeper Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-200/50 bg-white/40 backdrop-blur-sm rounded-t-2xl flex items-center gap-2">
            <PieChart className="w-5 h-5 text-neutral-500" />
            <h3 className="font-bold font-heading text-neutral-900 tracking-tight">
              {t.reports.timeByCategory}
            </h3>
          </div>
          <div className="p-6 flex-1">
            {categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                {categoryDistribution.map(([name, mins]) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-neutral-700">
                        {dt(name)}
                      </span>
                      <span className="text-neutral-500">
                        {formatHours(mins)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (mins / thisWeekMinutes) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">
                {t.dashboard.noDataThisWeek}
              </p>
            )}
          </div>
        </div>


      {/* Pending To-Dos Widget */}

      {priorityInsight && (
        <div className="glass-panel p-6 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border-indigo-200/60 shadow-[0_4px_20px_rgba(99,102,241,0.05)] mb-6 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-2 mb-2 text-indigo-800">
            <Activity className="w-5 h-5" />
            <h2 className="text-lg font-semibold">{dt("productivityDiagnosis")}</h2>
          </div>
          <p className="text-neutral-700 leading-relaxed">
            {priorityInsight}
          </p>
        </div>
      )}

      {pendingTodos.length > 0 && (
        <div className="glass-panel p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-amber-200/60 shadow-[0_4px_20px_rgba(245,158,11,0.05)] mb-6">
          <div className="flex items-center gap-2 mb-4 text-amber-800">
            <ListTodo className="w-5 h-5" />
            <h2 className="text-lg font-semibold">{dt("keepWorkingOn")}</h2>
          </div>
          <div className="grid gap-3">
            {pendingTodos.map((todo: Todo) => (
              <div
                key={todo.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 glass-button rounded-xl border-amber-200/50 shadow-sm hover:bg-white transition-colors"
              >
                <div>
                  <h3 className="font-medium text-neutral-900">{todo.title}</h3>
                  {todo.notes && (
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{todo.notes}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100/50 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" /> {t.status.pending}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {dt("created")} {format(new Date(todo.created_at), "dd MMM")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => {
                       // Pre-fill form behavior would go here,
                       // but for simplicity, they can just navigate to the form
                       onNavigate("log");
                    }}
                    className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    {t.navigation.log}
                  </button>
                  <button
                    onClick={async () => {
                      const res = await saveTodo({ id: todo.id, status: 'completed' });
                      if(res.success) updateTodo(todo.id, { status: 'completed' });
                    }}
                    className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title={t.common.confirm}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
        <div className="glass-panel overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-neutral-200/50 flex items-center justify-between bg-white/40 backdrop-blur-sm rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-500" />
              <h3 className="font-bold font-heading text-neutral-900 tracking-tight">{t.dashboard.recentEntries}</h3>
            </div>
            <button
              onClick={() => onNavigate("history")}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >{t.dashboard.viewAll}</button>
          </div>
          <div className="p-0 flex-1 overflow-y-auto max-h-[300px]">
            <div className="divide-y divide-neutral-100">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
                  <Clock className="w-8 h-8 text-neutral-300 mb-3" />
                  <p>{t.dashboard.noRecentEntries}</p>
                  <p className="text-xs text-neutral-400 mt-1">{t.dashboard.logNewActivity}</p>
                </div>
              ) : (
                logs.slice(0, 5).map((log) => {
                  const activityName = log.sub_task
                    ? `${log.activity} › ${log.sub_task}`
                    : log.activity || t.common.error;
                  return (
                    <div
                      key={log.id}
                      className="p-5 hover:bg-white/60 transition-colors flex items-start gap-4"
                    >
                      <div className="mt-0.5 p-1.5 bg-neutral-100 text-neutral-500 rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {activityName}
                          </p>
                          <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">
                            {formatHours(log.duration_minutes)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mb-1">
                          {log.user_profiles?.first_name} {log.user_profiles?.last_name} •{" "}
                          {log.project_id} • {log.protocol_id}
                          {log.category && ` • ${dt(log.category)}`}
                        </p>
                        {log.notes && (
                          <p className="text-xs text-neutral-400 line-clamp-1">
                            {log.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onRepeatLog?.(log)}
                        className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                        title={t.dashboard.repeatRecent}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
