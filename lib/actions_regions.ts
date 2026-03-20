import { supabase } from "./supabase";
import { Region } from "./types";

export async function createRegion(name: string, description?: string): Promise<Region> {
  const { data, error } = await supabase
    .from("regions")
    .insert([{ name, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
