"use client";

import React, { useState } from "react";
import { UserRole } from "@/lib/types";
import { Plus, Trash2, Check } from "lucide-react";
import { createActivityCategory, addCategoryRoles, createActivityTasks } from "@/lib/actions_config";
import { toast } from "sonner";

export type RoleContext = "site_led" | "cro_led" | "shared" | null;

type WizardStep = 1 | 2 | 3;

interface CategoryWizardState {
  name: string;
  description: string;
  selectedRoles: UserRole[];
  tasks: {
    name: string;
    role_context: RoleContext;
    staff_roles: string[];
  }[];
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

interface CategoryWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function CategoryWizardModal({
  isOpen,
  onClose,
  onSuccess,
}: CategoryWizardModalProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [wizardData, setWizardData] = useState<CategoryWizardState>({
    name: "",
    description: "",
    selectedRoles: [],
    tasks: [{ name: "", role_context: null, staff_roles: [] }],
  });

  if (!isOpen) return null;

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
    setWizardData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { name: "", role_context: null, staff_roles: [] }],
    }));

  const removeWizardTask = (idx: number) =>
    setWizardData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== idx),
    }));

  const updateWizardTask = (
    idx: number,
    updates: Partial<{
      name: string;
      role_context: RoleContext;
      staff_roles: string[];
    }>,
  ) =>
    setWizardData((prev) => {
      const tasks = [...prev.tasks];
      tasks[idx] = { ...tasks[idx], ...updates };
      return { ...prev, tasks };
    });

  const handleWizardSubmit = async () => {
    const catRes = await createActivityCategory(wizardData.name.trim());
    if (!catRes.success || !catRes.data) {
      toast.error(catRes.error ?? "Error al crear la categoría", {
        description: "Intenta de nuevo o contacta soporte",
      });
      return;
    }
    const catId: string = catRes.data.id;

    await addCategoryRoles(catId, wizardData.selectedRoles);

    const validTasks = wizardData.tasks.filter((t) => t.name.trim());
    await createActivityTasks(
      catId,
      validTasks.map((t) => ({
        name: t.name.trim(),
        role_context: t.role_context,
        staff_roles: t.staff_roles,
      })),
    );

    toast.success("Categoría creada exitosamente", {
      description: `Se crearon ${validTasks.length} tareas asociadas.`,
    });

    // Reset state after success before closing
    setWizardData({
      name: "",
      description: "",
      selectedRoles: [],
      tasks: [{ name: "", role_context: null, staff_roles: [] }],
    });
    setWizardStep(1);

    await onSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/50 backdrop-blur-[3px] p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[16px] w-full max-w-[520px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Steps indicator */}
        <div className="pt-7 px-8 pb-0">
          <div className="flex items-start">
            {[1, 2, 3].map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${wizardStep > step ? "bg-indigo-600 text-white" : wizardStep === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-neutral-100 text-neutral-400"}`}
                  >
                    {wizardStep > step ? (
                      <Check className="w-[14px] h-[14px] stroke-[2.5px]" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className="text-[11px] font-medium mt-1.5 text-neutral-400">
                    {["Nombre", "Roles", "Tareas"][idx]}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 mt-3.5 transition-colors duration-300 ${wizardStep > step ? "bg-indigo-600" : "bg-neutral-200"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard body */}
        <div className="p-8 pb-6">
          {wizardStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">
                Nueva Categoría
              </h3>
              <p className="text-[13px] text-neutral-500 mb-5">
                Asigna un nombre que identifique el tipo de actividad clínica.
              </p>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={wizardData.name}
                    onChange={(e) =>
                      setWizardData((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[14px] text-neutral-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    placeholder="ej. Visitas de Monitoreo"
                    autoFocus
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      wizardData.name.trim() &&
                      wizardNext()
                    }
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">
                    Descripción (opcional)
                  </label>
                  <input
                    type="text"
                    value={wizardData.description}
                    onChange={(e) =>
                      setWizardData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[14px] text-neutral-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    placeholder="Breve descripción para el equipo"
                  />
                </div>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">
                Roles con acceso
              </h3>
              <p className="text-[13px] text-neutral-500 mb-5">
                Sin selección = visible para todos los roles del equipo.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {ALL_ROLES.map(({ role, label, desc }) => {
                  const sel = wizardData.selectedRoles.includes(role);
                  return (
                    <button
                      key={role}
                      onClick={() => toggleWizardRole(role)}
                      className={`text-left p-2.5 border-[1.5px] rounded-lg transition-all ${sel ? "border-indigo-600 bg-indigo-50/50" : "border-neutral-200 bg-white hover:border-indigo-300"}`}
                    >
                      <div
                        className={`text-[12.5px] font-bold leading-none mb-1 ${sel ? "text-indigo-700" : "text-neutral-800"}`}
                      >
                        {label}
                      </div>
                      <div
                        className={`text-[11px] leading-tight ${sel ? "text-indigo-600/70" : "text-neutral-400"}`}
                      >
                        {desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">
                Tareas iniciales
              </h3>
              <p className="text-[13px] text-neutral-500 mb-5">
                Opcional. Puedes agregar más tareas después desde el listado.
              </p>

              <div className="flex flex-col gap-1.5">
                {wizardData.tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) =>
                        updateWizardTask(i, { name: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-[13px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="Nombre de la tarea"
                      autoFocus={i === wizardData.tasks.length - 1}
                    />
                    <select
                      value={task.role_context || ""}
                      onChange={(e) =>
                        updateWizardTask(i, {
                          role_context: e.target.value
                            ? (e.target.value as NonNullable<RoleContext>)
                            : null,
                        })
                      }
                      className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-[13px] focus:outline-none focus:border-indigo-500 text-neutral-600 font-medium w-32"
                    >
                      <option value="">Sin Rol</option>
                      <option value="site_led">Sitio</option>
                      <option value="cro_led">CRO</option>
                      <option value="shared">Compartido</option>
                    </select>
                    <button
                      onClick={() => removeWizardTask(i)}
                      className="w-9 h-9 flex items-center justify-center shrink-0 border border-neutral-200 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addWizardTask}
                  className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-indigo-600 hover:text-indigo-700 mt-1 py-1"
                >
                  <Plus className="w-4 h-4" /> Añadir otra tarea
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-neutral-50/80 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-[12px] text-neutral-400 font-medium">
            Paso {wizardStep} de 3
          </span>
          <div className="flex items-center gap-2">
            {wizardStep > 1 && (
              <button
                onClick={wizardBack}
                className="px-3.5 py-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                ← Atrás
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            {wizardStep < 3 ? (
              <button
                onClick={wizardNext}
                disabled={wizardStep === 1 && !wizardData.name.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-md shadow-sm transition-colors"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleWizardSubmit}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-md shadow-sm transition-colors"
              >
                ✓ Crear Categoría
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
