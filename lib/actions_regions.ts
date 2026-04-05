import { Region } from "./types";
import { generateId } from "./local_db";

export async function createRegion(name: string, description?: string): Promise<Region> {
  // Not fully supported offline currently, stub
  return { id: generateId(), name, description, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}
