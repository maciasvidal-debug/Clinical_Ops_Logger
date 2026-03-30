import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useDynamicTranslation } from '@/lib/i18n/utils';
import { ActivityCategory } from '@/lib/types';
import {
  FileText,
  Users,
  Phone,
  Database,
  ShieldCheck,
  Stethoscope,
  ClipboardCheck,
  Activity
} from "lucide-react";

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

interface TaskSelectionProps {
  currentCategory?: ActivityCategory;
  activityId: string;
  setSelectedActivityId: (val: string) => void;
}

export function TaskSelection({
  currentCategory,
  activityId,
  setSelectedActivityId
}: TaskSelectionProps) {
  const { t } = useTranslation();
  const { dt } = useDynamicTranslation();

  if (!currentCategory || currentCategory.tasks.length === 0) return null;

  return (
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
                    {dt(task.name)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {task.roleContext && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      task.roleContext === 'site_led' ? 'bg-emerald-100 text-emerald-700' :
                      task.roleContext === 'cro_led' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.roleContext === 'site_led' ? 'Sitio' : task.roleContext === 'cro_led' ? t.logForm.croLed : t.logForm.shared}
                    </span>
                  )}
                  {task.subTasks && task.subTasks.length > 0 && (
                    <span className="text-xs text-neutral-500">
                      {task.subTasks.length} {t.logForm.subTasks}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
