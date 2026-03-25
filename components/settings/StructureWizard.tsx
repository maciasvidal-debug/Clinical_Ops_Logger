"use client";

import React, { useState, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import {
  createProject, createProtocol, createSite, createMicroZone, assignSiteToManager
} from "@/lib/actions_structure";
import { fetchProfiles } from "@/lib/actions_structure";
import { Check, X, Building2, FolderKanban, MapPin, Loader2, ChevronRight, CheckCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

interface StructureWizardProps {
  onComplete: () => void;
}

const ALL_COUNTRIES = [
  "United States", "Canada", "Mexico", "Brazil", "Argentina", "Chile",
  "Colombia", "Peru", "United Kingdom", "Germany", "France", "Spain",
  "Italy", "Australia", "New Zealand", "Japan", "South Korea", "China",
  "India", "Singapore"
].sort();

const COUNTRY_TO_REGION: Record<string, string> = {
  "United States": "North America",
  "Canada": "North America",
  "Mexico": "Latin America",
  "Brazil": "Latin America",
  "Argentina": "Latin America",
  "Chile": "Latin America",
  "Colombia": "Latin America",
  "Peru": "Latin America",
  "United Kingdom": "Europe",
  "Germany": "Europe",
  "France": "Europe",
  "Spain": "Europe",
  "Italy": "Europe",
  "Australia": "Oceania",
  "New Zealand": "Oceania",
  "Japan": "Asia",
  "South Korea": "Asia",
  "China": "Asia",
  "India": "Asia",
  "Singapore": "Asia"
};

export function StructureWizard({ onComplete }: StructureWizardProps) {
  const { projects, protocols, refreshAppData } = useAppStore();
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  // Step 1: Project
  const [isNewProject, setIsNewProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState("");

  // Step 2: Protocol
  const [isNewProtocol, setIsNewProtocol] = useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>("");
  const [newProtocolName, setNewProtocolName] = useState("");

  // Step 3: Site Details
  const [siteNumber, setSiteNumber] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteCity, setSiteCity] = useState("");
  const [siteCountry, setSiteCountry] = useState("");

  // Micro-zone
  const [isMicroZone, setIsMicroZone] = useState(false);
  const [microZoneName, setMicroZoneName] = useState("");

  // Manager Assignment
  const [assignToManager, setAssignToManager] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");

  useEffect(() => {
    fetchProfiles().then(res => {
      if (res.success && res.data) {
        setProfiles(res.data);
      }
    });
  }, []);

  const resetState = () => {
    setStep(1);
    setIsNewProject(false);
    setSelectedProjectId("");
    setNewProjectName("");
    setIsNewProtocol(false);
    setSelectedProtocolId("");
    setNewProtocolName("");
    setSiteNumber("");
    setSiteName("");
    setSiteAddress("");
    setSiteCity("");
    setSiteCountry("");
    setIsMicroZone(false);
    setMicroZoneName("");
    setAssignToManager(false);
    setSelectedManagerId("");
  };

  const openWizard = () => {
    resetState();
    setIsOpen(true);
  };

  const closeWizard = () => {
    setIsOpen(false);
  };

  const handleCountryChange = (country: string) => {
    setSiteCountry(country);
    if (!isMicroZone && COUNTRY_TO_REGION[country]) {
      // Auto mapping logic is handled visually and directly on submit
    }
  };

  // Validation
  const handleNextStep1 = () => {
    if (isNewProject && !newProjectName.trim()) {
      toast.error("El nombre del proyecto es obligatorio");
      return;
    }
    if (!isNewProject && !selectedProjectId) {
      toast.error("Debes seleccionar un proyecto primero");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (isNewProtocol && !newProtocolName.trim()) {
      toast.error("El nombre del protocolo es obligatorio");
      return;
    }
    if (!isNewProtocol && !selectedProtocolId) {
      toast.error("Debes seleccionar un protocolo primero");
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (!siteNumber.trim() || !siteName.trim() || !siteCountry) {
      toast.error("Los detalles del sitio son obligatorios");
      return;
    }
    if (isMicroZone && !microZoneName.trim()) {
      toast.error("Micro-zone name is required");
      return;
    }
    setStep(4);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let projectId = selectedProjectId;
      if (isNewProject) {
        const pRes = await createProject(newProjectName.trim());
        if (!pRes) throw new Error("Failed to create project");
        projectId = pRes.id;
      }

      let protocolId = selectedProtocolId;
      if (isNewProtocol) {
        const ptRes = await createProtocol(projectId, newProtocolName.trim());
        if (!ptRes) throw new Error("Failed to create protocol");
        protocolId = ptRes.id;
      }

      let finalRegion = COUNTRY_TO_REGION[siteCountry] || "Global";
      let microZoneId = null;

      if (isMicroZone) {
                finalRegion = microZoneName.trim();
      }

      const sRes = await createSite({
        name: siteName.trim(),
        id: crypto.randomUUID(),
        protocol_id: protocolId,
                site_number: siteNumber.trim(),
        address: siteAddress.trim(),
        city: siteCity.trim(),
        country: siteCountry,

      });

      if (!sRes) throw new Error("Failed to create site");

      if (assignToManager && selectedManagerId) {
        const assignRes = await assignSiteToManager(selectedManagerId, sRes.id);
        if (!assignRes) throw new Error("Failed to assign manager");
      }

      toast.success("Sitio creado exitosamente");
      await refreshAppData();
      closeWizard();
      onComplete();

    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred during creation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">Crear Infraestructura</h3>
        <p className="text-sm text-neutral-500 max-w-md mb-6">
          Utiliza el wizard guiado para crear un nuevo Proyecto, Protocolo y configurar Sitios con soporte para Micro-zonas.
        </p>
        <button
          onClick={openWizard}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Iniciar Wizard
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/50 backdrop-blur-[3px] p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && closeWizard()}>
      <div className="bg-white rounded-[16px] w-full max-w-[560px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Steps indicator */}
        <div className="pt-7 px-8 pb-0 shrink-0">
          <div className="flex items-start">
            {[1, 2, 3, 4].map((s, idx) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${step > s ? "bg-indigo-600 text-white" : step === s ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-neutral-100 text-neutral-400"}`}>
                    {step > s ? <Check className="w-[14px] h-[14px] stroke-[2.5px]" /> : s}
                  </div>
                  <span className="text-[10px] font-medium mt-1.5 text-neutral-400 hidden sm:block">{["Proyecto", "Protocolo", "Sitio", "Revisión"][idx]}</span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-[2px] mx-2 mt-[13px] transition-colors duration-300 ${step > s ? "bg-indigo-600" : "bg-neutral-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard body - Scrollable */}
        <div className="p-8 pb-6 overflow-y-auto">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">Proyecto</h3>
              <p className="text-[13px] text-neutral-500 mb-5">Selecciona un proyecto existente o crea uno nuevo.</p>

              <div className="flex flex-col gap-4">
                <label className={`p-4 border-[1.5px] rounded-xl cursor-pointer transition-all ${!isNewProject ? 'border-indigo-600 bg-indigo-50/50' : 'border-neutral-200 hover:border-indigo-300'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <input type="radio" checked={!isNewProject} onChange={() => setIsNewProject(false)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-[14px] font-bold text-neutral-900">Proyecto Existente</span>
                  </div>
                  {!isNewProject && (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="">-- Seleccionar --</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </label>

                <label className={`p-4 border-[1.5px] rounded-xl cursor-pointer transition-all ${isNewProject ? 'border-indigo-600 bg-indigo-50/50' : 'border-neutral-200 hover:border-indigo-300'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <input type="radio" checked={isNewProject} onChange={() => setIsNewProject(true)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-[14px] font-bold text-neutral-900">Nuevo Proyecto</span>
                  </div>
                  {isNewProject && (
                    <input
                      type="text"
                      placeholder="Nombre del proyecto"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleNextStep1()}
                    />
                  )}
                </label>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">Protocolo</h3>
              <p className="text-[13px] text-neutral-500 mb-5">Añade el protocolo clínico al proyecto.</p>

              <div className="flex flex-col gap-4">
                <label className={`p-4 border-[1.5px] rounded-xl cursor-pointer transition-all ${!isNewProtocol ? 'border-indigo-600 bg-indigo-50/50' : 'border-neutral-200 hover:border-indigo-300'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <input type="radio" checked={!isNewProtocol} onChange={() => setIsNewProtocol(false)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-[14px] font-bold text-neutral-900">Protocolo Existente</span>
                  </div>
                  {!isNewProtocol && (
                    <select
                      value={selectedProtocolId}
                      onChange={(e) => setSelectedProtocolId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="">-- Seleccionar --</option>
                      {protocols.filter(p => p.project_id === selectedProjectId).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </label>

                <label className={`p-4 border-[1.5px] rounded-xl cursor-pointer transition-all ${isNewProtocol ? 'border-indigo-600 bg-indigo-50/50' : 'border-neutral-200 hover:border-indigo-300'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <input type="radio" checked={isNewProtocol} onChange={() => setIsNewProtocol(true)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-[14px] font-bold text-neutral-900">Nuevo Protocolo</span>
                  </div>
                  {isNewProtocol && (
                    <input
                      type="text"
                      placeholder="Identificador del protocolo (ej. PRT-2024)"
                      value={newProtocolName}
                      onChange={(e) => setNewProtocolName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleNextStep2()}
                    />
                  )}
                </label>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-bold text-neutral-900 mb-1 tracking-tight">Detalles del Sitio</h3>
              <p className="text-[13px] text-neutral-500 mb-5">Ingresa la información geográfica e identificativa del sitio.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">Número <span className="text-red-500">*</span></label>
                    <input type="text" value={siteNumber} onChange={e => setSiteNumber(e.target.value)} placeholder="ej. 1377" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" autoFocus />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                    <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Fundación Oncológica..." className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">Dirección</label>
                  <input type="text" value={siteAddress} onChange={e => setSiteAddress(e.target.value)} placeholder="Calle, Av, Hospital..." className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">Ciudad</label>
                    <input type="text" value={siteCity} onChange={e => setSiteCity(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-medium text-neutral-600 mb-1.5">País <span className="text-red-500">*</span></label>
                    <select value={siteCountry} onChange={e => handleCountryChange(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-[13.5px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10">
                      <option value="">-- Seleccionar --</option>
                      {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-[13px] font-bold text-neutral-800 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> Micro-zona</h4>
                      <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                        {!isMicroZone && siteCountry ? `Mapeo auto: \${COUNTRY_TO_REGION[siteCountry] || 'Desconocido'}` : 'Sobrescribe la región general.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMicroZone(!isMicroZone)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none \${isMicroZone ? 'bg-indigo-600' : 'bg-neutral-300'} transition-colors duration-200 ease-in-out`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${isMicroZone ? 'translate-x-2' : '-translate-x-2'}`} />
                    </button>
                  </div>
                  {isMicroZone && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                      <input type="text" value={microZoneName} onChange={e => setMicroZoneName(e.target.value)} placeholder="ej. Cono Sur, EMEA North" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-[13px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-[18px] font-bold text-neutral-900 tracking-tight">Revisión Final</h3>
                <p className="text-[13px] text-neutral-500">Verifica la información antes de crear la infraestructura.</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <span className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-widest">Proyecto</span>
                    <div className="text-[14px] font-semibold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                      {isNewProject ? newProjectName : projects.find(p => p.id === selectedProjectId)?.name}
                      {isNewProject && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">NUEVO</span>}
                    </div>
                  </div>
                  <div className="flex-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <span className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-widest">Protocolo</span>
                    <div className="text-[14px] font-semibold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                      {isNewProtocol ? newProtocolName : protocols.find(p => p.id === selectedProtocolId)?.name}
                      {isNewProtocol && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">NUEVO</span>}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
                  <div className="flex items-start justify-between mb-3 border-b border-neutral-100 pb-2">
                    <div>
                      <span className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-widest">Sitio</span>
                      <div className="text-[16px] font-bold text-neutral-900 leading-tight">#{siteNumber} - {siteName}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-[12.5px]">
                    <div><span className="text-neutral-500">Dir:</span> <span className="font-medium text-neutral-900">{siteAddress || '-'}</span></div>
                    <div><span className="text-neutral-500">Ciudad:</span> <span className="font-medium text-neutral-900">{siteCity || '-'}</span></div>
                    <div><span className="text-neutral-500">País:</span> <span className="font-medium text-neutral-900">{siteCountry}</span></div>
                    <div><span className="text-neutral-500">Región:</span> <span className="font-medium text-indigo-700">{isMicroZone ? microZoneName + ' (MZ)' : COUNTRY_TO_REGION[siteCountry]}</span></div>
                  </div>
                </div>

                <div className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={assignToManager} onChange={e => setAssignToManager(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-neutral-300 focus:ring-indigo-500" />
                    <span className="text-[13.5px] font-semibold text-neutral-900">Asignar Manager al sitio ahora</span>
                  </label>
                  {assignToManager && (
                    <div className="mt-3 pl-6 animate-in fade-in slide-in-from-top-1">
                      <select value={selectedManagerId} onChange={e => setSelectedManagerId(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 bg-white rounded-lg text-[13px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10">
                        <option value="">-- Seleccionar Manager --</option>
                        {profiles.filter(p => p.role === 'manager').map(m => (
                          <option key={m.id} value={m.id}>{(m.first_name ? m.first_name + " " + (m.last_name || "") : m.email)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-neutral-50/80 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <span className="text-[12px] text-neutral-400 font-medium hidden sm:block">Paso {step} de 4</span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} disabled={loading} className="px-3.5 py-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-50">
                ← Atrás
              </button>
            )}
            <button onClick={closeWizard} disabled={loading} className="px-3.5 py-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-50 hidden sm:block">
              Cancelar
            </button>
            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 1) handleNextStep1();
                  else if (step === 2) handleNextStep2();
                  else if (step === 3) handleNextStep3();
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-md shadow-sm transition-colors"
              >
                Siguiente →
              </button>
            ) : (
              <button onClick={handleSave} disabled={loading} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[13px] font-medium rounded-md shadow-sm transition-colors flex items-center gap-1.5">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                {loading ? "Guardando..." : "Confirmar y Crear"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
