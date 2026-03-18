import React, { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { useDynamicTranslation } from "@/lib/i18n/utils";
import { 
  LogEntry, 
  UserProfile, 
  Project, 
  Protocol, 
  Site 
} from "@/lib/types";
import { format, parseISO } from "date-fns";
import { 
  Search, 
  Filter, 
  Trash2, 
  Clock, 
  MessageSquarePlus, 
  MessageSquare, 
  CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";

interface HistoryViewProps {
  logs: LogEntry[];
  onDeleteLog: (id: string) => void;
  profile: UserProfile | null;
  projects: Project[];
  protocols: Protocol[];
  sites: Site[];
  onAddQuery: (logId: string, question: string) => void;
  onReplyToQuery: (logId: string, queryId: string, response: string) => void;
}

export function HistoryView({ 
  logs, 
  onDeleteLog, 
  profile, 
  projects, 
  protocols, 
  sites, 
  onAddQuery, 
  onReplyToQuery 
}: HistoryViewProps) {
  const { t } = useTranslation();
  const { dt } = useDynamicTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [activeQueryLogId, setActiveQueryLogId] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyQueryId, setActiveReplyQueryId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const activityName = log.activity || "";
      const subTaskName = log.sub_task || "";
      const categoryName = log.category || "";

      const matchesSearch = activityName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            subTaskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesProject = projectFilter === "ALL" || log.project_id === projectFilter;
      return matchesSearch && matchesProject;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, searchTerm, projectFilter]);

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const handleDelete = (id: string, logUserId: string) => {
    const isManager = profile?.role === "manager" || profile?.role === "super_admin";
    if (!isManager && logUserId !== profile?.id) {
      toast.error(t.toasts.accessDeniedTitle, { description: t.toasts.accessDeniedDesc });
      return;
    }
    
    if (confirm("Are you sure you want to delete this entry?")) {
      onDeleteLog(id);
      toast.success(t.toasts.deleteSuccessTitle, { description: t.toasts.deleteSuccessDesc });
    }
  };

  const handleAddQuery = (logId: string) => {
    if (!queryText.trim()) return;
    onAddQuery(logId, queryText);
    setQueryText("");
    setActiveQueryLogId(null);
  };

  const handleReply = (logId: string, queryId: string) => {
    if (!replyText.trim()) return;
    onReplyToQuery(logId, queryId, replyText);
    setReplyText("");
    setActiveReplyQueryId(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{t.navigation.history}</h2>
        <p className="text-neutral-500">View and manage past activities.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text"
            placeholder="Search activities, categories, or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
          />
        </div>
        <div className="relative shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="w-full sm:w-48 pl-9 pr-8 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm appearance-none"
          >
            <option value="ALL">{t.history.allProjects}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-0">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 p-8">
              <Clock className="w-12 h-12 text-neutral-200 mb-4" />
              <p>No activities found.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredLogs.map(log => {
                const activityName = log.sub_task ? `${dt(log.activity)} › ${dt(log.sub_task)}` : (log.activity ? dt(log.activity) : dt("Unknown Activity"));
                const isManager = profile?.role === "manager" || profile?.role === "super_admin";
                const isOwner = log.user_id === profile?.id;
                
                return (
                  <div key={log.id} className="p-5 hover:bg-neutral-50 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm font-semibold text-neutral-900 truncate">
                            {activityName}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                            {formatHours(log.duration_minutes)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-2">
                          {format(parseISO(log.date), "MMM d, yyyy")} • {log.user_profiles?.first_name} {log.user_profiles?.last_name} • {log.project_id} 
                          {log.protocol_id && ` • ${log.protocol_id}`}
                          {log.site_id && ` • ${log.site_id}`}
                          {log.category && ` • ${log.category}`}
                        </p>
                        {log.notes && (
                          <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100 mb-3">
                            {log.notes}
                          </p>
                        )}

                        {/* Queries Section */}
                        {log.log_queries && log.log_queries.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {[...log.log_queries].sort((a, b) => new Date(a.question_date).getTime() - new Date(b.question_date).getTime()).map(query => (
                              <div key={query.id} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm">
                                <div className="flex items-start gap-2 mb-2 relative">
                                  <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0 relative z-10 bg-amber-50/50" />
                                  {query.status === "RESOLVED" && (
                                    <div className="absolute left-2 top-4 bottom-[-16px] w-px bg-amber-200" />
                                  )}
                                  <div>
                                    <span className="font-semibold text-neutral-900">Manager</span>
                                    <span className="text-neutral-500 ml-2 text-xs">{format(parseISO(query.question_date), "MMM d, yyyy HH:mm")}</span>
                                    <p className="text-neutral-700 mt-1">{query.question}</p>
                                  </div>
                                </div>
                                
                                {query.status === "RESOLVED" ? (
                                  <div className="ml-6 mt-3 flex items-start gap-2 bg-white p-3 rounded-lg border border-neutral-100 relative">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 relative z-10 bg-white" />
                                    <div>
                                      <span className="font-semibold text-neutral-900">Staff</span>
                                      <span className="text-neutral-500 ml-2 text-xs">{query.response_date && format(parseISO(query.response_date), "MMM d, yyyy HH:mm")}</span>
                                      <p className="text-neutral-700 mt-1">{query.staff_response}</p>
                                    </div>
                                  </div>
                                ) : (
                                  isOwner && (
                                    <div className="ml-6 mt-3">
                                      {activeReplyQueryId === query.id ? (
                                        <div className="flex items-start gap-2">
                                          <textarea
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Type your response..."
                                            className="flex-1 text-sm px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                            rows={2}
                                          />
                                          <div className="flex flex-col gap-1">
                                            <button
                                              onClick={() => handleReply(log.id, query.id)}
                                              className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700"
                                            >
                                              Reply
                                            </button>
                                            <button
                                              onClick={() => setActiveReplyQueryId(null)}
                                              className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-md hover:bg-neutral-200"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setActiveReplyQueryId(query.id);
                                            setReplyText("");
                                          }}
                                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                        >
                                          {t.history.reply}
                                        </button>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Query Form (Manager only) */}
                        {isManager && activeQueryLogId === log.id && (
                          <div className="mt-3 flex items-start gap-2">
                            <textarea
                              value={queryText}
                              onChange={e => setQueryText(e.target.value)}
                              placeholder="Enter your query..."
                              className="flex-1 text-sm px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                              rows={2}
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleAddQuery(log.id)}
                                className="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-md hover:bg-amber-600"
                              >
                                Submit
                              </button>
                              <button
                                onClick={() => setActiveQueryLogId(null)}
                                className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-md hover:bg-neutral-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        {isManager && activeQueryLogId !== log.id && (
                          <button
                            onClick={() => {
                              setActiveQueryLogId(log.id);
                              setQueryText("");
                            }}
                            className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Add Query"
                          >
                            <MessageSquarePlus className="w-4 h-4" />
                          </button>
                        )}
                        {(isManager || isOwner) && (
                          <button
                            onClick={() => handleDelete(log.id, log.user_id)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
