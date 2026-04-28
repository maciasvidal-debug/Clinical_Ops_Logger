import React, { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { LogEntry, UserProfile, Project, Protocol, Site, DbActivityCategory, DbActivityTask, DbActivitySubtask, UserRole } from "@/lib/types";
import { format } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { parseNaturalLanguageLog } from "@/lib/actions";

import { AISmartLogging } from "./form/AISmartLogging";
import { DateDurationFields } from "./form/DateDurationFields";
import { HierarchyFields } from "./form/HierarchyFields";
import { CategorySelection } from "./form/CategorySelection";
import { TaskSelection } from "./form/TaskSelection";
import { SubTaskSelection } from "./form/SubTaskSelection";

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
  const { activityCategories } = useAppStore();
  const { t } = useTranslation();

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

  const availableCategories: import('@/lib/types').ActivityCategory[] = useMemo(() => {
    if (!profile?.role || !activityCategories) return [];

    return activityCategories
      .filter((cat: DbActivityCategory) => {
        if (!cat.category_roles || cat.category_roles.length === 0) return true;
        return cat.category_roles.some((cr: { role: UserRole }) => cr.role === profile.role);
      })
      .map((cat: DbActivityCategory) => ({
        id: cat.id,
        name: cat.name,
        tasks: (cat.activity_tasks || []).filter((t: DbActivityTask) => {
          if (!t.task_roles || t.task_roles.length === 0) return true;
          return t.task_roles.some((tr: { role: UserRole }) => tr.role === profile.role);
        }).map((t: DbActivityTask) => ({
          id: t.id,
          name: t.name,
          roleContext: t.role_context,
          subTasks: (t.activity_subtasks || []).map((st: DbActivitySubtask) => ({
            id: st.id,
            name: st.name
          }))
        }))
      })).filter((cat: import('@/lib/types').ActivityCategory) => cat.tasks.length > 0);
  }, [profile?.role, activityCategories]);

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
        <p className="text-neutral-500 font-medium">{t.logForm.subtitle} {profile?.role?.replace('_', ' ')}.</p>
      </header>

      <AISmartLogging
        aiInput={aiInput}
        setAiInput={setAiInput}
        isParsing={isParsing}
        handleAIParsing={handleAIParsing}
      />

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        
        <DateDurationFields
          date={date}
          setDate={setDate}
          hours={hours}
          setHours={setHours}
          minutes={minutes}
          setMinutes={setMinutes}
        />

        <HierarchyFields
          projects={projects}
          availableProtocols={availableProtocols}
          availableSites={availableSites}
          projectId={projectId}
          setSelectedProjectId={setSelectedProjectId}
          protocolId={protocolId}
          setSelectedProtocolId={setSelectedProtocolId}
          siteId={siteId}
          setSelectedSiteId={setSelectedSiteId}
        />

        <CategorySelection
          availableCategories={availableCategories}
          categoryId={categoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />

        <TaskSelection
          currentCategory={currentCategory}
          activityId={activityId}
          setSelectedActivityId={setSelectedActivityId}
        />

        <SubTaskSelection
          currentCategory={currentCategory}
          activityId={activityId}
          subTaskId={subTaskId}
          setSelectedSubTaskId={setSelectedSubTaskId}
        />

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
            {isSubmitting ? t.common.loading : t.logForm.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
