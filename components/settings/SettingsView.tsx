import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useDynamicTranslation } from "@/lib/i18n/utils";
import { UserProfile } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Settings, Save, Plus, Trash2, Edit2 , Wrench } from "lucide-react";
import { toast } from "sonner";
import { exportUserData } from "@/lib/exportData";
import { Download } from "lucide-react";

interface SettingsViewProps {
  profile: UserProfile;
}

export function SettingsView({ profile }: SettingsViewProps) {
  const { activityCategories } = useAppStore();
  const [activeTab, setActiveTab] = useState<"activities" | "general">(profile.role === "super_admin" || profile.role === "manager" ? "activities" : "general");
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const { dt } = useDynamicTranslation();

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportUserData(profile, t);
    } finally {
      setIsExporting(false);
    }
  };



  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            {t.settings.title}
          </h2>
          <p className="text-neutral-500">
            {t.settings.subtitle}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("activities")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "activities"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {t.settings.activitiesAndRoles}
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "general"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {t.settings.generalSettings}
        </button>
      </div>

      {(activeTab === "activities" && (profile.role === "super_admin" || profile.role === "manager")) && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900">
              {t.settings.activityCategories}
            </h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              {t.settings.newCategory}
            </button>
          </div>

          <div className="space-y-4">
            {activityCategories.map((cat: any) => (
              <div
                key={cat.id}
                className="border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-neutral-900">{dt(cat.name)}</h4>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {cat.category_roles?.map((cr: any) => (
                    <span
                      key={cr.role}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800"
                    >
                      {cr.role}
                    </span>
                  ))}
                  <button className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-dashed border-neutral-300 text-neutral-500 hover:bg-neutral-50">
                    <Plus className="w-3 h-3 mr-1" /> {t.settings.addRole}
                  </button>
                </div>

                <div className="pl-4 border-l-2 border-neutral-100 space-y-3">
                  {cat.activity_tasks?.map((task: any) => (
                    <div key={task.id} className="text-sm">
                      <div className="flex items-center justify-between group">
                        <span className="font-medium text-neutral-700">
                          {dt(task.name)}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="text-xs text-indigo-600 hover:underline">{t.common.edit}</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {task.activity_subtasks?.map((st: any) => (
                          <span
                            key={st.id}
                            className="inline-flex items-center px-2 py-1 rounded bg-neutral-50 border border-neutral-200 text-xs text-neutral-600"
                          >
                            {dt(st.name)}
                          </span>
                        ))}
                        <button className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border border-dashed border-neutral-300 text-neutral-500 hover:bg-neutral-50">
                          <Plus className="w-3 h-3 mr-1" /> {t.settings.addSubTask}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    {t.settings.newTask}
                  </button>
                </div>
              </div>
            ))}

            {activityCategories.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <p>{t.settings.noCategories}</p>
              </div>
            )}
          </div>
        </div>
      )}
            {(activeTab === "general" || (activeTab === "activities" && profile.role !== "super_admin" && profile.role !== "manager")) && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              {t.settings.exportMyData}
            </h3>
            <p className="text-sm text-neutral-500 mb-4 max-w-2xl">
              {t.settings.exportMyDataDesc}
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              {isExporting ? t.common.loading : t.settings.exportMyData}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              {t.settings.underConstruction}
            </h3>
            <p className="text-neutral-500 max-w-md">
              {t.settings.generalSettingsDesc}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
