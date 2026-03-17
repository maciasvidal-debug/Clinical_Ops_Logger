import React, { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { LogEntry, Project, UserProfile, ROLE_PERMISSIONS } from "@/lib/types";
import { generateAIReport } from "@/lib/actions";
import Markdown from "react-markdown";
import { Sparkles, Loader2, Printer } from "lucide-react";
import { TimesheetReport } from "./TimesheetReport";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ComposedChart,
} from "recharts";
import { format, parseISO } from "date-fns";

interface ReportsViewProps {
  logs: LogEntry[];
  profile: UserProfile;
  projects: Project[];
}

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export function ReportsView({ logs, profile, projects }: ReportsViewProps) {
  const { t, language } = useTranslation();
  const permissions = ROLE_PERMISSIONS[profile.role];

  const visibleLogs = useMemo(() => {
    return logs.filter(
      (log) => permissions.canViewAllLogs || log.user_id === profile.id,
    );
  }, [logs, permissions, profile.id]);

  const projectData = useMemo(() => {
    const projectMap = new Map<string, string>();
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].id) {
        projectMap.set(projects[i].id, projects[i].name);
      }
    }

    const data = new Map<string, number>();
    for (let i = 0; i < visibleLogs.length; i++) {
      const log = visibleLogs[i];
      const projectId = log.project_id || "";
      const projectName = projectMap.get(projectId) || projectId || "Unknown";
      const current = data.get(projectName) || 0;
      data.set(projectName, current + log.duration_minutes);
    }

    const result = [];
    for (const [name, minutes] of data.entries()) {
      result.push({
        name,
        hours: Number((minutes / 60).toFixed(1)),
      });
    }
    return result.sort((a, b) => b.hours - a.hours);
  }, [visibleLogs, projects]);

  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    visibleLogs.forEach((log) => {
      const activityName = log.activity || "Unknown";
      data[activityName] = (data[activityName] || 0) + log.duration_minutes;
    });
    return Object.entries(data)
      .map(([name, minutes]) => ({
        name,
        value: Number((minutes / 60).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [visibleLogs]);

  const subTaskData = useMemo(() => {
    const data: Record<string, number> = {};
    visibleLogs.forEach((log) => {
      if (log.sub_task) {
        data[log.sub_task] = (data[log.sub_task] || 0) + log.duration_minutes;
      }
    });
    return Object.entries(data)
      .map(([name, minutes]) => ({
        name,
        value: Number((minutes / 60).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 sub-tasks
  }, [visibleLogs]);

  const roleData = useMemo(() => {
    const data: Record<string, number> = {};
    visibleLogs.forEach((log) => {
      const roleName = log.role || "Unknown";
      data[roleName] = (data[roleName] || 0) + log.duration_minutes;
    });
    return Object.entries(data)
      .map(([name, minutes]) => ({
        name,
        hours: Number((minutes / 60).toFixed(1)),
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [visibleLogs]);

  const kpiData = useMemo(() => {
    const counts: Record<string, number> = {};
    const hours: Record<string, number> = {};

    visibleLogs.forEach((log) => {
      if (log.sub_task) {
        counts[log.sub_task] = (counts[log.sub_task] || 0) + 1;
        hours[log.sub_task] =
          (hours[log.sub_task] || 0) + log.duration_minutes / 60;
      }
    });

    return { counts, hours };
  }, [visibleLogs]);

  const patientFunnelData = useMemo(() => {
    return [
      {
        name: "Consented",
        count: kpiData.counts["Consent visit completed"] || 0,
      },
      {
        name: "Screen Failed",
        count: kpiData.counts["Participant screenfailed"] || 0,
      },
      {
        name: "Randomized",
        count: kpiData.counts["Participant Randomized/Enrolled"] || 0,
      },
      {
        name: "Completed",
        count: kpiData.counts["Participant completed study"] || 0,
      },
      {
        name: "Discontinued",
        count:
          (kpiData.counts["Participant off study/discontinued"] || 0) +
          (kpiData.counts["Participant withdrew consent"] || 0),
      },
    ];
  }, [kpiData]);

  const queryData = useMemo(() => {
    return [
      {
        name: "Answered",
        count: kpiData.counts["Query responded/answered"] || 0,
        hours: Number(
          (kpiData.hours["Query responded/answered"] || 0).toFixed(1),
        ),
      },
      {
        name: "Resolved",
        count: kpiData.counts["Query resolved/closed"] || 0,
        hours: Number((kpiData.hours["Query resolved/closed"] || 0).toFixed(1)),
      },
    ];
  }, [kpiData]);

  const safetyData = useMemo(() => {
    return [
      {
        name: "Initial SAEs",
        count: kpiData.counts["Initial SAE entered"] || 0,
      },
      {
        name: "SAE Follow-ups",
        count: kpiData.counts["SAE follow-up report entered"] || 0,
      },
    ];
  }, [kpiData]);

  const siteSupportData = useMemo(() => {
    return [
      {
        name: "QC Activities",
        hours: Number((kpiData.hours["Support QC activities"] || 0).toFixed(1)),
      },
      {
        name: "Monitoring",
        hours: Number(
          (kpiData.hours["Support monitoring visit"] || 0).toFixed(1),
        ),
      },
      {
        name: "Audit/Inspection",
        hours: Number(
          (kpiData.hours["Support audit or inspection"] || 0).toFixed(1),
        ),
      },
    ];
  }, [kpiData]);

  const trendData = useMemo(() => {
    const dataByDate: Record<string, { date: string, Queries: number, Consents: number, SAEs: number, Retention: number, [key: string]: string | number }> = {};
    // Sort logs by date ascending
    const sortedLogs = [...visibleLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    sortedLogs.forEach((log) => {
      const date = format(parseISO(log.date), "MMM dd");
      if (!dataByDate[date]) {
        dataByDate[date] = {
          date,
          Queries: 0,
          Consents: 0,
          SAEs: 0,
          Retention: 0,
        };
      }
      if (log.sub_task?.includes("Query")) dataByDate[date].Queries += 1;
      if (log.sub_task?.includes("Consent visit completed"))
        dataByDate[date].Consents += 1;
      if (log.sub_task?.includes("SAE")) dataByDate[date].SAEs += 1;
      if (log.sub_task?.includes("Retention")) dataByDate[date].Retention += 1;
    });
    return Object.values(dataByDate);
  }, [visibleLogs]);

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);

  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    const result = await generateAIReport(
      visibleLogs,
      profile.role,
      `${profile.first_name} ${profile.last_name}`,
    );
    if (result.success) {
      setAiReport(result.data);
    } else {
      setAiError(result.error);
    }
    setIsGeneratingAI(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Reports
          </h2>
          <p className="text-neutral-500">
            {t.reports.subtitle}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowTimesheetModal(true)}
            disabled={visibleLogs.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 disabled:text-neutral-400 disabled:bg-neutral-50 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            {t.reports.export}
          </button>
          <button
            onClick={handleGenerateAIReport}
            disabled={isGeneratingAI || visibleLogs.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            {isGeneratingAI ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGeneratingAI ? "Analyzing Data..." : "Generate AI Insights"}
          </button>
        </div>
      </header>

      {showTimesheetModal && (
        <TimesheetReport
          logs={visibleLogs}
          profile={profile}
          projects={projects}
          aiReport={aiReport}
          onClose={() => setShowTimesheetModal(false)}
        />
      )}

      {aiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          Failed to generate AI report: {aiError}
        </div>
      )}

      {aiReport && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-indigo-800">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-lg">AI Weekly Insights</h3>
          </div>
          <div className="prose prose-indigo prose-sm max-w-none">
            <Markdown>{aiReport}</Markdown>
          </div>
        </div>
      )}

      {visibleLogs.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm text-center text-neutral-500">
          Not enough data to generate reports. Log some activities first.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI Trends Over Time */}
          {trendData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-semibold text-neutral-900 mb-6">
                KPI Trends Over Time (Counts)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e5e5"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#737373" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#737373" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Queries"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Consents"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="SAEs"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Retention"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Patient Funnel */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-6">
              Patient Funnel (Counts)
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={patientFunnelData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e5e5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#737373" }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f5f5" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Query Management */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-6">
              Query Management
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={queryData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e5e5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f5f5" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Count"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="hours"
                    name="Hours"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Safety Reporting */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-6">
              Safety Reporting (Counts)
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={safetyData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e5e5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f5f5" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Site Support Hours */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-6">
              Site Support (Hours)
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={siteSupportData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e5e5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#737373" }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f5f5" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Chart */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-6">
              Hours per Project
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e5e5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f5f5" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 mb-6">
              Time by Activity Type (Hours)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {activityData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-1.5 text-xs text-neutral-600"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {entry.name} ({entry.value}h)
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Task Chart */}
          {subTaskData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-semibold text-neutral-900 mb-6">
                Top Sub-Tasks (Hours)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subTaskData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e5e5e5"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#737373" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#737373" }}
                      width={150}
                    />
                    <Tooltip
                      cursor={{ fill: "#f5f5f5" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Role Chart */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-semibold text-neutral-900 mb-6">
              Total Hours per Role
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={roleData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e5e5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#737373" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f5f5" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
