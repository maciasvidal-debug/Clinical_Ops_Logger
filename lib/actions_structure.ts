import { supabase } from "./supabase";
import { Project, Protocol, Site } from "./types";

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
