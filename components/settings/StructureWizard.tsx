import React, { useState } from "react";
import { Project, Protocol, Region } from "@/lib/types";
import { createProject, createProtocol, createSite } from "@/lib/actions_structure";
import { createRegion } from "@/lib/actions_regions";
import { toast } from "sonner";
import { Building, MapPin, Plus, CheckCircle, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";

// Helper for mapping countries to regions (continents) initially
const COUNTRY_TO_REGION: Record<string, string> = {
  "USA": "North America",
  "Canada": "North America",
  "Mexico": "North America",
  "Brazil": "South America",
  "Argentina": "South America",
  "Chile": "South America",
  "Colombia": "South America",
  "Peru": "South America",
  "UK": "Europe",
  "France": "Europe",
  "Germany": "Europe",
  "Italy": "Europe",
  "Spain": "Europe",
  "Japan": "Asia",
  "China": "Asia",
  "India": "Asia",
  "Australia": "Oceania",
  "New Zealand": "Oceania"
};

const ALL_COUNTRIES = Object.keys(COUNTRY_TO_REGION).sort();

interface StructureWizardProps {
  onComplete: () => void;
}

export function StructureWizard({ onComplete }: StructureWizardProps) {
  const { projects, protocols, regions, fetchRegions, refreshAppData, user, profile } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Project
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isNewProject, setIsNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Step 2: Protocol
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>("");
  const [isNewProtocol, setIsNewProtocol] = useState(false);
  const [newProtocolName, setNewProtocolName] = useState("");

  // Step 3: Site
  const [siteNumber, setSiteNumber] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteCity, setSiteCity] = useState("");
  const [siteCountry, setSiteCountry] = useState("");
  const [siteRegionId, setSiteRegionId] = useState<string>("");

  // Micro-zone
  const [isMicroZone, setIsMicroZone] = useState(false);
  const [microZoneName, setMicroZoneName] = useState("");

  // Auto-complete continent handler
  const handleCountryChange = (country: string) => {
    setSiteCountry(country);
    if (!isMicroZone && country) {
      const mappedContinent = COUNTRY_TO_REGION[country];
      if (mappedContinent) {
        // Find existing region that matches
        const existingRegion = regions.find(r => r.name.toLowerCase() === mappedContinent.toLowerCase());
        if (existingRegion) {
          setSiteRegionId(existingRegion.id);
        } else {
           // We'll create it on save or just leave it blank for manual
           setSiteRegionId("auto-create-" + mappedContinent);
        }
      }
    }
  };

  const handleNextStep1 = async () => {
    if (isNewProject && !newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!isNewProject && !selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = async () => {
    if (isNewProtocol && !newProtocolName.trim()) {
      toast.error("Protocol name is required");
      return;
    }
    if (!isNewProtocol && !selectedProtocolId) {
      toast.error("Please select a protocol");
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = async () => {
    if (!siteName.trim() || !siteCountry.trim() || !siteNumber.trim()) {
      toast.error("Site number, name, and country are required");
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
      let finalProjectId = selectedProjectId;
      if (isNewProject) {
        const p = await createProject(newProjectName.trim());
        finalProjectId = p.id;
      }

      let finalProtocolId = selectedProtocolId;
      if (isNewProtocol) {
        const prot = await createProtocol(finalProjectId, newProtocolName.trim());
        finalProtocolId = prot.id;
      }

      let finalRegionId = siteRegionId;
      if (isMicroZone) {
         // Create micro zone
         const r = await createRegion(microZoneName.trim());
         finalRegionId = r.id;
      } else if (finalRegionId.startsWith("auto-create-")) {
         // Auto create missing continent
         const continentName = finalRegionId.replace("auto-create-", "");
         const r = await createRegion(continentName);
         finalRegionId = r.id;
      }

      await createSite({
        id: siteNumber.trim(),
        protocol_id: finalProtocolId,
        name: siteName.trim(),
        address: siteAddress.trim(),
        city: siteCity.trim(),
        country: siteCountry,
        region_id: finalRegionId || undefined
      });

      toast.success("Structure created successfully!");
      if (user && profile) {
        await refreshAppData(user.id, profile.role);
        fetchRegions();
      }
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save structure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get protocol list filtered by project
  const availableProtocols = protocols.filter(p => p.project_id === selectedProjectId);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full max-w-2xl mx-auto my-8">
      {/* Header / Stepper */}
      <div className="bg-indigo-50 border-b border-indigo-100 p-6">
        <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
          <Building className="text-indigo-600" />
          Structure Wizard
        </h2>
        <p className="text-indigo-700/70 text-sm mt-1">Configure Projects, Protocols, and Sites.</p>

        <div className="flex items-center mt-6">
          <div className={`flex items-center \${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 \${step >= 1 ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-gray-300'}`}>1</div>
            <span className="ml-2 text-sm font-medium">Project</span>
          </div>
          <div className={`flex-1 h-px mx-4 \${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center \${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 \${step >= 2 ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-gray-300'}`}>2</div>
            <span className="ml-2 text-sm font-medium">Protocol</span>
          </div>
          <div className={`flex-1 h-px mx-4 \${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center \${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 \${step >= 3 ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-gray-300'}`}>3</div>
            <span className="ml-2 text-sm font-medium">Site</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* STEP 1: PROJECT */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-medium text-gray-900">Select or Create a Project</h3>

            <div className="flex gap-4">
              <button
                onClick={() => setIsNewProject(false)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all \${!isNewProject ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Existing Project
              </button>
              <button
                onClick={() => setIsNewProject(true)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all \${isNewProject ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Plus size={18} /> New Project
              </button>
            </div>

            {!isNewProject ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {projects.length === 0 && <p className="text-sm text-amber-600 mt-2">No projects found. Please create one.</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Project Name</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Oncology Phase 3"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNextStep1}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROTOCOL */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-medium text-gray-900">Select or Create a Protocol</h3>

            <div className="flex gap-4">
              <button
                onClick={() => setIsNewProtocol(false)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all \${!isNewProtocol ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                disabled={isNewProject} // Force new protocol if project is new
              >
                Existing Protocol
              </button>
              <button
                onClick={() => setIsNewProtocol(true)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all \${isNewProtocol ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Plus size={18} /> New Protocol
              </button>
            </div>

            {!isNewProtocol ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protocol for this Project</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedProtocolId}
                  onChange={(e) => setSelectedProtocolId(e.target.value)}
                >
                  <option value="">-- Select Protocol --</option>
                  {availableProtocols.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {availableProtocols.length === 0 && <p className="text-sm text-amber-600 mt-2">No protocols found for this project. Please create one.</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Protocol Name</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. JIT-001"
                  value={newProtocolName}
                  onChange={(e) => setNewProtocolName(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={handleNextStep2}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SITE */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-medium text-gray-900">Site Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Number *</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. 1377"
                  value={siteNumber}
                  onChange={(e) => setSiteNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name *</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Fundación Oncológica"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Street name, etc."
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={siteCity}
                  onChange={(e) => setSiteCity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={siteCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                >
                  <option value="">-- Select Country --</option>
                  {ALL_COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-500" />
                    Geographic Zoning
                  </h4>
                  <p className="text-xs text-gray-500">
                    {!isMicroZone && siteCountry ? `Auto-assigned to Continent: \${COUNTRY_TO_REGION[siteCountry] || 'Unknown'}` : 'Create a specific micro-zone for tailored reporting'}
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={isMicroZone} onChange={() => setIsMicroZone(!isMicroZone)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors \${isMicroZone ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${isMicroZone ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Micro-zone</span>
                </label>
              </div>

              {isMicroZone && (
                <div className="mt-3 animate-in fade-in">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Cono Sur, EMEA North"
                    value={microZoneName}
                    onChange={(e) => setMicroZoneName(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={handleNextStep3}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                Review <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold text-indigo-900 mb-2">Review & Confirm</h3>
              <p className="text-indigo-700/80">Please verify the structure details below before saving.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white p-4 border rounded-lg shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase">Project</span>
                <p className="font-medium text-gray-900 text-lg">{isNewProject ? newProjectName : projects.find(p => p.id === selectedProjectId)?.name}</p>
                {isNewProject && <span className="inline-block px-2 py-0.5 mt-1 bg-green-100 text-green-800 text-xs font-medium rounded">New</span>}
              </div>
              <div className="bg-white p-4 border rounded-lg shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase">Protocol</span>
                <p className="font-medium text-gray-900 text-lg">{isNewProtocol ? newProtocolName : availableProtocols.find(p => p.id === selectedProtocolId)?.name}</p>
                {isNewProtocol && <span className="inline-block px-2 py-0.5 mt-1 bg-green-100 text-green-800 text-xs font-medium rounded">New</span>}
              </div>
              <div className="bg-white p-4 border rounded-lg shadow-sm md:col-span-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Site</span>
                <p className="font-bold text-gray-900 text-xl">Site {siteNumber} - {siteName}</p>
                <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-2">
                  <p><strong>Address:</strong> {siteAddress || '-'}</p>
                  <p><strong>City:</strong> {siteCity || '-'}</p>
                  <p><strong>Country:</strong> {siteCountry}</p>
                  <p><strong>Zone:</strong> {isMicroZone ? microZoneName + ' (Micro-zone)' : COUNTRY_TO_REGION[siteCountry] || 'Auto'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setStep(3)}
                className="text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100"
                disabled={loading}
              >
                Back to Edit
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                {loading ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
