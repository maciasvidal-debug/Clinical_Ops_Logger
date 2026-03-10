import React, { useMemo } from "react";
import { LogEntry, PROJECTS, PROTOCOLS, User, ROLE_PERMISSIONS } from "@/lib/types";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { Clock, Activity, CheckCircle2, MessageSquare } from "lucide-react";

interface DashboardViewProps {
  logs: LogEntry[];
  onNavigate: (view: "log" | "history") => void;
  currentUser: User;
}

export function DashboardView({ logs, onNavigate, currentUser }: DashboardViewProps) {
  const today = new Date();
  const permissions = ROLE_PERMISSIONS[currentUser.role];

  const visibleLogs = useMemo(() => {
    return logs.filter(log => permissions.canViewAllLogs || log.userId === currentUser.id);
  }, [logs, permissions, currentUser.id]);

  const todayLogs = visibleLogs.filter((log) => isSameDay(parseISO(log.date), today));
  const todayMinutes = todayLogs.reduce(
    (acc, log) => acc + log.durationMinutes,
    0,
  );

  const thisWeekLogs = visibleLogs.filter(
    (log) => new Date(log.date) >= subDays(today, 7),
  );
  const thisWeekMinutes = thisWeekLogs.reduce(
    (acc, log) => acc + log.durationMinutes,
    0,
  );

  const openQueriesCount = useMemo(() => {
    return visibleLogs.reduce((acc, log) => acc + (log.queries?.filter(q => q.status === "OPEN").length || 0), 0);
  }, [visibleLogs]);

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
        <p className="text-neutral-500">Overview of your recent activities.</p>
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
            <div className="w-full mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => onNavigate("history")}>
              <div className="flex items-center gap-2 text-amber-800">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Open Queries</span>
              </div>
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{openQueriesCount}</span>
            </div>
          )}
          <button
            onClick={() => onNavigate("log")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            Log New Activity
          </button>
          <button
            onClick={() => onNavigate("history")}
            className="w-full py-3 mt-2 text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-colors"
          >
            View History
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Recent Entries</h3>
          <button
            onClick={() => onNavigate("history")}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-neutral-100">
          {visibleLogs.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No activities logged yet.
            </div>
          ) : (
            visibleLogs.slice(0, 5).map((log) => {
              const project = PROJECTS.find((p) => p.id === log.projectId);
              const protocol = PROTOCOLS.find((p) => p.id === log.protocolId);
              const activityName = log.subTask ? `${log.activity} › ${log.subTask}` : (log.activity || log.activityType || "Unknown Activity");
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
                        {formatHours(log.durationMinutes)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate mb-1">
                      {log.userName || log.role} • {project?.name || log.projectId || log.studyId} 
                      {protocol && ` • ${protocol.name}`}
                      {log.category && ` • ${log.category}`}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-neutral-400 line-clamp-1">
                        {log.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
