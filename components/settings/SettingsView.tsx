import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useDynamicTranslation } from "@/lib/i18n/utils";
import { UserProfile } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Settings, Save, Plus, Trash2, Edit2 , Wrench, Check, X } from "lucide-react";
import {
  createActivityCategory, updateActivityCategory, deleteActivityCategory,
  createActivityTask, updateActivityTask, deleteActivityTask,
  createActivitySubtask, updateActivitySubtask, deleteActivitySubtask,
  addCategoryRole, removeCategoryRole
} from "@/lib/actions_config";
import { toast } from "sonner";
import { exportUserData } from "@/lib/exportData";
import { Download, AlertTriangle } from "lucide-react";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { StructureWizard } from "./StructureWizard";

interface SettingsViewProps {
  profile: UserProfile;
}

export function SettingsView({ profile }: SettingsViewProps) {
  const { activityCategories, refreshActivitiesConfig } = useAppStore();

  // State for Inline Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // State for Create Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"category" | "task" | "subtask" | "role" | null>(null);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [modalInputValue, setModalInputValue] = useState("");

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"activities" | "general" | "structure" | "regions">(profile.role === "super_admin" || profile.role === "manager" ? "activities" : "general");
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { dt } = useDynamicTranslation();


  // --- Create Actions ---
  const handleOpenModal = (type: "category" | "task" | "subtask" | "role", parentId: string | null = null) => {
    setModalType(type);
    setModalParentId(parentId);
    setModalInputValue("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setModalParentId(null);
    setModalInputValue("");
  };

  const handleSaveModal = async () => {
    if (!modalInputValue.trim()) return;

    let res;
    if (modalType === "category") {
      res = await createActivityCategory(modalInputValue);
    } else if (modalType === "task" && modalParentId) {
      res = await createActivityTask(modalParentId, modalInputValue);
    } else if (modalType === "subtask" && modalParentId) {
      res = await createActivitySubtask(modalParentId, modalInputValue);
    } else if (modalType === "role" && modalParentId) {
      // Input must be a valid UserRole (you might want to use a select here instead of text input for roles, but for now we validate)
      const validRoles = ["super_admin", "manager", "crc", "cra", "data_entry", "recruitment_specialist", "retention_specialist", "cta", "ra"];
      if (validRoles.includes(modalInputValue.toLowerCase())) {
        res = await addCategoryRole(modalParentId, modalInputValue.toLowerCase() as any);
      } else {
        toast.error("Invalid role.");
        return;
      }
    }

    if (res?.success) {
      toast.success(t.common.success || "Guardado exitosamente");
      await refreshActivitiesConfig();
      handleCloseModal();
    } else {
      toast.error(res?.error || "Error al guardar");
    }
  };

  // --- Inline Edit Actions ---
  const startEditing = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEditing = async (id: string, type: "category" | "task" | "subtask") => {
    if (!editValue.trim()) return cancelEditing();

    let res;
    if (type === "category") {
      res = await updateActivityCategory(id, editValue);
    } else if (type === "task") {
      res = await updateActivityTask(id, editValue);
    } else if (type === "subtask") {
      res = await updateActivitySubtask(id, editValue);
    }

    if (res?.success) {
      toast.success(t.common.success || "Actualizado exitosamente");
      await refreshActivitiesConfig();
      cancelEditing();
    } else {
      toast.error(res?.error || "Error al actualizar");
    }
  };

  // --- Delete Actions ---
  const handleDelete = async (id: string, type: "category" | "task" | "subtask", name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${name}"? Esto no afectará a los registros antiguos.`)) {
      return;
    }

    setIsDeleting(id);
    let res;
    if (type === "category") {
      res = await deleteActivityCategory(id);
    } else if (type === "task") {
      res = await deleteActivityTask(id);
    } else if (type === "subtask") {
      res = await deleteActivitySubtask(id);
    }

    setIsDeleting(null);

    if (res?.success) {
      toast.success(t.common.success || "Eliminado exitosamente");
      await refreshActivitiesConfig();
    } else {
      toast.error(res?.error || "Error al eliminar");
    }
  };

  const handleRemoveRole = async (categoryId: string, role: string) => {
    if (!confirm(`¿Quitar rol ${role}?`)) return;
    const res = await removeCategoryRole(categoryId, role as any);
    if (res.success) {
      toast.success("Rol removido");
      await refreshActivitiesConfig();
    } else {
      toast.error(res.error || "Error");
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
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "general"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {t.settings.generalSettings}
        </button>
        {profile.role === "super_admin" && (
          <button
            onClick={() => setActiveTab("structure")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "structure"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Structure
          </button>
        )}
      </div>

      {(activeTab === "activities" && (profile.role === "super_admin" || profile.role === "manager")) && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900">
              {t.settings.activityCategories}
            </h3>
            <button onClick={() => handleOpenModal("category")} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              {t.settings.newCategory}
            </button>
          </div>

          <div className="space-y-6">
            {activityCategories.map((cat: any) => (
              <div
                key={cat.id}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing(cat.id, "category");
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <button onClick={() => saveEditing(cat.id, "category")} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEditing} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full group">
                      <h4 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        {dt(cat.name)}
                        <span className="text-xs font-normal text-neutral-500 bg-white px-2 py-0.5 rounded-full border border-neutral-200">Categoría</span>
                      </h4>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button onClick={() => startEditing(cat.id, cat.name)} className="p-1.5 text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar Categoría">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id, "category", cat.name)} disabled={isDeleting === cat.id} className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Categoría">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Roles Permitidos</span>
                    <button onClick={() => handleOpenModal("role", cat.id)} className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white border border-dashed border-neutral-300 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors" title="Añadir Rol">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.category_roles?.length > 0 ? cat.category_roles.map((cr: any) => (
                      <span
                        key={cr.role}
                        className="inline-flex items-center pl-2.5 pr-1 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 group/role"
                      >
                        {cr.role}
                        <button onClick={() => handleRemoveRole(cat.id, cr.role)} className="ml-1 p-0.5 text-indigo-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover/role:opacity-100 transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )) : (
                      <span className="text-xs text-neutral-400 italic">Ningún rol asignado (visible para todos)</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-700">Tareas ({cat.activity_tasks?.length || 0})</span>
                    <button onClick={() => handleOpenModal("task", cat.id)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                      <Plus className="w-3 h-3" />
                      Añadir Tarea
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {cat.activity_tasks?.map((task: any) => (
                      <div key={task.id} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm group/task">
                        {editingId === task.id ? (
                          <div className="flex items-center gap-2 flex-1 mb-3">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditing(task.id, "task");
                                if (e.key === 'Escape') cancelEditing();
                              }}
                            />
                            <button onClick={() => saveEditing(task.id, "task")} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEditing} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                            <span className="font-semibold text-neutral-800 flex items-center gap-2">
                              {dt(task.name)}
                            </span>
                            <div className="opacity-0 group-hover/task:opacity-100 transition-opacity flex items-center gap-1">
                               <button onClick={() => startEditing(task.id, task.name)} className="p-1 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Editar Tarea">
                                 <Edit2 className="w-3.5 h-3.5" />
                               </button>
                               <button onClick={() => handleDelete(task.id, "task", task.name)} disabled={isDeleting === task.id} className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded" title="Eliminar Tarea">
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                            </div>
                          </div>
                        )}

                        <div className="pl-2 border-l-2 border-indigo-100 ml-1">
                          <div className="flex flex-wrap gap-2 items-center">
                            {task.activity_subtasks?.map((st: any) => (
                              <span
                                key={st.id}
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 group/subtask"
                              >
                                {editingId === st.id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="w-32 px-1 py-0.5 text-xs border border-indigo-300 rounded focus:outline-none"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEditing(st.id, "subtask");
                                        if (e.key === 'Escape') cancelEditing();
                                      }}
                                    />
                                    <button onClick={() => saveEditing(st.id, "subtask")} className="text-green-600 hover:text-green-700"><Check className="w-3 h-3" /></button>
                                    <button onClick={cancelEditing} className="text-red-600 hover:text-red-700"><X className="w-3 h-3" /></button>
                                  </div>
                                ) : (
                                  <>
                                    {dt(st.name)}
                                    <div className="opacity-0 group-hover/subtask:opacity-100 transition-opacity flex items-center ml-2 border-l border-neutral-300 pl-1 gap-1">
                                      <button onClick={() => startEditing(st.id, st.name)} className="text-neutral-400 hover:text-indigo-600"><Edit2 className="w-3 h-3" /></button>
                                      <button onClick={() => handleDelete(st.id, "subtask", st.name)} disabled={isDeleting === st.id} className="text-neutral-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  </>
                                )}
                              </span>
                            ))}
                            {editingId !== task.id && (
                              <button onClick={() => handleOpenModal("subtask", task.id)} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border border-dashed border-neutral-300 text-neutral-500 hover:bg-white hover:text-indigo-600 hover:border-indigo-300 transition-colors">
                                <Plus className="w-3 h-3 mr-1" /> Sub-tarea
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!cat.activity_tasks || cat.activity_tasks.length === 0) && (
                      <p className="text-xs text-neutral-400 italic py-2">No hay tareas configuradas para esta categoría.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {activityCategories.length === 0 && (
              <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                <p className="text-neutral-500 font-medium">No hay categorías de actividades configuradas.</p>
                <p className="text-sm text-neutral-400 mt-1">Comienza creando una nueva categoría.</p>
              </div>
            )}
          </div>
        </div>
      )}

        {activeTab === "structure" && profile.role === "super_admin" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Structure Management</h3>
              <p className="text-gray-500">Create new Projects, Protocols, and Sites using the Wizard.</p>
            </div>
            <StructureWizard onComplete={() => setActiveTab("structure")} />
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


          {/* Danger Zone */}
          <div className="bg-red-50/30 rounded-2xl border border-red-200 shadow-sm p-6 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-900">
                {t.settings.dangerZone || "Zona de Peligro"}
              </h3>
            </div>

            <p className="text-sm text-red-800 mb-6 max-w-2xl">
              {t.settings.dangerZoneDesc || "Eliminar tu cuenta es una acción irreversible. Revocará tu acceso y se anonimizarán tus datos personales (aunque conservaremos estadísticas de tiempo y actividades)."}
            </p>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              {t.settings.deleteAccountButton || "Eliminar mi cuenta"}
            </button>
          </div>

          <DeleteAccountModal
            profile={profile}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onSuccess={() => window.location.href = '/login'}
          />

        </div>
      )}


      {/* Modal para Crear Entidades */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">
                {modalType === "category" && "Nueva Categoría"}
                {modalType === "task" && "Nueva Tarea"}
                {modalType === "subtask" && "Nueva Sub-tarea"}
                {modalType === "role" && "Añadir Rol (ej. cra, crc, manager)"}
              </h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {modalType === "role" ? "Nombre del Rol" : "Nombre"}
              </label>
              <input
                type="text"
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                placeholder={modalType === "role" ? "cra" : "Escribe aquí..."}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveModal();
                  if (e.key === 'Escape') handleCloseModal();
                }}
              />
            </div>
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModal}
                disabled={!modalInputValue.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
