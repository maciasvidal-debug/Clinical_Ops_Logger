import { supabase } from "./supabase";
import { Region } from "./types";
import { logError } from "./utils";

export async function createRegion(name: string, description?: string): Promise<Region> {
  const { data, error } = await supabase
    .from("regions")
    .insert([{ name, description }])
    .select()
    .single();

  if (error) {
    logError(error, "create_region");
    throw error;
  }
  return data;
}
