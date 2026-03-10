/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useMemo, useEffect } from "react";
import { LogEntry, PROJECTS, PROTOCOLS, SITES, ROLE_HIERARCHY, User, UserAssignment } from "@/lib/types";
import { ActiveTimer } from "@/lib/store";
import { format } from "date-fns";
import { CheckCircle2, Clock, FileText, Users, Phone, Database, ShieldCheck, Stethoscope, ClipboardCheck, Activity, Sparkles } from "lucide-react";
import { generateAIResponse } from "@/lib/actions";
import { toast } from "sonner";

const getTaskIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("consent") || lower.includes("icf") || lower.includes("doc") || lower.includes("note")) return <FileText className="w-5 h-5" />;
  if (lower.includes("visit") || lower.includes("monitor") || lower.includes("patient") || lower.includes("site")) return <Users className="w-5 h-5" />;
  if (lower.includes("call") || lower.includes("email") || lower.includes("text") || lower.includes("contact") || lower.includes("communication")) return <Phone className="w-5 h-5" />;
  if (lower.includes("data") || lower.includes("edc") || lower.includes("query") || lower.includes("database") || lower.includes("irt")) return <Database className="w-5 h-5" />;
  if (lower.includes("safety") || lower.includes("sae") || lower.includes("ae") || lower.includes("qc") || lower.includes("audit") || lower.includes("compliance")) return <ShieldCheck className="w-5 h-5" />;
  if (lower.includes("clinical") || lower.includes("blood") || lower.includes("sample") || lower.includes("treatment") || lower.includes("medication")) return <Stethoscope className="w-5 h-5" />;
  if (lower.includes("screening") || lower.includes("randomization") || lower.includes("enrollment")) return <Activity className="w-5 h-5" />;
  return <ClipboardCheck className="w-5 h-5" />;
};

interface LogFormViewProps {
  onAddLog: (log: Omit<LogEntry, "id" | "synced" | "userId" | "userName">) => void;
  onSuccess: () => void;
  currentUser: User;
  assignments: UserAssignment[];
  activeTimer?: ActiveTimer | null;
  stopTimer?: () => number;
  cancelTimer?: () => void;
  repeatLogId?: string | null;
  logs?: LogEntry[];
  aiPreFillData?: any | null;
}

export function LogFormView({ onAddLog, onSuccess, currentUser, assignments, activeTimer, stopTimer, cancelTimer, repeatLogId, logs, aiPreFillData }: LogFormViewProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  
  const userAssignment = useMemo(() => {
    return assignments.find(a => a.userId === currentUser.id) || { projectIds: [] as string[], protocolIds: [] as string[] };
  }, [assignments, currentUser.id]);

  const availableProjects = useMemo(() => {
    return PROJECTS.filter(p => userAssignment.projectIds.includes(p.id));
  }, [userAssignment.projectIds]);

  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    if (availableProjects.length > 0 && !availableProjects.find(p => p.id === projectId)) {
      setProjectId(availableProjects[0].id);
    } else if (availableProjects.length === 0) {
      setProjectId("");
    }
  }, [availableProjects, projectId]);
  
  const availableProtocols = useMemo(() => {
    return PROTOCOLS.filter(p => p.projectId === projectId && userAssignment.protocolIds.includes(p.id));
  }, [projectId, userAssignment.protocolIds]);
  const [protocolId, setProtocolId] = useState("");

  const availableSites = useMemo(() => SITES.filter(s => s.protocolId === protocolId), [protocolId]);
  const [siteId, setSiteId] = useState("");

  useEffect(() => {
    if (availableProtocols.length > 0) {
      setProtocolId(availableProtocols[0].id);
    } else {
       
      setProtocolId("");
    }
  }, [availableProtocols]);

  useEffect(() => {
    if (availableSites.length > 0) {
      setSiteId(availableSites[0].id);
    } else {
       
      setSiteId("");
    }
  }, [availableSites]);

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedTimerStr, setElapsedTimerStr] = useState("00:00:00");

  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - activeTimer.startTime;

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setElapsedTimerStr(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStopTimer = () => {
    if (stopTimer) {
      const durationMins = stopTimer();
      const h = Math.floor(durationMins / 60);
      const m = durationMins % 60;
      setHours(h.toString());
      setMinutes(m.toString());
      toast.success(`Timer stopped. ${h}h ${m}m logged.`);
    }
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiEnhance = async () => {
    if (!notes.trim()) {
      toast.error("Please enter some notes to enhance first.");
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    const prompt = `Enhance these clinical trial activity notes to be professional, concise, and structured. Return ONLY the enhanced notes:\n\n${notes}`;

    const response = await generateAIResponse(prompt);

    if (response.success) {
      setNotes(response.data.trim());
      toast.success("Notes enhanced with AI");
    } else {
      setAiError(response.error);
      toast.error(response.error);
    }

    setIsAiLoading(false);
  };

  const availableCategories = useMemo(() => {
    return ROLE_HIERARCHY[currentUser.role] || [];
  }, [currentUser.role]);

  const [categoryId, setCategoryId] = useState<string>("");
  const [activityId, setActivityId] = useState<string>("");
  const [subTaskId, setSubTaskId] = useState<string>("");

  // Reset category and activity when role changes
  useEffect(() => {
    if (availableCategories.length > 0) {
      setCategoryId(availableCategories[0].id);
      if (availableCategories[0].tasks.length > 0) {
        setActivityId(availableCategories[0].tasks[0].id);
      } else {
        setActivityId("");
      }
    } else {
      setCategoryId("");
      setActivityId("");
    }
  }, [availableCategories]);

  // Reset activity when category changes
  useEffect(() => {
    const category = availableCategories.find(c => c.id === categoryId);
    if (category && category.tasks.length > 0) {
      setActivityId(category.tasks[0].id);
    } else {
      setActivityId("");
    }
  }, [categoryId, availableCategories]);

  // Reset subTask when activity changes
  useEffect(() => {
    const category = availableCategories.find(c => c.id === categoryId);
    const task = category?.tasks.find(t => t.id === activityId);
    if (task && task.subTasks && task.subTasks.length > 0) {
      setSubTaskId(task.subTasks[0].id);
    } else {
      setSubTaskId("");
    }
  }, [activityId, categoryId, availableCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const durationMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    
    if (durationMinutes <= 0) {
      toast.error("Please enter a valid duration.");
      setIsSubmitting(false);
      return;
    }

    if (!projectId || !protocolId) {
      toast.error("Please select a project and protocol.");
      setIsSubmitting(false);
      return;
    }

    if (!categoryId || !activityId) {
      toast.error("Please select a category and activity.");
      setIsSubmitting(false);
      return;
    }

    const categoryName = availableCategories.find(c => c.id === categoryId)?.name || categoryId;
    const task = availableCategories
      .find(c => c.id === categoryId)?.tasks
      .find(t => t.id === activityId);
    const activityName = task?.name || activityId;
    const subTaskName = task?.subTasks?.find(s => s.id === subTaskId)?.name;

    onAddLog({
      date,
      durationMinutes,
      projectId,
      protocolId,
      siteId,
      role: currentUser.role,
      category: categoryName,
      activity: activityName,
      subTask: subTaskName,
      notes
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 500);
  };

  const currentCategory = availableCategories.find(c => c.id === categoryId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Log Time</h2>
        <p className="text-neutral-500">Record your clinical trial activities as {currentUser.role}.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        
        {/* Date & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Date</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Duration</label>
            {activeTimer ? (
              <div className="flex flex-col gap-2">
                 <div className="w-full px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center text-rose-700 shadow-sm">
                    <div className="flex items-center gap-2 font-mono font-medium text-base">
                      <Clock className="w-4 h-4 animate-pulse" />
                      {elapsedTimerStr}
                    </div>
                    <button
                      type="button"
                      onClick={handleStopTimer}
                      className="text-sm bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      Stop Timer
                    </button>
                 </div>
                 <button type="button" onClick={cancelTimer} className="text-xs text-rose-500 hover:text-rose-700 self-end mr-1 font-medium transition-colors">Cancel Timer</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">h</span>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    required
                    value={minutes}
                    onChange={e => setMinutes(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">m</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hierarchy: Project > Protocol > Site */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Project</label>
            <select 
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
              disabled={availableProjects.length === 0}
            >
              {availableProjects.length === 0 ? (
                <option value="">No Projects Assigned</option>
              ) : (
                availableProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Protocol</label>
            <select 
              value={protocolId}
              onChange={e => setProtocolId(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
              disabled={availableProtocols.length === 0}
            >
              {availableProtocols.length === 0 ? (
                <option value="">No Protocols</option>
              ) : (
                availableProtocols.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Site (Optional)</label>
            <select 
              value={siteId}
              onChange={e => setSiteId(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
              disabled={availableSites.length === 0}
            >
              <option value="">N/A or General</option>
              {availableSites.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.country})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Category</label>
          <select 
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
          >
            {availableCategories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              availableCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            )}
          </select>
        </div>

        {/* Activity Task */}
        {currentCategory && currentCategory.tasks.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-900">Specific Activity</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCategory.tasks.map(task => {
                const isActive = activityId === task.id;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setActivityId(task.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-start gap-3 ${
                      isActive 
                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500" 
                        : "border-neutral-200 bg-white hover:border-indigo-200 hover:bg-neutral-50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {getTaskIcon(task.name)}
                    </div>
                    <div className="flex flex-col mt-0.5">
                      <span className={`text-sm font-semibold ${isActive ? 'text-indigo-900' : 'text-neutral-700'}`}>
                        {task.name}
                      </span>
                      {task.subTasks && task.subTasks.length > 0 && (
                        <span className="text-xs text-neutral-500 mt-0.5">
                          {task.subTasks.length} sub-tasks
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub Task */}
        {currentCategory && currentCategory.tasks.find(t => t.id === activityId)?.subTasks && (
          <div className="space-y-3 mt-6 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
            <label className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Select Sub-Task
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentCategory.tasks.find(t => t.id === activityId)?.subTasks?.map(subTask => {
                const isActive = subTaskId === subTask.id;
                return (
                  <button
                    key={subTask.id}
                    type="button"
                    onClick={() => setSubTaskId(subTask.id)}
                    className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-3 ${
                      isActive 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-500" 
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200 hover:bg-emerald-50/50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isActive ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300'}`}>
                      {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="leading-tight">{subTask.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Notes (Optional)</label>
          <textarea 
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add any additional details..."
            className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-neutral-100">
          <button
            type="submit"
            disabled={isSubmitting || availableCategories.length === 0 || !activityId}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {isSubmitting ? "Saving..." : "Save Activity"}
          </button>
        </div>
      </form>
    </div>
  );
}
