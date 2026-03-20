"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { useDynamicTranslation } from "@/lib/i18n/utils";
import { UserProfile, UserRole } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import {
  Settings, Plus, Trash2, Edit2, Check, X, Users,
  Download, AlertTriangle, ChevronDown, Layers,
  ClipboardList, Wrench,
} from "lucide-react";
import {
  createActivityCategory, updateActivityCategory, deleteActivityCategory,
  createActivityTask, updateActivityTask, deleteActivityTask,
  createActivitySubtask, updateActivitySubtask, deleteActivitySubtask,
  addCategoryRole, removeCategoryRole,
} from "@/lib/actions_config";
import { toast } from "sonner";
import { exportUserData } from "@/lib/exportData";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { StructureWizard } from "./StructureWizard";

type SettingsTab = "activities" | "general" | "structure";

type WizardStep = 1 | 2 | 3;

interface CategoryWizardState {
  name: string;
  description: string;
  selectedRoles: UserRole[];
  tasks: { name: string; role_context: "site_led" | "cro_led" | "shared" | null; staff_roles: string[] }[];
}

const ALL_ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: "crc",                   label: "crc",                   desc: "Clinical Research Coord." },
  { role: "cra",                   label: "cra",                   desc: "Clinical Research Assoc." },
  { role: "manager",               label: "manager",               desc: "Site Manager" },
  { role: "cta",                   label: "cta",                   desc: "Clinical Trial Asst." },
  { role: "data_entry",            label: "data_entry",            desc: "Data Entry" },
  { role: "ra",                    label: "ra",                    desc: "Regulatory Affairs" },
  { role: "recruitment_specialist",label: "recruitment_specialist",desc: "Recruitment" },
  { role: "retention_specialist",  label: "retention_specialist",  desc: "Retention" },
];

interface SettingsViewProps {
  profile: UserProfile;
}

export function SettingsView({ profile }: SettingsViewProps) {
  const { activityCategories, refreshActivitiesConfig } = useAppStore();
  const { t } = useTranslation();
  const { dt } = useDynamicTranslation();

  const isPrivileged =
    profile.role === "super_admin" || profile.role === "manager";

  const [activeTab, setActiveTab] = useState<SettingsTab>(
    isPrivileged ? "activities" : "general"
  );

  useEffect(() => {
    if (isPrivileged) {
      refreshActivitiesConfig();
    }
  }, [isPrivileged, refreshActivitiesConfig]);

  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editRoleContext, setEditRoleContext] = useState<"site_led" | "cro_led" | "shared" | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [creatingTaskInCat, setCreatingTaskInCat] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskRoleCtx, setNewTaskRoleCtx] = useState<"site_led" | "cro_led" | "shared" | null>(null);
  const [newTaskStaffRoles, setNewTaskStaffRoles] = useState<string[]>([]);

  const [editStaffRoles, setEditStaffRoles] = useState<string[]>([]);

  const [wizardOpen, setWizardOpen]   = useState(false);
  const [wizardStep, setWizardStep]   = useState<WizardStep>(1);
  const [wizardData, setWizardData]   = useState<CategoryWizardState>({
    name: "", description: "", selectedRoles: [], tasks: [{ name: "", role_context: null, staff_roles: [] }],
  });

  const [isExporting, setIsExporting]         = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openWizard = () => {
    setWizardData({ name: "", description: "", selectedRoles: [], tasks: [{ name: "", role_context: null, staff_roles: [] }] });
    setWizardStep(1);
    setWizardOpen(true);
  };

  const closeWizard = () => setWizardOpen(false);

  const wizardNext = () => {
    if (wizardStep < 3) setWizardStep((s) => (s + 1) as WizardStep);
  };

  const wizardBack = () => {
    if (wizardStep > 1) setWizardStep((s) => (s - 1) as WizardStep);
  };

  const toggleWizardRole = (role: UserRole) => {
    setWizardData((prev) => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter((r) => r !== role)
        : [...prev.selectedRoles, role],
    }));
  };

  const addWizardTask = () =>
    setWizardData((prev) => ({ ...prev, tasks: [...prev.tasks, { name: "", role_context: null, staff_roles: [] }] }));

  const removeWizardTask = (idx: number) =>
    setWizardData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== idx),
    }));

  const updateWizardTask = (idx: number, updates: Partial<{ name: string; role_context: "site_led" | "cro_led" | "shared" | null; staff_roles: string[] }>) =>
    setWizardData((prev) => {
      const tasks = [...prev.tasks];
      tasks[idx] = { ...tasks[idx], ...updates };
      return { ...prev, tasks };
    });

  const handleWizardSubmit = async () => {
    const catRes = await createActivityCategory(wizardData.name.trim());
    if (!catRes.success || !catRes.data) {
      toast.error(catRes.error ?? "Error al crear la categoría", {
        description: "Intenta de nuevo o contacta soporte"
      });
      return;
    }
    const catId: string = catRes.data.id;

    await Promise.all(
      wizardData.selectedRoles.map((role) => addCategoryRole(catId, role))
    );

    const validTasks = wizardData.tasks.filter((t) => t.name.trim());
    await Promise.all(
      validTasks.map((task) => createActivityTask(catId, task.name.trim(), task.role_context, task.staff_roles))
    );

    toast.success("Categoría creada exitosamente", {
      description: `Se crearon ${validTasks.length} tareas asociadas.`
    });
    await refreshActivitiesConfig();
    closeWizard();
  };

  const startEditing = (id: string, currentValue: string, roleContext?: "site_led" | "cro_led" | "shared" | null, staffRoles: string[] = []) => {
    setEditingId(id);
    setEditValue(currentValue);
    setEditRoleContext(roleContext || null);
    setEditStaffRoles(staffRoles || []);
  };


  const saveNewTask = async (categoryId: string) => {
    if (!newTaskName.trim()) {
      setCreatingTaskInCat(null);
      return;
    }
    const res = await createActivityTask(categoryId, newTaskName, newTaskRoleCtx, newTaskStaffRoles);
    if (res.success) {
      toast.success("Tarea añadida");
      setNewTaskName("");
      setNewTaskRoleCtx(null);
      setNewTaskStaffRoles([]);
      setCreatingTaskInCat(null);
      await refreshActivitiesConfig();
    } else {
      toast.error(res.error || "Error al añadir");
    }
  };

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditValue("");
    setEditRoleContext(null);
  }, []);

  const saveEditing = async (
    id: string,
    type: "category" | "task" | "subtask"
  ) => {
    if (!editValue.trim()) return cancelEditing();
    let res;
    if (type === "category") res = await updateActivityCategory(id, editValue);
    else if (type === "task") res = await updateActivityTask(id, editValue, editRoleContext, editStaffRoles);
    else res = await updateActivitySubtask(id, editValue);

    if (res?.success) {
      toast.success("Actualizado");
      await refreshActivitiesConfig();
      cancelEditing();
    } else {
      toast.error(res?.error ?? "Error al actualizar");
    }
  };

  const handleDelete = async (
    id: string,
    type: "category" | "task" | "subtask",
    name: string
  ) => {
    if (
      !confirm(
        `¿Eliminar "${name}"? Esto no afectará registros existentes.`
      )
    ) return;

    setIsDeleting(id);
    let res;
    if (type === "category") res = await deleteActivityCategory(id);
    else if (type === "task") res = await deleteActivityTask(id);
    else res = await deleteActivitySubtask(id);
    setIsDeleting(null);

    if (res?.success) {
      toast.success("Eliminado");
      await refreshActivitiesConfig();
    } else {
      toast.error(res?.error ?? "Error al eliminar");
    }
  };

  const handleRemoveRole = async (categoryId: string, role: string) => {
    if (!confirm(`¿Quitar rol "${role}" de esta categoría?`)) return;
    const res = await removeCategoryRole(categoryId, role as UserRole);
    if (res.success) {
      toast.success("Rol removido");
      await refreshActivitiesConfig();
    } else {
      toast.error(res.error ?? "Error");
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportUserData(profile, t);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tabClass = (tab: SettingsTab) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
      activeTab === tab
        ? "bg-white text-indigo-700 shadow-sm font-semibold"
        : "text-neutral-600 hover:text-neutral-900"
    }`;

  // Role pill styles mimicking the design
  const getRoleBadgeClasses = (roleStr: string) => {
    switch (roleStr) {
      case "crc": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cra": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "manager": return "bg-purple-100 text-purple-800 border-purple-200";
      case "cta": return "bg-amber-100 text-amber-800 border-amber-200";
      case "data_entry": return "bg-slate-100 text-slate-800 border-slate-200";
      case "ra": return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200";
      default: return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          {t.settings?.title ?? "Configuración del Sistema"}
        </h2>
        <p className="text-neutral-500 text-sm mt-1">
          {t.settings?.subtitle ?? "Administra categorías, actividades y preferencias del equipo"}
        </p>
      </header>

      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl w-fit mb-4">
        {isPrivileged && (
          <button onClick={() => setActiveTab("activities")} className={tabClass("activities")}>
            <ClipboardList className="w-4 h-4" />
            Actividades
          </button>
        )}
        <button onClick={() => setActiveTab("general")} className={tabClass("general")}>
          <Wrench className="w-4 h-4" />
          General
        </button>
        {profile.role === "super_admin" && (
          <button onClick={() => setActiveTab("structure")} className={tabClass("structure")}>
            <Layers className="w-4 h-4" />
            Structure
          </button>
        )}
      </div>

      {activeTab === "activities" && isPrivileged && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                Categorías de Actividades
              </h3>
              <p className="text-[13px] text-neutral-500 mt-1 font-mono">
                Jerarquía: Categorías → Tareas → Sub-tareas
              </p>
            </div>
            <button
              onClick={openWizard}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>

          <div className="space-y-3">
            {activityCategories.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <p className="text-sm font-medium text-neutral-600">No hay categorías configuradas</p>
                <p className="text-[13px] text-neutral-400 mt-1">Comienza creando una nueva categoría.</p>
              </div>
            ) : (
              activityCategories.map((cat: any) => (
                <div key={cat.id} className="border border-neutral-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors group/cat">
                  <div
                    className="flex items-center justify-between px-5 py-3.5 bg-white cursor-pointer select-none"
                    onClick={() => toggleCat(cat.id)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold w-56"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditing(cat.id, "category");
                              if (e.key === "Escape") cancelEditing();
                            }}
                          />
                          <button onClick={() => saveEditing(cat.id, "category")} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEditing} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-neutral-900">{dt(cat.name)}</span>
                          <span className="ml-2 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full font-mono">
                            {cat.activity_tasks?.length ?? 0} tareas
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="opacity-0 group-hover/cat:opacity-100 transition-opacity flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => startEditing(cat.id, cat.name)} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors" title="Editar">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(cat.id, "category", cat.name)} disabled={isDeleting === cat.id} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${expandedCats.has(cat.id) ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5 border-t border-neutral-100 bg-white">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mr-1">Roles:</span>
                    {cat.category_roles?.length > 0 ? (
                      cat.category_roles.map((cr: any) => (
                        <span key={cr.role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono border ${getRoleBadgeClasses(cr.role)}`}>
                          {cr.role}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic">Todos los roles</span>
                    )}
                    <button onClick={() => toast.info("Edita la categoría para cambiar roles")} className="w-5 h-5 rounded-full border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors ml-1">
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {expandedCats.has(cat.id) && (
                    <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] font-semibold text-neutral-600">Tareas</span>
                        <button onClick={() => setCreatingTaskInCat(cat.id)} className="text-[12px] font-medium text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                          <Plus className="w-3 h-3" /> Añadir Tarea
                        </button>
                      </div>

                      <div className="space-y-2">
                        {cat.activity_tasks?.map((task: any) => (
                          <div key={task.id} className="flex items-start justify-between p-2.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 hover:shadow-sm transition-all group/task">
                            <div className="flex-1">
                              {editingId === task.id ? (
                                <div className="flex items-center gap-2 mb-1">
                                  <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="px-2 py-1 text-[13px] border border-indigo-300 rounded focus:outline-none w-48 font-medium" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEditing(task.id, "task"); if (e.key === "Escape") cancelEditing(); }} />
                                  <select value={editRoleContext || ""} onChange={(e) => setEditRoleContext(e.target.value ? (e.target.value as any) : null)} className="px-2 py-1 text-[12px] border border-neutral-300 rounded focus:outline-none bg-white font-medium text-neutral-600">
                                    <option value="">Sin Rol</option>
                                    <option value="site_led">Sitio</option>
                                    <option value="cro_led">CRO</option>
                                    <option value="shared">Compartido</option>
                                  </select>
                                  <div className="relative group/popover">
                                    <button type="button" className="px-2 py-1 flex items-center gap-1 text-[12px] border border-neutral-300 rounded focus:outline-none bg-white font-medium text-neutral-600 hover:bg-neutral-50">
                                      <Users className="w-3.5 h-3.5" />
                                      {editStaffRoles.length === 0 ? "Staff Roles" : `${editStaffRoles.length} roles`}
                                    </button>
                                    <div className="absolute top-full mt-1 left-0 w-48 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-lg shadow-lg opacity-0 invisible group-hover/popover:opacity-100 group-hover/popover:visible transition-all z-10 p-2 grid grid-cols-1 gap-0.5">
                                      {ALL_ROLES.map(({ role, label }) => (
                                          <label key={role} className="flex items-center gap-2 p-1.5 hover:bg-neutral-50 rounded cursor-pointer">
                                            <input type="checkbox" checked={editStaffRoles.includes(role)} onChange={(e) => {
                                              if (e.target.checked) setEditStaffRoles([...editStaffRoles, role]);
                                              else setEditStaffRoles(editStaffRoles.filter(r => r !== role));
                                            }} className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-[12px] font-mono text-neutral-700">{label}</span>
                                          </label>
                                      ))}
                                    </div>
                                  </div>

                                  <button onClick={() => saveEditing(task.id, "task")} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check className="w-3 h-3" /></button>
                                  <button onClick={cancelEditing} className="text-red-600 p-1 hover:bg-red-50 rounded"><X className="w-3 h-3" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-[13px] font-medium text-neutral-900">{dt(task.name)}</div>
                                  {task.role_context && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                      task.role_context === 'site_led' ? 'bg-emerald-100 text-emerald-700' :
                                      task.role_context === 'cro_led' ? 'bg-amber-100 text-amber-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {task.role_context === 'site_led' ? 'Sitio' : task.role_context === 'cro_led' ? 'CRO' : 'Compartido'}
                                    </span>
                                  )}
                                  {task.task_roles && task.task_roles.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                                      <Users className="w-2.5 h-2.5" /> {task.task_roles.length} roles
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {task.activity_subtasks?.map((st: any) => (
                                  <span key={st.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono bg-neutral-100 border border-neutral-200 text-neutral-600 group/sub">
                                    {dt(st.name)}
                                  </span>
                                ))}
                                {editingId !== task.id && (
                                  <button onClick={() => toast.info("Añadir sub-tarea")} className="text-[11px] text-neutral-400 hover:text-indigo-600 font-medium font-mono px-2 py-0.5 border border-dashed border-neutral-300 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                                    + sub-tarea
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                              <button onClick={() => startEditing(task.id, task.name, task.role_context, task.task_roles?.map((tr: any) => tr.role) || [])} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(task.id, "task", task.name)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => toast.info("Nueva tarea")} className="w-full py-2 flex items-center justify-center gap-1.5 border-[1.5px] border-dashed border-neutral-300 rounded-lg text-[13px] font-medium text-neutral-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors mt-1">
                          <Plus className="w-3.5 h-3.5" /> Añadir tarea
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "structure" && profile.role === "super_admin" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <StructureWizard onComplete={() => setActiveTab("structure")} />
        </div>
      )}

      {activeTab === "general" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600" />
                Exportar Mis Datos
              </h3>
              <p className="text-[13px] text-neutral-500 max-w-xl leading-relaxed">
                Descarga tu historial completo. Exporta todos tus registros de tiempo, actividades y reportes en formato JSON. Compatible con herramientas de análisis clínico.
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13.5px] font-medium rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exportando..." : "Exportar datos"}
            </button>
          </div>

          <div className="bg-[#FFFAFA] rounded-2xl border border-red-200 p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-red-900">Zona de Peligro</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-[46px]">
              <div>
                <h4 className="text-[14px] font-semibold text-red-900 mb-1">Eliminar mi cuenta</h4>
                <p className="text-[13px] text-red-800/80 leading-relaxed max-w-md">
                  Esta acción es irreversible. Se revocará tu acceso y se anonimizarán tus datos personales, aunque se conservarán estadísticas del estudio.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-medium rounded-md transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar cuenta
              </button>
            </div>
          </div>
          <DeleteAccountModal profile={profile} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onSuccess={() => (window.location.href = "/login")} />
        </div>
      )}

      {/* CATEGORY WIZARD OVERLAY */}
      {wizardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/50 backdrop-blur-[3px] p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && closeWizard()}>
          <div className="bg-white rounded-[16px] w-full max-w-[520px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Steps indicator */}
            <div className="pt-7 px-8 pb-0">
              <div className="flex items-start">
                {[1, 2, 3].map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${wizardStep > step ? "bg-indigo-600 text-white" : wizardStep === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-neutral-100 text-neutral-400"}`}>
                        {wizardStep > step ? <Check className="w-[14px] h-[14px] stroke-[2.5px]" /> : step}
                      </div>
                      <span className="text-[11px] font-medium mt-1.5 text-neutral-400">{["Nombre", "Roles", "Tareas"][idx]}</span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-[2px] mx-2 mt-3.5 transition-colors duration-300 ${wizardStep > step ? "bg-indigo-600" : "bg-neutral-200"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Wizard body */}
            <div className="p-8 pb-6">
              {wizardStep === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">Nueva Categoría</h3>
                  <p className="text-[13px] text-neutral-500 mb-5">Asigna un nombre que identifique el tipo de actividad clínica.</p>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                      <input type="text" value={wizardData.name} onChange={(e) => setWizardData(p => ({ ...p, name: e.target.value }))} className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[14px] text-neutral-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="ej. Visitas de Monitoreo" autoFocus onKeyDown={(e) => e.key === "Enter" && wizardData.name.trim() && wizardNext()} />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">Descripción (opcional)</label>
                      <input type="text" value={wizardData.description} onChange={(e) => setWizardData(p => ({ ...p, description: e.target.value }))} className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[14px] text-neutral-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Breve descripción para el equipo" />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">Roles con acceso</h3>
                  <p className="text-[13px] text-neutral-500 mb-5">Sin selección = visible para todos los roles del equipo.</p>

                  <div className="grid grid-cols-2 gap-2">
                    {ALL_ROLES.map(({ role, label, desc }) => {
                      const sel = wizardData.selectedRoles.includes(role);
                      return (
                        <button key={role} onClick={() => toggleWizardRole(role)} className={`text-left p-2.5 border-[1.5px] rounded-lg transition-all ${sel ? "border-indigo-600 bg-indigo-50/50" : "border-neutral-200 bg-white hover:border-indigo-300"}`}>
                          <div className={`text-[12.5px] font-bold font-mono leading-none mb-1 ${sel ? "text-indigo-700" : "text-neutral-800"}`}>{label}</div>
                          <div className={`text-[11px] leading-tight ${sel ? "text-indigo-600/70" : "text-neutral-400"}`}>{desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">Tareas iniciales</h3>
                  <p className="text-[13px] text-neutral-500 mb-5">Opcional. Puedes agregar más tareas después desde el listado.</p>

                  <div className="flex flex-col gap-1.5">
                    {wizardData.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" value={task.name} onChange={(e) => updateWizardTask(i, { name: e.target.value })} className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-[13px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Nombre de la tarea" autoFocus={i === wizardData.tasks.length - 1} />
                        <select value={task.role_context || ""} onChange={(e) => updateWizardTask(i, { role_context: e.target.value ? (e.target.value as any) : null })} className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-[13px] focus:outline-none focus:border-indigo-500 text-neutral-600 font-medium w-32">
                          <option value="">Sin Rol</option>
                          <option value="site_led">Sitio</option>
                          <option value="cro_led">CRO</option>
                          <option value="shared">Compartido</option>
                        </select>
                        <button onClick={() => removeWizardTask(i)} className="w-9 h-9 flex items-center justify-center shrink-0 border border-neutral-200 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={addWizardTask} className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-indigo-600 hover:text-indigo-700 mt-1 py-1">
                      <Plus className="w-4 h-4" /> Añadir otra tarea
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-neutral-50/80 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-[12px] text-neutral-400 font-mono font-medium">Paso {wizardStep} de 3</span>
              <div className="flex items-center gap-2">
                {wizardStep > 1 && (
                  <button onClick={wizardBack} className="px-3.5 py-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">
                    ← Atrás
                  </button>
                )}
                <button onClick={closeWizard} className="px-3.5 py-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">
                  Cancelar
                </button>
                {wizardStep < 3 ? (
                  <button onClick={wizardNext} disabled={wizardStep === 1 && !wizardData.name.trim()} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-md shadow-sm transition-colors">
                    Siguiente →
                  </button>
                ) : (
                  <button onClick={handleWizardSubmit} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-md shadow-sm transition-colors">
                    ✓ Crear Categoría
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
