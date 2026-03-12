import React, { useMemo } from "react";
import { LogEntry, PROJECTS, PROTOCOLS, User, ROLE_PERMISSIONS, UserAssignment } from "@/lib/types";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { Clock, Activity, CheckCircle2, MessageSquare, Repeat, Sparkles, Send, AlertTriangle, TrendingUp, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { parseNaturalLanguageLog, generateManagerInsights, AIInsight, ParsedLogData } from "@/lib/actions";

import { ActiveTimer } from "@/lib/store";

const PROJECTS_MAP = new Map(PROJECTS.map((p) => [p.id, p]));
const PROTOCOLS_MAP = new Map(PROTOCOLS.map((p) => [p.id, p]));


interface DashboardViewProps {
  logs: LogEntry[];
  onNavigate: (view: "log" | "history") => void;
  currentUser: User;
  activeTimer?: ActiveTimer | null;
  startTimer?: () => void;
  onRepeat?: (logId: string) => void;
  onSmartLog?: (data: ParsedLogData) => void;
  assignments?: UserAssignment[];
}

export function DashboardView({ logs, onNavigate, currentUser, activeTimer, startTimer, onRepeat, onSmartLog, assignments = [] }: DashboardViewProps) {
  const [nlInput, setNlInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

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

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlInput.trim() || !onSmartLog) return;

    setIsAnalyzing(true);
    try {
      // Find available projects for current user
      const userAssignments = assignments.find(a => a.userId === currentUser.id);
      const availableProjects = PROJECTS.filter(p => userAssignments?.projectIds.includes(p.id));
      const availableProtocols = PROTOCOLS.filter(p => userAssignments?.protocolIds.includes(p.id));

      const response = await parseNaturalLanguageLog(
        nlInput,
        currentUser.role,
        availableProjects,
        availableProtocols,
        [] // Pass sites if available, empty for now to simplify
      );

      if (response.success) {
        toast.success("AI extraction successful. Please review.");
        onSmartLog(response.data);
        setNlInput("");
      } else {
        toast.error(response.error || "Failed to parse natural language.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Smart Insights for Managers
  const insights = useMemo(() => {
    if (currentUser.role !== "Manager" && currentUser.role !== "Admin") return [];

    const alerts = [];
    const _today = new Date();

    // 1. Burnout Risk: Team members with > 45 hours this week
    const startOfThisWeek = subDays(_today, _today.getDay() || 7);

    const teamLogsThisWeek = logs.filter(log => new Date(log.date) >= startOfThisWeek);
    const userHours = teamLogsThisWeek.reduce((acc, log) => {
      acc[log.userName] = (acc[log.userName] || 0) + log.durationMinutes;
      return acc;
    }, {} as Record<string, number>);

    for (const [name, minutes] of Object.entries(userHours)) {
      if (minutes > 45 * 60) {
         alerts.push({
           id: `burnout-${name}`,
           type: "warning",
           icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
           title: "Burnout Risk Detected",
           message: `${name} has logged ${Math.floor(minutes/60)} hours this week.`,
           bg: "bg-amber-50",
           border: "border-amber-200"
         });
      }
    }

    // 2. Query Escalations: Find old queries (e.g. > 3 days old)
    const threeDaysAgoTime = _today.getTime() - (3 * 24 * 3600 * 1000);
    const oldQueries = logs.reduce((acc, log) => {
       if (!log.queries) return acc;
       for (let i = 0; i < log.queries.length; i++) {
          const q = log.queries[i];
          if (q.status === "OPEN" && new Date(q.questionDate).getTime() < threeDaysAgoTime) {
             acc.push(q);
          }
       }
       return acc;
    }, [] as NonNullable<LogEntry["queries"]>);

    if (oldQueries.length > 0) {
       alerts.push({
           id: "old-queries",
           type: "danger",
           icon: <MessageSquare className="w-5 h-5 text-rose-600" />,
           title: "Query Escalation Needed",
           message: `There are ${oldQueries.length} open queries older than 3 days.`,
           bg: "bg-rose-50",
           border: "border-rose-200"
       });
    }

    // 3. Performance positive: Site with most resolved queries
    const resolvedQueries = logs.flatMap(log => (log.queries || []).filter(q => q.status === "RESOLVED"));
    if (resolvedQueries.length > 10) {
       alerts.push({
           id: "high-resolution",
           type: "success",
           icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
           title: "Great Resolution Rate",
           message: "The team has successfully resolved a high volume of queries recently.",
           bg: "bg-emerald-50",
           border: "border-emerald-200"
       });
    }

    return alerts;
  }, [logs, currentUser.role]);

  const openQueriesCount = useMemo(() => {
    return visibleLogs.reduce((acc, log) => acc + (log.queries?.filter(q => q.status === "OPEN").length || 0), 0);
  }, [visibleLogs]);


  const handleGenerateAIInsights = async () => {
    if (logs.length === 0) {
      toast.info("No hay datos recientes para analizar.");
      return;
    }
    setIsGeneratingInsights(true);
    try {
      const response = await generateManagerInsights(logs);
      if (response.success) {
        setAiInsights(response.data);
        toast.success("AI Insights generated successfully.");

        // Check for high priority alerts to notify
        const dangerAlerts = response.data.filter(i => i.type === "danger" || i.type === "warning");
        if (dangerAlerts.length > 0) {
           toast("High priority items detected by AI. Please review the dashboard.", { icon: "🔔" });
        }
      } else {
        toast.error(response.error || "Failed to generate AI insights.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const allInsights = useMemo(() => {
    const combined = [...insights];

    // Add AI insights with formatting
    aiInsights.forEach((ai, idx) => {
      let icon = <Sparkles className="w-5 h-5 text-indigo-600" />;
      let bg = "bg-indigo-50";
      let border = "border-indigo-200";

      if (ai.type === "warning") {
        icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
        bg = "bg-amber-50"; border = "border-amber-200";
      } else if (ai.type === "danger") {
        icon = <AlertTriangle className="w-5 h-5 text-rose-600" />;
        bg = "bg-rose-50"; border = "border-rose-200";
      } else if (ai.type === "success") {
        icon = <TrendingUp className="w-5 h-5 text-emerald-600" />;
        bg = "bg-emerald-50"; border = "border-emerald-200";
      }

      combined.push({
        id: `ai-insight-${idx}`,
        type: ai.type,
        icon,
        title: ai.title,
        message: ai.message,
        bg,
        border
      });
    });

    return combined;
  }, [insights, aiInsights]);
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

            {/* Smart Logging */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/3 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-indigo-600" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-indigo-900">AI Smart Logging</h3>
          </div>
          <form onSubmit={handleSmartSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder="e.g. Spent 2 hours doing SDV for PRJ-JIT at General Hospital..."
              className="flex-1 px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-indigo-300 text-sm shadow-sm transition-all"
              disabled={isAnalyzing}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !nlInput.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

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

          {activeTimer ? (
            <button
              onClick={() => onNavigate("log")}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5 animate-pulse" />
              Timer is Running
            </button>
          ) : (
            <button
              onClick={() => {
                startTimer?.();
                onNavigate("log");
              }}
              className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              Start Live Timer
            </button>
          )}
          <button
            onClick={() => onNavigate("log")}
            className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
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

            {/* Smart Insights (Managers Only) */}
      {(currentUser.role === "Manager" || currentUser.role === "Admin") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-neutral-500" />
              <h3 className="text-sm font-semibold text-neutral-900">Proactive Insights</h3>
            </div>
            <button
                onClick={handleGenerateAIInsights}
                disabled={isGeneratingInsights}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 transition-colors font-medium shadow-sm"
              >
                {isGeneratingInsights ? (
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isGeneratingInsights ? "Analyzing..." : "Generate AI Insights"}
              </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allInsights.length === 0 ? (
              <div className="col-span-full p-6 text-center bg-white border border-neutral-200 rounded-xl">
                <p className="text-neutral-500 text-sm">No alerts detected yet. Click &quot;Generate AI Insights&quot; to analyze recent team activity.</p>
              </div>
            ) : (
              allInsights.map(alert => (
              <div key={alert.id} className={`${alert.bg} ${alert.border} border p-4 rounded-xl flex items-start gap-3 shadow-sm`}>
                 <div className="shrink-0 mt-0.5">
                   {alert.icon}
                 </div>
                 <div>
                   <h4 className="text-sm font-semibold text-neutral-900">{alert.title}</h4>
                   <p className="text-xs text-neutral-600 mt-0.5">{alert.message}</p>
                 </div>
              </div>
            )))}
          </div>
        </div>
      )}

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
              const project = PROJECTS_MAP.get(log.projectId);
              const protocol = PROTOCOLS_MAP.get(log.protocolId);
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
                      <div className="flex items-center gap-2">
                        {onRepeat && (
                          <button
                            onClick={() => onRepeat(log.id)}
                            className="p-1 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors tooltip tooltip-left"
                            title="Repeat this activity"
                          >
                            <Repeat className="w-4 h-4" />
                          </button>
                        )}
                        <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">
                          {formatHours(log.durationMinutes)}
                        </span>
                      </div>
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
