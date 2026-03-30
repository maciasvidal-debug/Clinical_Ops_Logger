import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useDynamicTranslation } from '@/lib/i18n/utils';
import { ActivityCategory } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

interface SubTaskSelectionProps {
  currentCategory?: ActivityCategory;
  activityId: string;
  subTaskId: string;
  setSelectedSubTaskId: (val: string) => void;
}

export function SubTaskSelection({
  currentCategory,
  activityId,
  subTaskId,
  setSelectedSubTaskId
}: SubTaskSelectionProps) {
  const { t } = useTranslation();
  const { dt } = useDynamicTranslation();

  const currentTask = currentCategory?.tasks.find(t => t.id === activityId);

  if (!currentCategory || !currentTask?.subTasks) return null;

  return (
    <div className="space-y-3 mt-6 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
      <label className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        {t.logForm.selectSubTask}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {currentTask.subTasks.map(subTask => {
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
              <span className="leading-tight">{dt(subTask.name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
