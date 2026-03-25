import { supabase } from "./supabase";
import { Project, Protocol, Site, UserProfile } from "./types";

export async function createProject(name: string, description?: string): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert([{ name, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createProtocol(projectId: string, name: string): Promise<Protocol> {
  const { data, error } = await supabase
    .from("protocols")
    .insert([{ project_id: projectId, name }])
    .select()
    .single();

  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from("sites")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface CreateMicroZonePayload {
  site_id: string;
  site_number?: string;
  name: string;
}

export async function createMicroZone(payload: CreateMicroZonePayload): Promise<any> {
  const { data, error } = await supabase
    .from("micro_zones")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function assignSiteToManager(userId: string, siteId: string): Promise<boolean> {
  const { error } = await supabase
    .from("user_site_assignments")
    .upsert([{ user_id: userId, site_id: siteId }]);

  if (error) {
    console.error("Error assigning site:", error);
    return false;
  }
  return true;
}

export async function fetchProfiles(): Promise<{ success: boolean; data?: UserProfile[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("first_name");

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error fetching profiles:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
