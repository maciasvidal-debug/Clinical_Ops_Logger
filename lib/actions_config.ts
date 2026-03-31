import { supabase } from "./supabase";
import { UserRole, DbActivityCategory, DbActivityTask, DbActivitySubtask } from "./types";


function parseSupabaseError(error: unknown, defaultMsg: string): string {
  if (!error) return defaultMsg;

  if (typeof error === 'string') {
    return error;
  }

  // Create a safe reference we can access properties on
  const errObj = typeof error === 'object' ? (error as Record<string, unknown>) : {};

  const code = typeof errObj.code === 'string' ? errObj.code : undefined;
  const message = typeof errObj.message === 'string' ? errObj.message : undefined;

  // 42501 is Postgres Insufficient Privilege
  if (code === '42501' || (message && message.includes('violates row-level security'))) {
    return 'Unauthorized: You do not have permission to perform this action.';
  }

  if (message === 'Failed to fetch' || (message && message.includes('Network'))) {
    return 'Network error: Please check your connection.';
  }

  return error instanceof Error ? error.message : (message || defaultMsg);
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

export async function createActivityTask(categoryId: string, name: string, role_context?: "site_led" | "cro_led" | "shared" | null, staff_roles?: string[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("activity_tasks")
      .insert([{ category_id: categoryId, name, role_context, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    if (staff_roles && staff_roles.length > 0) {
      const taskRoles = staff_roles.map((r: string) => ({ task_id: data.id, role: r }));
      await supabase.from("task_roles").insert(taskRoles);
    }
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error creating task:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to create task") };
  }
}

export async function createActivityTasks(
  categoryId: string,
  tasks: { name: string; role_context?: "site_led" | "cro_led" | "shared" | null; staff_roles?: string[] }[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (tasks.length === 0) return { success: true, data: [] };

    const taskInserts = tasks.map((t) => ({
      category_id: categoryId,
      name: t.name,
      role_context: t.role_context,
      is_active: true,
    }));

    const { data: insertedTasks, error: taskError } = await supabase
      .from("activity_tasks")
      .insert(taskInserts)
      .select();

    if (taskError) throw taskError;

    const roleInserts: { task_id: string; role: string }[] = [];
    tasks.forEach((task, index) => {
      if (task.staff_roles && task.staff_roles.length > 0) {
        const taskId = insertedTasks[index].id;
        task.staff_roles.forEach((role) => {
          roleInserts.push({ task_id: taskId, role });
        });
      }
    });

    if (roleInserts.length > 0) {
      const { error: roleError } = await supabase.from("task_roles").insert(roleInserts);
      if (roleError) throw roleError;
    }

    return { success: true, data: insertedTasks };
  } catch (error: unknown) {
    console.error("Error creating tasks in bulk:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to create tasks") };
  }
}

export async function updateActivityTask(id: string, name: string, role_context?: "site_led" | "cro_led" | "shared" | null, staff_roles?: string[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("activity_tasks")
      .update(role_context !== undefined ? { name, role_context } : { name })
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

export async function addCategoryRoles(categoryId: string, roles: UserRole[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (roles.length === 0) return { success: true };

    const inserts = roles.map((role) => ({
      category_id: categoryId,
      role,
    }));

    const { error } = await supabase
      .from("category_roles")
      .insert(inserts);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Error adding roles to category:", error);
    return { success: false, error: parseSupabaseError(error, "Failed to add roles") };
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

export async function updateCategoryRoles(
  categoryId: string,
  roles: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Start by fetching current roles
    const { data: currentRoles, error: fetchError } = await supabase
      .from("category_roles")
      .select("role")
      .eq("category_id", categoryId);

    if (fetchError) throw fetchError;

    const currentRoleSet = new Set(currentRoles?.map((r) => r.role) || []);
    const newRoleSet = new Set(roles);

    const rolesToAdd = roles.filter((r) => !currentRoleSet.has(r));
    const rolesToRemove = Array.from(currentRoleSet).filter(
      (r) => !newRoleSet.has(r)
    );

    // Remove old roles
    if (rolesToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from("category_roles")
        .delete()
        .eq("category_id", categoryId)
        .in("role", rolesToRemove);

      if (removeError) throw removeError;
    }

    // Add new roles
    if (rolesToAdd.length > 0) {
      const inserts = rolesToAdd.map((role) => ({
        category_id: categoryId,
        role,
      }));
      const { error: insertError } = await supabase
        .from("category_roles")
        .insert(inserts);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating category roles:", error);
    return {
      success: false,
      error: parseSupabaseError(error, "Failed to update category roles"),
    };
  }
}
