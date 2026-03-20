import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { createActivityCategory, addCategoryRole, createActivityTask, createActivitySubtask } from "@/lib/actions_config";
import { toast } from "sonner";
import { UserRole } from "@/lib/types";
import { Check, ChevronRight, Loader2, Plus, Trash2, X } from "lucide-react";

interface CategoryWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function CategoryWizard({ onComplete, onCancel }: CategoryWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Category Name
  const [categoryName, setCategoryName] = useState("");

  // Step 2: Roles
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const availableRoles: UserRole[] = ["super_admin", "manager", "crc", "cra", "data_entry", "recruitment_specialist", "retention_specialist", "cta", "ra"];

  // Step 3: Tasks and Subtasks
  const [tasks, setTasks] = useState<{ id: string; name: string; subtasks: string[] }[]>([]);
  const [currentTaskName, setCurrentTaskName] = useState("");
  const [currentSubtaskName, setCurrentSubtaskName] = useState("");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleAddTask = () => {
    if (!currentTaskName.trim()) return;
    setTasks(prev => [...prev, { id: crypto.randomUUID(), name: currentTaskName.trim(), subtasks: [] }]);
    setCurrentTaskName("");
  };

  const handleAddSubtask = (taskId: string) => {
    if (!currentSubtaskName.trim()) return;
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, subtasks: [...t.subtasks, currentSubtaskName.trim()] } : t
    ));
    setCurrentSubtaskName("");
    setActiveTaskId(null);
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const removeSubtask = (taskId: string, subtaskIndex: number) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, subtasks: t.subtasks.filter((_, i) => i !== subtaskIndex) } : t
    ));
  };

  const handleSave = async () => {
    if (!categoryName.trim()) return;
    setLoading(true);

    try {
      // 1. Create Category
      const catRes = await createActivityCategory(categoryName.trim());
      if (!catRes.success || !catRes.data) throw new Error(catRes.error || "Failed to create category");
      const catId = catRes.data.id;

      // 2. Add Roles concurrently
      if (selectedRoles.length > 0) {
        await Promise.all(selectedRoles.map(role => addCategoryRole(catId, role)));
      }

      // 3. Create Tasks and Subtasks sequentially to maintain referential integrity
      for (const task of tasks) {
        const taskRes = await createActivityTask(catId, task.name);
        if (taskRes.success && taskRes.data) {
          const taskId = taskRes.data.id;
          if (task.subtasks.length > 0) {
             await Promise.all(task.subtasks.map(stName => createActivitySubtask(taskId, stName)));
          }
        }
      }

      toast.success("Category created successfully");
      onComplete();
    } catch (error: any) {
      toast.error("Error saving category", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{t.settings.categoryWizardTitle}</h3>
            <p className="text-xs text-neutral-500">Step {step} of 3</p>
          </div>
          <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-100 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* STEP 1: Name */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <label className="block text-sm font-medium text-neutral-700">{t.settings.categoryName}</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-lg"
                placeholder={t.settings.categoryName}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && categoryName.trim() && setStep(2)}
              />
            </div>
          )}

          {/* STEP 2: Roles */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-700">{t.settings.allowedRoles}</h4>
                <p className="text-xs text-neutral-500 mb-4">{t.settings.allowedRolesDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {availableRoles.map(role => (
                  <label key={role} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedRoles.includes(role) ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${selectedRoles.includes(role) ? 'bg-indigo-600 border-indigo-600' : 'border-neutral-300'}`}>
                      {selectedRoles.includes(role) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-neutral-800">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Tasks and Subtasks */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-700">{t.settings.optionalTasks}</h4>
                <p className="text-xs text-neutral-500 mb-4">{t.settings.optionalTasksDesc}</p>
              </div>

              {/* Add Task Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={currentTaskName}
                  onChange={(e) => setCurrentTaskName(e.target.value)}
                  placeholder={t.settings.taskNamePlaceholder}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button
                  onClick={handleAddTask}
                  disabled={!currentTaskName.trim()}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="border border-neutral-200 rounded-xl p-3 bg-neutral-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-neutral-800 text-sm">{task.name}</span>
                      <button onClick={() => removeTask(task.id)} className="text-neutral-400 hover:text-red-500 p-1 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtasks */}
                    <div className="pl-3 border-l-2 border-indigo-100 ml-1 space-y-2 mt-2">
                      {task.subtasks.map((st, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-white border border-neutral-100 px-2 py-1.5 rounded-md">
                          <span className="text-neutral-600">{st}</span>
                          <button onClick={() => removeSubtask(task.id, i)} className="text-neutral-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {activeTaskId === task.id ? (
                        <div className="flex gap-1 mt-2">
                          <input
                            type="text"
                            value={currentSubtaskName}
                            onChange={(e) => setCurrentSubtaskName(e.target.value)}
                            placeholder={t.settings.subTaskNamePlaceholder}
                            className="flex-1 px-2 py-1 text-xs border border-indigo-300 rounded focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddSubtask(task.id);
                              if (e.key === 'Escape') setActiveTaskId(null);
                            }}
                          />
                          <button onClick={() => handleAddSubtask(task.id)} className="text-green-600 hover:bg-green-50 px-1 rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setActiveTaskId(null)} className="text-red-600 hover:bg-red-50 px-1 rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveTaskId(task.id)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1"
                        >
                          <Plus className="w-3 h-3" /> {t.settings.addSubTaskBtn}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1) as any)}
            className={`px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors ${step === 1 ? 'invisible' : ''}`}
          >
            {t.settings.backToEdit || 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(prev => Math.min(3, prev + 1) as any)}
              disabled={step === 1 && !categoryName.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {t.settings.continue} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {loading ? t.settings.saving : t.settings.confirmAndSave}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}