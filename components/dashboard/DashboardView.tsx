import React, { useMemo } from "react";
import {
  LogEntry,
  UserProfile,
  Project,
  Protocol
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
  const today = new Date();
  
  const todayLogs = logs.filter((log) =>
    isSameDay(parseISO(log.date), today),
  );
  const todayMinutes = todayLogs.reduce(
    (acc, log) => acc + log.duration_minutes,
    0,
  );

  const thisWeekLogs = logs.filter(
    (log) => new Date(log.date) >= subDays(today, 7),
  );
  const thisWeekMinutes = thisWeekLogs.reduce(
    (acc, log) => acc + log.duration_minutes,
    0,
  );

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
    const today = new Date();
    return logs.filter((log) => {
      const logDate = parseISO(log.date);
      return isWithinInterval(logDate, {
        start: startOfWeek(today),
        end: endOfWeek(today),
      });
    });
  }, [logs]);

  const categoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    currentWeekLogs.forEach((log) => {
      if (log.category) {
        dist[log.category] = (dist[log.category] || 0) + log.duration_minutes;
      }
    });
    return Object.entries(dist)
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
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Dashboard
        </h2>
        <p className="text-neutral-500">Overview of activities.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-neutral-600">
              Today&apos;s Time
            </h3>
          </div>
          <p className="text-3xl font-light tracking-tight text-neutral-900">
            {formatHours(todayMinutes)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {todayLogs.length} entries
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-neutral-600">This Week</h3>
          </div>
          <p className="text-3xl font-light tracking-tight text-neutral-900">
            {formatHours(thisWeekMinutes)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {thisWeekLogs.length} entries
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
                <span className="text-sm font-medium">Open Queries</span>
              </div>
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {openQueriesCount}
              </span>
            </div>
          )}
          
          <div className="w-full space-y-3">
            <button
              onClick={() => onNavigate("log")}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Activity className="w-5 h-5" />
              Log New Activity
            </button>
            <button
              onClick={() => onNavigate("history")}
              className="w-full py-3.5 text-indigo-600 hover:bg-indigo-50 rounded-2xl font-semibold transition-all duration-200 border border-transparent hover:border-indigo-100 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              View My History
            </button>
            
            {isManager && (
              <div className="pt-5 mt-5 border-t border-neutral-100 w-full flex flex-col items-center">
                <p className="text-[10px] text-neutral-400 mb-3 uppercase tracking-[0.2em] font-bold">
                  Team Management
                </p>
                <button
                  onClick={() => onNavigate("history")}
                  className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Review Team History
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deeper Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-neutral-500" />
            <h3 className="font-semibold text-neutral-900">
              Time by Category (This Week)
            </h3>
          </div>
          <div className="p-6 flex-1">
            {categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                {categoryDistribution.map(([name, mins]) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-neutral-700">
                        {name}
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
                No data for this week yet.
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-500" />
              <h3 className="font-semibold text-neutral-900">Recent Entries</h3>
            </div>
            <button
              onClick={() => onNavigate("history")}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="p-0 flex-1 overflow-y-auto max-h-[300px]">
            <div className="divide-y divide-neutral-100">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  No activities logged yet.
                </div>
              ) : (
                logs.slice(0, 5).map((log) => {
                  const activityName = log.sub_task
                    ? `${log.activity} › ${log.sub_task}`
                    : log.activity || "Unknown Activity";
                  return (
                    <div
                      key={log.id}
                      className="p-5 hover:bg-neutral-50 transition-colors flex items-start gap-4"
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
                          {log.category && ` • ${log.category}`}
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
                        title="Repeat this activity"
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
