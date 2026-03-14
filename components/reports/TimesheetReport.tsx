import React, { useMemo } from "react";
import { LogEntry, Project, UserProfile } from "@/lib/types";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import Markdown from "react-markdown";

interface TimesheetReportProps {
  logs: LogEntry[];
  profile: UserProfile;
  projects: Project[];
  aiReport?: string | null;
  onClose?: () => void;
}

export function TimesheetReport({
  logs,
  profile,
  projects,
  aiReport,
  onClose,
}: TimesheetReportProps) {
  const groupedData = useMemo(() => {
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const userMap = new Map<
      string,
      {
        profile: UserProfile;
        weeks: Map<
          string,
          {
            weekLabel: string;
            days: Map<
              string,
              {
                dateLabel: string;
                logs: LogEntry[];
                dayTotal: number;
              }
            >;
            weekTotal: number;
          }
        >;
        userTotal: number;
      }
    >();

    // For this context, we'll assume all logs are for the current user (filtered by ReportsView)
    sortedLogs.forEach((log) => {
      const userId = log.user_id || profile.id;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          profile,
          weeks: new Map(),
          userTotal: 0,
        });
      }

      const userData = userMap.get(userId)!;

      const logDate = parseISO(log.date);
      const startW = startOfWeek(logDate, { weekStartsOn: 1 }); // Monday start
      const weekKey = format(startW, "yyyy-MM-dd");
      const weekLabel = `Week ${format(startW, "w")} - ${format(startW, "MM/dd/yy")}`;

      if (!userData.weeks.has(weekKey)) {
        userData.weeks.set(weekKey, {
          weekLabel,
          days: new Map(),
          weekTotal: 0,
        });
      }

      const weekData = userData.weeks.get(weekKey)!;
      const dayKey = log.date;
      const dateLabel = format(logDate, "MM-dd-yy");

      if (!weekData.days.has(dayKey)) {
        weekData.days.set(dayKey, {
          dateLabel,
          logs: [],
          dayTotal: 0,
        });
      }

      const dayData = weekData.days.get(dayKey)!;

      const hours = log.duration_minutes / 60;
      dayData.logs.push(log);
      dayData.dayTotal += hours;
      weekData.weekTotal += hours;
      userData.userTotal += hours;
    });

    return Array.from(userMap.values());
  }, [logs, profile]);

  const handlePrint = () => {
    window.print();
  };

  const getProjectName = (id?: string) => {
    if (!id) return "";
    return projects.find((p) => p.id === id)?.name || id;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-100/95 backdrop-blur-md overflow-hidden print:static print:h-auto print:overflow-visible print:block print:bg-white print:backdrop-blur-none">
      {/* Non-printable header for the modal */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white/95 backdrop-blur-md print:hidden shadow-sm z-10 sticky top-0">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Timesheet Report Preview
          </h2>
          <p className="text-sm text-neutral-500">
            Review the report before printing or saving as PDF.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium transition-colors"
            >
              Close Preview
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Area - Centered container with max width for preview */}
      <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0 print:overflow-visible flex justify-center w-full">
        <div className="w-full max-w-[1200px] bg-white p-6 md:p-10 shadow-md print:shadow-none print:max-w-none print:p-0 rounded-2xl print:rounded-none">

          {/* Document Header */}
          <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
            <div className="text-xs text-neutral-600">
              <div>{format(new Date(), "dd-MM-yyyy HH:mm")}</div>
              <div className="uppercase mt-1 font-semibold">{profile.first_name} {profile.last_name}</div>
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-2xl font-bold mb-1">Informe de hoja de horas</h1>
              <div className="text-sm font-semibold">SiteFlow App</div>
            </div>
            <div className="text-xs text-right text-neutral-600">Page: 1 of 1</div>
          </div>

          <div className="text-xs mb-4 pb-2 font-medium text-neutral-800">
            Filters: Fecha de inicio: {logs.length > 0 ? format(parseISO(logs[0].date), "dd-MM-yy") : "N/A"}, Recurso: {profile.id.substring(0, 5)}, Descripción: All Activities
          </div>

          {/* Data Table Container */}
          <div className="overflow-x-auto print:overflow-x-visible">
            <table className="w-full text-xs text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-black text-neutral-900">
                  <th className="py-2 pr-2 font-bold whitespace-nowrap">Recurso</th>
                  <th className="py-2 pr-2 font-bold whitespace-nowrap">Nombre periodo</th>
                  <th className="py-2 pr-2 font-bold whitespace-nowrap">Fecha</th>
                  <th className="py-2 pr-2 font-bold whitespace-nowrap">Nº Proyecto</th>
                  <th className="py-2 pr-2 font-bold whitespace-nowrap">Descripción proyecto</th>
                  <th className="py-2 pr-2 font-bold whitespace-nowrap">Nº de Tarea</th>
                  <th className="py-2 pr-2 font-bold min-w-[150px]">Descripción de la tarea</th>
                  <th className="py-2 pr-2 font-bold min-w-[200px]">Details</th>
                  <th className="py-2 pr-2 font-bold text-center whitespace-nowrap">Estado</th>
                  <th className="py-2 pr-2 font-bold text-right whitespace-nowrap">Cantidad regular</th>
                  <th className="py-2 font-bold text-right whitespace-nowrap">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {groupedData.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-neutral-500">
                      No data available for the selected period.
                    </td>
                  </tr>
                )}

                {groupedData.map((user) => (
                  <React.Fragment key={user.profile.id}>
                    {/* User Header Row */}
                    <tr>
                      <td colSpan={11} className="py-3 font-bold text-sm bg-neutral-50 print:bg-transparent">
                        {user.profile.first_name} {user.profile.last_name} ({user.profile.id.substring(0, 3)})
                      </td>
                    </tr>

                    {Array.from(user.weeks.values()).map((week) => (
                      <React.Fragment key={week.weekLabel}>
                        {/* Week Header Row */}
                        <tr>
                          <td></td>
                          <td colSpan={10} className="py-2 font-bold pl-4 text-neutral-800">
                            {week.weekLabel}
                          </td>
                        </tr>

                        {Array.from(week.days.values()).map((day) => (
                          <React.Fragment key={day.dateLabel}>
                            {/* Daily Logs Rows */}
                            {day.logs.map((log, index) => {
                              const projectName = getProjectName(log.project_id);
                              return (
                                <tr key={log.id} className="align-top border-b border-dashed border-neutral-200 print:border-neutral-300">
                                  <td className="py-1.5"></td>
                                  <td className="py-1.5"></td>
                                  <td className="py-1.5 font-medium whitespace-nowrap">{index === 0 ? day.dateLabel : ""}</td>
                                  <td className="py-1.5 whitespace-nowrap">{projectName.substring(0, 8).toUpperCase()}</td>
                                  <td className="py-1.5 pr-2 max-w-[150px] truncate" title={projectName}>{projectName}</td>
                                  <td className="py-1.5 whitespace-nowrap">{log.category?.substring(0, 4).toUpperCase() || "N/A"}</td>
                                  <td className="py-1.5 pr-2 max-w-[180px] truncate" title={log.activity}>{log.activity || "N/A"}</td>
                                  <td className="py-1.5 pr-4 break-words text-neutral-600 max-w-[250px] whitespace-normal">
                                    {log.notes || "-"}
                                  </td>
                                  <td className="py-1.5 text-center whitespace-nowrap text-neutral-500">Publicado</td>
                                  <td className="py-1.5 text-right font-mono">
                                    {(log.duration_minutes / 60).toFixed(1).replace('.', ',')}
                                  </td>
                                  <td className="py-1.5 text-right font-mono font-medium">
                                    {(log.duration_minutes / 60).toFixed(1).replace('.', ',')}
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Daily Total Row */}
                            <tr className="border-b border-neutral-300">
                              <td colSpan={8}></td>
                              <td className="py-1.5 text-right font-bold whitespace-nowrap">MM/dd/yyyy Total</td>
                              <td className="py-1.5 text-right font-bold font-mono">{day.dayTotal.toFixed(1).replace('.', ',')}</td>
                              <td className="py-1.5 text-right font-bold font-mono">{day.dayTotal.toFixed(1).replace('.', ',')}</td>
                            </tr>
                          </React.Fragment>
                        ))}

                        {/* Weekly Total Row */}
                        <tr className="border-b-2 border-black">
                          <td colSpan={8}></td>
                          <td className="py-2 text-right font-bold whitespace-nowrap">{week.weekLabel} Total</td>
                          <td className="py-2 text-right font-bold font-mono">{week.weekTotal.toFixed(1).replace('.', ',')}</td>
                          <td className="py-2 text-right font-bold font-mono text-sm">{week.weekTotal.toFixed(1).replace('.', ',')}</td>
                        </tr>
                        <tr><td colSpan={11} className="h-4"></td></tr>
                      </React.Fragment>
                    ))}

                    {/* User Total Row */}
                    <tr className="border-t-[3px] border-double border-black">
                      <td colSpan={8}></td>
                      <td className="py-3 text-right font-bold text-sm whitespace-nowrap">
                        {user.profile.first_name} {user.profile.last_name} Total
                      </td>
                      <td className="py-3 text-right font-bold text-sm font-mono">{user.userTotal.toFixed(1).replace('.', ',')}</td>
                      <td className="py-3 text-right font-bold text-base font-mono">{user.userTotal.toFixed(1).replace('.', ',')}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t-2 border-black mt-1"></div>

          {/* AI Insights Section */}
          {aiReport && (
            <div className="mt-8 pt-6 border-t border-neutral-200 break-inside-avoid">
              <div className="flex items-center gap-2 mb-3 text-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                <h2 className="text-sm font-bold uppercase tracking-wider">AI Insights & Activity Summary</h2>
              </div>
              <div className="prose prose-xs max-w-none text-neutral-700">
                <Markdown>{aiReport}</Markdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
