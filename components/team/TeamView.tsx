import React, { useState, useMemo } from "react";
import { 
  UserProfile, 
  Project, 
  Protocol, 
  UserProjectAssignment, 
  UserProtocolAssignment 
} from "@/lib/types";
import { 
  Check, 
  Users, 
  Shield, 
  ChevronDown, 
  ChevronRight, 
  FolderOpen,
  UserCheck,
  UserX,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface TeamViewProps {
  profiles: UserProfile[];
  projects: Project[];
  protocols: Protocol[];
  projectAssignments: UserProjectAssignment[];
  protocolAssignments: UserProtocolAssignment[];
  onUpdateAssignments: (userId: string, projectIds: string[], protocolIds: string[]) => void;
  onUpdateUserStatus: (userId: string, status: "active" | "rejected") => void;
  onRefresh?: () => void;
}

export function TeamView({ 
  profiles, 
  projects, 
  protocols, 
  projectAssignments, 
  protocolAssignments,
  onUpdateAssignments,
  onUpdateUserStatus,
  onRefresh
}: TeamViewProps) {
  const staffUsers = useMemo(() => 
    profiles.filter(u => u.role !== "manager" && u.role !== "super_admin"),
    [profiles]
  );
  
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Sync selectedUserId with staffUsers
  React.useEffect(() => {
    if (staffUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(staffUsers[0].id);
    }
  }, [staffUsers, selectedUserId]);

  // Call refresh on mount
  React.useEffect(() => {
    onRefresh?.();
  }, [onRefresh]);

  const selectedUser = staffUsers.find(u => u.id === selectedUserId) || staffUsers[0];

  if (staffUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500 space-y-4">
        <Users className="w-12 h-12 text-neutral-300" />
        <div className="text-center">
          <p className="font-medium text-neutral-900">No team members found</p>
          <p className="text-sm">If you have staff assigned, they will appear here.</p>
        </div>
        <button 
          onClick={() => onRefresh?.()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Refresh Team Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Team Management</h2>
        <p className="text-neutral-500">Manage your team and their assignments.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Staff List */}
        <div className="w-full md:w-64 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col shrink-0">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 hidden md:flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-neutral-900">Team Members</h3>
          </div>
          <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-3 md:p-2 gap-2 md:gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {staffUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`shrink-0 md:w-full text-left px-4 md:px-3 py-2 md:py-2.5 rounded-full md:rounded-xl text-sm font-medium transition-colors ${
                  selectedUserId === user.id 
                    ? "bg-indigo-600 text-white md:bg-indigo-50 md:text-indigo-700 shadow-sm md:shadow-none border border-indigo-600 md:border-transparent" 
                    : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 md:border-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="whitespace-nowrap">{user.first_name} {user.last_name}</span>
                  {user.status === "pending" && <Clock className="w-3 h-3 text-amber-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Assignments Panel - Keyed by userId to reset state */}
        <AssignmentManager 
          key={selectedUser.id}
          user={selectedUser}
          projects={projects}
          protocols={protocols}
          projectAssignments={projectAssignments.filter(a => a.user_id === selectedUser.id)}
          protocolAssignments={protocolAssignments.filter(a => a.user_id === selectedUser.id)}
          onUpdateAssignments={onUpdateAssignments}
          onUpdateUserStatus={onUpdateUserStatus}
        />
      </div>
    </div>
  );
}

interface AssignmentManagerProps {
  user: UserProfile;
  projects: Project[];
  protocols: Protocol[];
  projectAssignments: UserProjectAssignment[];
  protocolAssignments: UserProtocolAssignment[];
  onUpdateAssignments: (userId: string, projectIds: string[], protocolIds: string[]) => void;
  onUpdateUserStatus: (userId: string, status: "active" | "rejected") => void;
}

function AssignmentManager({
  user,
  projects,
  protocols,
  projectAssignments,
  protocolAssignments,
  onUpdateAssignments,
  onUpdateUserStatus
}: AssignmentManagerProps) {
  const [localProjectIds, setLocalProjectIds] = useState<string[]>(projectAssignments.map(a => a.project_id));
  const [localProtocolIds, setLocalProtocolIds] = useState<string[]>(protocolAssignments.map(a => a.protocol_id));

  const toggleProject = (projectId: string) => {
    setLocalProjectIds(prev => {
      const isSelected = prev.includes(projectId);
      if (isSelected) {
        // Unassign project and its protocols
        const projectProtocols = protocols.filter(p => p.project_id === projectId).map(p => p.id);
        setLocalProtocolIds(prevProtocols => prevProtocols.filter(id => !projectProtocols.includes(id)));
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const toggleProtocol = (protocolId: string) => {
    setLocalProtocolIds(prev => 
      prev.includes(protocolId) ? prev.filter(id => id !== protocolId) : [...prev, protocolId]
    );
  };

  const handleSave = () => {
    onUpdateAssignments(user.id, localProjectIds, localProtocolIds);
    toast.success("Assignments updated successfully");
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col min-h-0">
      <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">{user.first_name}&apos;s Profile</span>
          </h3>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
            user.status === "active" ? "bg-emerald-100 text-emerald-700" :
            user.status === "pending" ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          }`}>
            {user.status}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {user.status === "pending" && (
            <>
              <button
                onClick={() => onUpdateUserStatus(user.id, "active")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                <UserCheck className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => onUpdateUserStatus(user.id, "rejected")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                <UserX className="w-3 h-3" />
                Reject
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shrink-0"
          >
            Save Assignments
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">Role</p>
            <p className="text-sm font-semibold text-neutral-900 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">Email</p>
            <p className="text-sm font-semibold text-neutral-900 truncate">{user.email}</p>
          </div>
        </div>

        <h4 className="text-sm font-bold text-neutral-900 mb-4">Project & Protocol Assignments</h4>
        
        {projects.map(project => {
          const isProjectSelected = localProjectIds.includes(project.id);
          const projectProtocols = protocols.filter(p => p.project_id === project.id);
          
          return (
            <div 
              key={project.id} 
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                isProjectSelected 
                  ? "border-indigo-200 bg-indigo-50/30 shadow-sm" 
                  : "border-neutral-200 bg-white hover:border-indigo-200"
              }`}
            >
              {/* Project Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => toggleProject(project.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isProjectSelected ? "bg-indigo-600 text-white" : "border-2 border-neutral-300 text-transparent"
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isProjectSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${isProjectSelected ? "text-indigo-900" : "text-neutral-700"}`}>
                        {project.name}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">{project.id}</div>
                    </div>
                  </div>
                </div>
                <div className="text-neutral-400">
                  {isProjectSelected ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>

              {/* Protocols (Progressive Disclosure) */}
              {isProjectSelected && projectProtocols.length > 0 && (
                <div className="p-4 pt-0 border-t border-indigo-100/50 bg-white/50">
                  <h5 className="text-xs font-semibold text-indigo-900 mb-3 uppercase tracking-wider mt-4 px-1">
                    Select Protocols for {project.name}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projectProtocols.map(protocol => {
                      const isProtocolSelected = localProtocolIds.includes(protocol.id);
                      return (
                        <button
                          key={protocol.id}
                          onClick={(e) => { e.stopPropagation(); toggleProtocol(protocol.id); }}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                            isProtocolSelected 
                              ? "border-indigo-500 bg-white shadow-sm ring-1 ring-indigo-500" 
                              : "border-neutral-200 bg-white hover:border-indigo-300 hover:bg-neutral-50"
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isProtocolSelected ? "bg-indigo-600 text-white" : "border-2 border-neutral-300"
                          }`}>
                            {isProtocolSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isProtocolSelected ? "text-indigo-900" : "text-neutral-700"}`}>
                              {protocol.name}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">{protocol.id}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
