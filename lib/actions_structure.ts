import type { Project, Protocol, Site, UserProfile } from "./types.ts";
import { localSaveProject, localSaveProtocol, localSaveSite, generateId, localGetProfile } from "./local_db.ts";

export async function createProject(name: string, description?: string): Promise<Project> {
  const proj: Project = {
    id: generateId(),
    name,
    description,
    created_at: new Date().toISOString()
  };
  await localSaveProject(proj);
  return proj;
}

export async function createProtocol(projectId: string, name: string): Promise<Protocol> {
  const prot: Protocol = { id: generateId(), project_id: projectId, name, created_at: new Date().toISOString() };
  await localSaveProtocol(prot);
  return prot;
}

export interface CreateSitePayload {
  protocol_id: string;
  id: string;
  site_number?: string;
  name: string;
  address?: string;
  city?: string;
  country: string;
  region_id?: string;
}

export async function createSite(payload: CreateSitePayload): Promise<Site> {
  const site: Site = {
    ...payload,
    created_at: new Date().toISOString()
  };
  await localSaveSite(site);
  return site;
}

export interface CreateMicroZonePayload {
  site_id: string;
  site_number?: string;
  name: string;
}

export async function createMicroZone(payload: CreateMicroZonePayload): Promise<any> {
  // Not fully supported offline currently, stub
  return { ...payload, id: generateId() };
}

export async function assignSiteToManager(userId: string, siteId: string): Promise<boolean> {
  // Not fully supported offline currently, stub
  return true;
}

export async function fetchProfiles(): Promise<{ success: boolean; data?: UserProfile[]; error?: string }> {
  try {
    const profile = await localGetProfile();
    return { success: true, data: profile ? [profile] : [] };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
