import React, { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { 
  LogEntry, 
  UserProfile, 
  Project, 
  Protocol, 
  Site, 
  ROLE_HIERARCHY 
} from "@/lib/types";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Users, 
  Phone, 
  Database, 
  ShieldCheck, 
  Stethoscope, 
  ClipboardCheck, 
  Activity, 
  Sparkles 
} from "lucide-react";
import { toast } from "sonner";
import { parseNaturalLanguageLog } from "@/lib/actions";

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
  onAddLog: (log: Omit<LogEntry, "id" | "synced" | "user_id" | "user_profiles" | "created_at" | "updated_at">) => void;
  onSuccess: () => void;
  profile: UserProfile | null;
  projects: Project[];
  protocols: Protocol[];
  sites: Site[];
  initialData?: Partial<LogEntry> | null;
}

export function LogFormView({ 
  onAddLog, 
  onSuccess, 
  profile, 
  projects, 
  protocols, 
  sites, 
  initialData 
}: LogFormViewProps) {
  const { t, language } = useTranslation();
    const [date, setDate] = useState(initialData?.date || format(new Date(), "yyyy-MM-dd"));
  const [hours, setHours] = useState(initialData?.duration_minutes ? Math.floor(initialData.duration_minutes / 60).toString() : "1");
  const [minutes, setMinutes] = useState(initialData?.duration_minutes ? (initialData.duration_minutes % 60).toString() : "0");
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialData?.project_id ?? null);
  const projectId = projects.some(p => p.id === selectedProjectId)
    ? (selectedProjectId as string)
    : (projects.length > 0 ? projects[0].id : "");

  const availableProtocols = useMemo(() => {
    return protocols.filter(p => p.project_id === projectId);
  }, [projectId, protocols]);

  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(initialData?.protocol_id ?? null);
  const protocolId = availableProtocols.some(p => p.id === selectedProtocolId)
    ? (selectedProtocolId as string)
    : (availableProtocols.length > 0 ? availableProtocols[0].id : "");

  const availableSites = useMemo(() => {
    return sites.filter(s => s.protocol_id === protocolId);
  }, [protocolId, sites]);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(initialData?.site_id ?? null);
  const siteId = selectedSiteId === ""
    ? ""
    : (availableSites.some(s => s.id === selectedSiteId)
      ? (selectedSiteId as string)
      : (availableSites.length > 0 ? availableSites[0].id : ""));

  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [aiInput, setAiInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const availableCategories = useMemo(() => {
    if (!profile?.role) return [];
    return ROLE_HIERARCHY[profile.role] || [];
  }, [profile?.role]);

  const initialCategory = availableCategories.find(c => c.name === initialData?.category);
  const initialTask = initialCategory?.tasks.find(t => t.name === initialData?.activity);
  const initialSubTask = initialTask?.subTasks?.find(s => s.name === initialData?.sub_task);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategory?.id ?? null);
  const categoryId = availableCategories.some(c => c.id === selectedCategoryId)
    ? (selectedCategoryId as string)
    : (availableCategories.length > 0 ? availableCategories[0].id : "");

  const currentCategory = availableCategories.find(c => c.id === categoryId);
  const availableTasks = currentCategory?.tasks || [];

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(initialTask?.id ?? null);
  const activityId = availableTasks.some(t => t.id === selectedActivityId)
    ? (selectedActivityId as string)
    : (availableTasks.length > 0 ? availableTasks[0].id : "");

  const currentTask = availableTasks.find(t => t.id === activityId);
  const availableSubTasks = currentTask?.subTasks || [];

  const [selectedSubTaskId, setSelectedSubTaskId] = useState<string | null>(initialSubTask?.id ?? null);
  const subTaskId = availableSubTasks.some(s => s.id === selectedSubTaskId)
    ? (selectedSubTaskId as string)
    : (availableSubTasks.length > 0 ? availableSubTasks[0].id : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const duration_minutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    
    if (duration_minutes <= 0) {
      toast.error(t.toasts.validationErrorTitle, { description: t.toasts.validationErrorDesc });
      setIsSubmitting(false);
      return;
    }

    if (!projectId || !protocolId) {
      toast.error(t.toasts.missingFieldsTitle, { description: t.toasts.missingFieldsDesc });
      setIsSubmitting(false);
      return;
    }

    if (!categoryId || !activityId) {
      toast.error(t.toasts.missingFieldsTitle, { description: t.toasts.missingFieldsDesc });
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
      duration_minutes,
      project_id: projectId,
      protocol_id: protocolId,
      site_id: siteId,
      role: profile?.role || "crc",
      category: categoryName,
      activity: activityName,
      sub_task: subTaskName,
      notes
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 500);
  };


  const handleAIParsing = async () => {
    if (!aiInput.trim() || !profile) return;
    setIsParsing(true);
    try {
      const result = await parseNaturalLanguageLog(
        aiInput,
        profile.role,
        projects,
        protocols
      );
      
      if (result.success && result.data) {
        const data = result.data;
        if (data.duration_minutes) {
          setHours(Math.floor(data.duration_minutes / 60).toString());
          setMinutes((data.duration_minutes % 60).toString());
        }
        if (data.project_id) setSelectedProjectId(data.project_id);
        if (data.protocol_id) setSelectedProtocolId(data.protocol_id);
        
        if (data.category) {
          const cat = availableCategories.find(c => c.name.toLowerCase() === data.category?.toLowerCase());
          if (cat) {
            setSelectedCategoryId(cat.id);
            if (data.activity) {
              const act = cat.tasks.find(t => t.name.toLowerCase() === data.activity?.toLowerCase());
              if (act) {
                setSelectedActivityId(act.id);
                if (data.sub_task) {
                  const sub = act.subTasks?.find(s => s.name.toLowerCase() === data.sub_task?.toLowerCase());
                  if (sub) setSelectedSubTaskId(sub.id);
                }
              }
            }
          }
        }
        if (data.notes) setNotes(data.notes);
        toast.success(t.toasts.aiSuccessTitle, { description: t.toasts.aiSuccessDesc });
        setAiInput("");
      } else {
        toast.error(t.toasts.aiErrorTitle, { description: !result.success && result.error ? result.error : t.toasts.aiErrorDesc });
      }
    } catch (error) {
      toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{t.logForm.title}</h2>
        <p className="text-neutral-500">{t.logForm.subtitle} {profile?.role?.replace('_', ' ')}.</p>
      </header>

      {/* AI Smart Logging */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-semibold text-indigo-900">{t.logForm.aiSmartLogging}</h3>
        </div>
        <p className="text-xs text-indigo-700/80 mb-4">
          Describe what you did in natural language, and let AI fill out the form for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAIParsing()}
            placeholder='e.g., "Spent 2 hours doing remote monitoring for site 01 on protocol 101"'
            className="flex-1 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm shadow-sm"
          />
          <button
            type="button"
            onClick={handleAIParsing}
            disabled={isParsing || !aiInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0"
          >
            {isParsing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-Fill
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        
        {/* Date & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">{t.logForm.date}</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">{t.logForm.duration}</label>
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{t.logForm.hours}</span>
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{t.logForm.minutes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hierarchy: Project > Protocol > Site */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">{t.logForm.project}</label>
            <select 
              value={projectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
              disabled={projects.length === 0}
            >
              {projects.length === 0 ? (
                <option value="">No Projects Assigned</option>
              ) : (
                projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">{t.logForm.protocol}</label>
            <select 
              value={protocolId}
              onChange={e => setSelectedProtocolId(e.target.value)}
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
            <label className="text-sm font-medium text-neutral-700">{t.logForm.siteOptional}</label>
            <select 
              value={siteId}
              onChange={e => setSelectedSiteId(e.target.value)}
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
          <label className="text-sm font-medium text-neutral-700">{t.logForm.category}</label>
          <select 
            value={categoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
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
            <label className="text-sm font-semibold text-neutral-900">{t.logForm.specificActivity}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCategory.tasks.map(task => {
                const isActive = activityId === task.id;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedActivityId(task.id)}
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
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isActive ? 'text-indigo-900' : 'text-neutral-700'}`}>
                          {task.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {task.roleContext && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            task.roleContext === 'site_led' ? 'bg-emerald-100 text-emerald-700' :
                            task.roleContext === 'cro_led' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {task.roleContext === 'site_led' ? 'Site-Led' : task.roleContext === 'cro_led' ? 'CRO-Led' : 'Shared'}
                          </span>
                        )}
                        {task.subTasks && task.subTasks.length > 0 && (
                          <span className="text-xs text-neutral-500">
                            {task.subTasks.length} sub-tasks
                          </span>
                        )}
                      </div>
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
                    onClick={() => setSelectedSubTaskId(subTask.id)}
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
          <label className="text-sm font-medium text-neutral-700">{t.logForm.notesOptional}</label>
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
