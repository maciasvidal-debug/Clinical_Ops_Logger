import { supabase } from "./supabase";
import { UserRole, DbActivityCategory, DbActivityTask, DbActivitySubtask } from "./types";


function parseSupabaseError(error: any, defaultMsg: string): string {
  if (!error) return defaultMsg;
  // 42501 is Postgres Insufficient Privilege
  if (error.code === '42501' || error.message?.includes('violates row-level security')) {
    return 'Unauthorized: You do not have permission to perform this action.';
  }
  if (error.message === 'Failed to fetch' || error.message?.includes('Network')) {
    return 'Network error: Please check your connection.';
  }
  return error instanceof Error ? error.message : (error.message || defaultMsg);
}

// --- Categories ---


export async function createActivityCategory(name: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("activity_categories")
      .insert([{ name, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to create category") };
  }
}

export async function updateActivityCategory(id: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("activity_categories")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error updating category:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to update category") };
  }
}

export async function deleteActivityCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("activity_categories")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting category:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to delete category") };
  }
}

// --- Tasks ---

export async function createActivityTask(categoryId: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("activity_tasks")
      .insert([{ category_id: categoryId, name, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error creating task:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to create task") };
  }
}

export async function updateActivityTask(id: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("activity_tasks")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error updating task:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to update task") };
  }
}

export async function deleteActivityTask(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("activity_tasks")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting task:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to delete task") };
  }
}

// --- Subtasks ---

export async function createActivitySubtask(taskId: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("activity_subtasks")
      .insert([{ task_id: taskId, name, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error creating subtask:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to create subtask") };
  }
}

export async function updateActivitySubtask(id: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("activity_subtasks")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error updating subtask:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to update subtask") };
  }
}

export async function deleteActivitySubtask(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("activity_subtasks")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting subtask:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to delete subtask") };
  }
}

// --- Category Roles ---

export async function addCategoryRole(categoryId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("category_roles")
      .insert([{ category_id: categoryId, role }]);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Error adding role to category:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to add role") };
  }
}

export async function removeCategoryRole(categoryId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("category_roles")
      .delete()
      .match({ category_id: categoryId, role });

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Error removing role from category:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to remove role") };
  }
}
