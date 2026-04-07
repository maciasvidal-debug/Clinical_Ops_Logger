"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { useDynamicTranslation } from "@/lib/i18n/utils";
import { UserProfile, UserRole, DbActivityCategory, DbActivityTask, DbActivitySubtask } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Users,
  Download,
  AlertTriangle,
  ChevronDown,
  Layers,
  ClipboardList,
  Wrench,
} from "lucide-react";
import {
  createActivityCategory,
  updateActivityCategory,
  updateCategoryRoles,
  deleteActivityCategory,
  createActivityTask,
  updateActivityTask,
  deleteActivityTask,
  createActivitySubtask,
  updateActivitySubtask,
  deleteActivitySubtask,
  addCategoryRole,
  removeCategoryRole,
} from "@/lib/actions_config";
import { toast } from "sonner";
import { exportUserData } from "@/lib/exportData";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { localSaveProfile, localSaveLogs, localSaveTodos, localSaveCategories, localSaveProjects, localSaveProtocols, localSaveSites, localClearNotifications } from "@/lib/local_db";
import { StructureWizard } from "./StructureWizard";
import { CategoryWizardModal } from "./CategoryWizardModal";

type SettingsTab = "activities" | "general" | "structure";

export type RoleContext = "site_led" | "cro_led" | "shared" | null;

interface ActivityTaskWithRelations extends Omit<DbActivityTask, 'activity_subtasks'> {
  task_roles?: { role: UserRole }[];
  activity_subtasks?: DbActivitySubtask[];
}

interface ActivityCategoryWithRelations extends Omit<DbActivityCategory, 'activity_tasks' | 'category_roles'> {
  category_roles?: { role: UserRole }[];
  activity_tasks?: ActivityTaskWithRelations[];
}

const ALL_ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: "crc", label: "crc", desc: "Clinical Research Coord." },
  { role: "cra", label: "cra", desc: "Clinical Research Assoc." },
  { role: "manager", label: "manager", desc: "Site Manager" },
  { role: "cta", label: "cta", desc: "Clinical Trial Asst." },
  { role: "data_entry", label: "data_entry", desc: "Data Entry" },
  { role: "ra", label: "ra", desc: "Regulatory Affairs" },
  {
    role: "recruitment_specialist",
    label: "recruitment_specialist",
    desc: "Recruitment",
  },
  {
    role: "retention_specialist",
    label: "retention_specialist",
    desc: "Retention",
  },
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
    isPrivileged ? "activities" : "general",
  );

  useEffect(() => {
    if (isPrivileged) {
      refreshActivitiesConfig();
    }
  }, [isPrivileged, refreshActivitiesConfig]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editRoleContext, setEditRoleContext] = useState<
    RoleContext
  >(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [creatingTaskInCat, setCreatingTaskInCat] = useState<string | null>(
    null,
  );
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskRoleCtx, setNewTaskRoleCtx] = useState<
    RoleContext
  >(null);
  const [newTaskStaffRoles, setNewTaskStaffRoles] = useState<string[]>([]);

  const [editStaffRoles, setEditStaffRoles] = useState<string[]>([]);
  const [editCategoryRoles, setEditCategoryRoles] = useState<UserRole[]>([]);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const closeWizard = () => setWizardOpen(false);

  const startEditing = (
    id: string,
    currentValue: string,
    roleContext?: RoleContext,
    staffRoles: string[] = [],
    categoryRoles: UserRole[] = [],
  ) => {
    setEditingId(id);
    setEditValue(currentValue);
    setEditRoleContext(roleContext || null);
    setEditStaffRoles(staffRoles || []);
    setEditCategoryRoles(categoryRoles || []);
  };

  const saveNewTask = async (categoryId: string) => {
    if (!newTaskName.trim()) {
      setCreatingTaskInCat(null);
      return;
    }
    const res = await createActivityTask(
      categoryId,
      newTaskName,
      newTaskRoleCtx,
      newTaskStaffRoles,
    );
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
    type: "category" | "task" | "subtask",
  ) => {
    if (!editValue.trim()) return cancelEditing();
    let res;
    if (type === "category") {
      res = await updateActivityCategory(id, editValue);
      if (res.success) {
        const rolesRes = await updateCategoryRoles(id, editCategoryRoles);
        if (!rolesRes.success) {
          toast.error(rolesRes.error ?? "Error al actualizar roles de la categoría");
        }
      }
    } else if (type === "task") {
      res = await updateActivityTask(
        id,
        editValue,
        editRoleContext,
        editStaffRoles,
      );
    } else {
      res = await updateActivitySubtask(id, editValue);
    }

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
    name: string,
  ) => {
    if (!confirm(`¿Eliminar "${name}"? Esto no afectará registros existentes.`))
      return;

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

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.profile) await localSaveProfile(data.profile);
        if (data.logs) await localSaveLogs(data.logs);
        if (data.todos) await localSaveTodos(data.todos);
        if (data.categories) await localSaveCategories(data.categories);
        if (data.projects) await localSaveProjects(data.projects);
        if (data.protocols) await localSaveProtocols(data.protocols);
        if (data.sites) await localSaveSites(data.sites);

        toast.success("Import successful. Reloading app...");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        toast.error("Invalid import file format");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
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
      case "crc":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cra":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "manager":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cta":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "data_entry":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "ra":
        return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200";
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
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
          {t.settings?.subtitle ??
            "Administra categorías, actividades y preferencias del equipo"}
        </p>
      </header>

      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl w-fit mb-4">
        {isPrivileged && (
          <button
            onClick={() => setActiveTab("activities")}
            className={tabClass("activities")}
          >
            <ClipboardList className="w-4 h-4" />
            Actividades
          </button>
        )}
        <button
          onClick={() => setActiveTab("general")}
          className={tabClass("general")}
        >
          <Wrench className="w-4 h-4" />
          General
        </button>
        {profile.role === "super_admin" && (
          <button
            onClick={() => setActiveTab("structure")}
            className={tabClass("structure")}
          >
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
              <p className="text-[13px] text-neutral-500 mt-1">
                Jerarquía: Categorías → Tareas → Sub-tareas
              </p>
            </div>
            <button
              onClick={() => setWizardOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>

          <div className="space-y-3">
            {activityCategories.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <p className="text-sm font-medium text-neutral-600">
                  No hay categorías configuradas
                </p>
                <p className="text-[13px] text-neutral-400 mt-1">
                  Comienza creando una nueva categoría.
                </p>
              </div>
            ) : (
              activityCategories.map((cat: ActivityCategoryWithRelations) => (
                <div
                  key={cat.id}
                  className="border border-neutral-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors group/cat"
                >
                  <div
                    className="flex items-center justify-between px-5 py-3.5 bg-white cursor-pointer select-none"
                    onClick={() => toggleCat(cat.id)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {editingId === cat.id ? (
                        <div
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1.5 text-[14px] border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold w-full sm:w-64 flex-1 shadow-sm transition-shadow"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                saveEditing(cat.id, "category");
                              if (e.key === "Escape") cancelEditing();
                            }}
                          />
                          <div className="relative group/popover shrink-0">
                            <button
                              type="button"
                              className="px-2 py-1.5 flex items-center gap-1.5 text-[13px] border border-indigo-300 rounded-md focus:outline-none bg-white font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
                            >
                              <Users className="w-4 h-4" />
                              {editCategoryRoles.length === 0
                                ? "Todos los roles"
                                : `${editCategoryRoles.length} roles`}
                            </button>
                            <div className="absolute top-full mt-1 left-0 sm:right-0 sm:left-auto w-56 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-xl shadow-xl opacity-0 invisible group-hover/popover:opacity-100 group-hover/popover:visible transition-all z-[100] p-2 grid grid-cols-1 gap-1">
                              {ALL_ROLES.map(({ role, label, desc }) => (
                                <label
                                  key={role}
                                  className="flex items-start gap-2 p-2 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editCategoryRoles.includes(role)}
                                    onChange={(e) => {
                                      if (e.target.checked)
                                        setEditCategoryRoles([
                                          ...editCategoryRoles,
                                          role,
                                        ]);
                                      else
                                        setEditCategoryRoles(
                                          editCategoryRoles.filter(
                                            (r) => r !== role,
                                          ),
                                        );
                                    }}
                                    className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-[12.5px] font-semibold text-neutral-800 leading-tight">
                                      {label}
                                    </span>
                                    <span className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                                      {desc}
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                            <button
                              onClick={() => saveEditing(cat.id, "category")}
                              className="flex items-center justify-center w-8 h-8 text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center justify-center w-8 h-8 text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-neutral-900">
                            {dt(cat.name)}
                          </span>
                          <span className="ml-2 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                            {cat.activity_tasks?.length ?? 0} tareas
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="opacity-0 group-hover/cat:opacity-100 transition-opacity flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => startEditing(cat.id, cat.name, undefined, [], cat.category_roles?.map((cr) => cr.role) || [])}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(cat.id, "category", cat.name)
                          }
                          disabled={isDeleting === cat.id}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-400 transition-transform ${expandedCats.has(cat.id) ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5 border-t border-neutral-100 bg-white">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mr-1">
                      Roles:
                    </span>
                    {(cat.category_roles?.length ?? 0) > 0 ? (
                      cat.category_roles?.map((cr: { role: UserRole }) => (
                        <span
                          key={cr.role}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeClasses(cr.role)}`}
                        >
                          {cr.role}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic">
                        Todos los roles
                      </span>
                    )}
                    <button
                      onClick={() =>
                        toast.info("Edita la categoría para cambiar roles")
                      }
                      className="w-5 h-5 rounded-full border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors ml-1"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {expandedCats.has(cat.id) && (
                    <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] font-semibold text-neutral-600">
                          Tareas
                        </span>
                      </div>

                      <div className="space-y-2">
                        {cat.activity_tasks?.map((task: ActivityTaskWithRelations) => (
                          <div
                            key={task.id}
                            className="flex items-start justify-between p-2.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 hover:shadow-sm transition-all group/task"
                          >
                            <div className="flex-1">
                              {editingId === task.id ? (
                                <div className="flex flex-wrap items-center gap-2 mb-2 w-full">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    className="px-2 py-1 text-[13px] border border-indigo-300 rounded focus:outline-none w-full sm:w-48 flex-1 font-medium"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        saveEditing(task.id, "task");
                                      if (e.key === "Escape") cancelEditing();
                                    }}
                                  />
                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <select
                                      value={editRoleContext || ""}
                                      onChange={(e) =>
                                        setEditRoleContext(
                                          e.target.value
                                            ? (e.target.value as NonNullable<RoleContext>)
                                            : null,
                                        )
                                      }
                                      className="px-2 py-1 text-[12px] border border-neutral-300 rounded focus:outline-none bg-white font-medium text-neutral-600 shrink-0"
                                    >
                                      <option value="">Sin Rol</option>
                                      <option value="site_led">Sitio</option>
                                      <option value="cro_led">CRO</option>
                                      <option value="shared">Compartido</option>
                                    </select>
                                    <div className="relative group/popover">
                                      <button
                                        type="button"
                                        className="px-2 py-1 flex items-center gap-1 text-[12px] border border-neutral-300 rounded focus:outline-none bg-white font-medium text-neutral-600 hover:bg-neutral-50"
                                      >
                                        <Users className="w-3.5 h-3.5" />
                                        {editStaffRoles.length === 0
                                          ? "Staff Roles"
                                          : `${editStaffRoles.length} roles`}
                                      </button>
                                      <div className="absolute top-full mt-1 left-0 w-48 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-lg shadow-lg opacity-0 invisible group-hover/popover:opacity-100 group-hover/popover:visible transition-all z-10 p-2 grid grid-cols-1 gap-0.5">
                                        {ALL_ROLES.map(({ role, label }) => (
                                          <label
                                            key={role}
                                            className="flex items-center gap-2 p-1.5 hover:bg-neutral-50 rounded cursor-pointer"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={editStaffRoles.includes(
                                                role,
                                              )}
                                              onChange={(e) => {
                                                if (e.target.checked)
                                                  setEditStaffRoles([
                                                    ...editStaffRoles,
                                                    role,
                                                  ]);
                                                else
                                                  setEditStaffRoles(
                                                    editStaffRoles.filter(
                                                      (r) => r !== role,
                                                    ),
                                                  );
                                              }}
                                              className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-[12px] text-neutral-700">
                                              {label}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() =>
                                        saveEditing(task.id, "task")
                                      }
                                      className="text-green-600 p-1 hover:bg-green-50 rounded"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="text-red-600 p-1 hover:bg-red-50 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-[13px] font-medium text-neutral-900">
                                    {dt(task.name)}
                                  </div>
                                  {task.role_context && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                        task.role_context === "site_led"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : task.role_context === "cro_led"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {task.role_context === "site_led"
                                        ? "Sitio"
                                        : task.role_context === "cro_led"
                                          ? "CRO"
                                          : "Compartido"}
                                    </span>
                                  )}
                                  {task.task_roles &&
                                    task.task_roles.length > 0 && (
                                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                                        <Users className="w-2.5 h-2.5" />{" "}
                                        {task.task_roles.length} roles
                                      </span>
                                    )}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {task.activity_subtasks?.map((st: DbActivitySubtask) => (
                                  <span
                                    key={st.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-neutral-100 border border-neutral-200 text-neutral-600 group/sub"
                                  >
                                    {dt(st.name)}
                                  </span>
                                ))}
                                {editingId !== task.id && (
                                  <button
                                    onClick={() =>
                                      toast.info("Añadir sub-tarea")
                                    }
                                    className="text-[11px] text-neutral-500 hover:text-indigo-600 font-medium px-2.5 py-0.5 border-[1.5px] border-dashed border-neutral-300 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-colors whitespace-nowrap"
                                  >
                                    + sub-tarea
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                              <button
                                onClick={() =>
                                  startEditing(
                                    task.id,
                                    task.name,
                                    task.role_context,
                                    task.task_roles?.map(
                                      (tr: { role: UserRole }) => tr.role,
                                    ) || [],
                                  )
                                }
                                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(task.id, "task", task.name)
                                }
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {creatingTaskInCat === cat.id && (
                          <div className="flex items-start justify-between p-2.5 bg-indigo-50/50 border border-indigo-200 rounded-lg shadow-sm mb-2">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full mb-1">
                                <input
                                  type="text"
                                  value={newTaskName}
                                  onChange={(e) =>
                                    setNewTaskName(e.target.value)
                                  }
                                  className="px-3 py-1.5 text-[13px] border border-indigo-300 rounded-md focus:outline-none w-full sm:w-48 flex-1 font-medium shadow-sm transition-shadow focus:ring-2 focus:ring-indigo-500/20"
                                  autoFocus
                                  placeholder="Nombre de la tarea"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveNewTask(cat.id);
                                    if (e.key === "Escape")
                                      setCreatingTaskInCat(null);
                                  }}
                                />
                                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={newTaskRoleCtx || ""}
                                      onChange={(e) =>
                                        setNewTaskRoleCtx(
                                          e.target.value
                                            ? (e.target.value as NonNullable<RoleContext>)
                                            : null,
                                        )
                                      }
                                      className="px-2 py-1.5 text-[12px] border border-neutral-300 rounded-md focus:outline-none bg-white font-medium text-neutral-600 shrink-0"
                                    >
                                      <option value="">Sin Rol</option>
                                      <option value="site_led">Sitio</option>
                                      <option value="cro_led">CRO</option>
                                      <option value="shared">Compartido</option>
                                    </select>
                                    <div className="relative group/popover">
                                      <button
                                        type="button"
                                        className="px-2 py-1.5 flex items-center gap-1.5 text-[12px] border border-neutral-300 rounded-md focus:outline-none bg-white font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                                      >
                                        <Users className="w-3.5 h-3.5" />
                                        {newTaskStaffRoles.length === 0
                                          ? "Roles"
                                          : `${newTaskStaffRoles.length}`}
                                      </button>
                                      <div className="absolute top-full mt-1 left-0 sm:right-0 sm:left-auto w-52 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-lg shadow-xl opacity-0 invisible group-hover/popover:opacity-100 group-hover/popover:visible transition-all z-20 p-2 grid grid-cols-1 gap-1">
                                        {ALL_ROLES.map(({ role, label }) => (
                                          <label
                                            key={role}
                                            className="flex items-center gap-2 p-1.5 hover:bg-neutral-50 rounded cursor-pointer"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={newTaskStaffRoles.includes(
                                                role,
                                              )}
                                              onChange={(e) => {
                                                if (e.target.checked)
                                                  setNewTaskStaffRoles([
                                                    ...newTaskStaffRoles,
                                                    role,
                                                  ]);
                                                else
                                                  setNewTaskStaffRoles(
                                                    newTaskStaffRoles.filter(
                                                      (r) => r !== role,
                                                    ),
                                                  );
                                              }}
                                              className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-[12px] text-neutral-700 font-medium">
                                              {label}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 ml-auto">
                                    <button
                                      onClick={() => saveNewTask(cat.id)}
                                      className="flex items-center justify-center w-7 h-7 text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setCreatingTaskInCat(null)}
                                      className="flex items-center justify-center w-7 h-7 text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setCreatingTaskInCat(cat.id);
                            setNewTaskName("");
                            setNewTaskRoleCtx(null);
                            setNewTaskStaffRoles([]);
                          }}
                          className="w-full py-2 flex items-center justify-center gap-1.5 border-[1.5px] border-dashed border-neutral-300 rounded-lg text-[13px] font-medium text-neutral-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors mt-1"
                        >
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
                Descarga tu historial completo. Exporta todos tus registros de
                tiempo, actividades y reportes en formato JSON. Compatible con
                herramientas de análisis clínico.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13.5px] font-medium rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exportando..." : "Exportar datos"}
              </button>
              <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer disabled:opacity-50 text-[13.5px] font-medium rounded-lg transition-colors shadow-sm">
                {isImporting ? "Importando..." : "Importar datos (Restaurar)"}
                <input type="file" className="hidden" accept=".json" onChange={handleImportData} disabled={isImporting} />
              </label>
            </div>
          </div>

          <div className="bg-[#FFFAFA] rounded-2xl border border-red-200 p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-red-900">
                Zona de Peligro
              </h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-[46px]">
              <div>
                <h4 className="text-[14px] font-semibold text-red-900 mb-1">
                  Eliminar mi cuenta
                </h4>
                <p className="text-[13px] text-red-800/80 leading-relaxed max-w-md">
                  Esta acción es irreversible. Se revocará tu acceso y se
                  anonimizarán tus datos personales, aunque se conservarán
                  estadísticas del estudio.
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
          <DeleteAccountModal
            profile={profile}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onSuccess={() => (window.location.href = "/login")}
          />
        </div>
      )}

      {/* CATEGORY WIZARD OVERLAY */}
      <CategoryWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={refreshActivitiesConfig}
      />
    </div>
  );
}
