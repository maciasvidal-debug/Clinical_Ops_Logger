import { localGetCategories, localSaveCategory, generateId } from "./local_db";
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


export async function createActivityCategory(name: string): Promise<{ success: boolean; data?: DbActivityCategory; error?: string }> {
  try {
    const cat: DbActivityCategory = {
      id: generateId(),
      name,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await localSaveCategory(cat);
    return { success: true, data: cat };
  } catch (error: unknown) {
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateActivityCategory(id: string, name: string): Promise<{ success: boolean; data?: DbActivityCategory; error?: string }> {
  try {
    const cats = await localGetCategories();
    const cat = cats.find(c => c.id === id);
    if (!cat) throw new Error("Not found");
    cat.name = name;
    await localSaveCategory(cat);
    return { success: true, data: cat };
  } catch (error: unknown) {
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteActivityCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cats = await localGetCategories();
    const cat = cats.find(c => c.id === id);
    if (cat) {
        cat.is_active = false;
        await localSaveCategory(cat);
    }
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: "Failed to delete category" };
  }
}

// --- Tasks ---

export async function createActivityTask(categoryId: string, name: string, role_context?: "site_led" | "cro_led" | "shared" | null, staff_roles?: string[]): Promise<{ success: boolean; data?: DbActivityTask; error?: string }> {
  try {
    const cats = await localGetCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (!cat) throw new Error("Not found");

    const task: DbActivityTask = {
        id: generateId(),
        category_id: categoryId,
        name,
        role_context: role_context ?? undefined,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        task_roles: staff_roles?.map(r => ({ role: r as UserRole }))
    };
    if (!cat.activity_tasks) cat.activity_tasks = [];
    cat.activity_tasks.push(task);
    await localSaveCategory(cat);

    return { success: true, data: task };
  } catch (error: unknown) {
    return { success: false, error: "Failed to create task" };
  }
}

export async function createActivityTasks(
  categoryId: string,
  tasks: { name: string; role_context?: "site_led" | "cro_led" | "shared" | null; staff_roles?: string[] }[]
): Promise<{ success: boolean; data?: DbActivityTask[]; error?: string }> {
  try {
    const cats = await localGetCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (!cat) throw new Error("Not found");

    if (!cat.activity_tasks) cat.activity_tasks = [];

    const newTasks = tasks.map(t => ({
        id: generateId(),
        category_id: categoryId,
        name: t.name,
        role_context: t.role_context ?? undefined,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        task_roles: t.staff_roles?.map(r => ({ role: r as UserRole }))
    }));
    cat.activity_tasks.push(...newTasks);
    await localSaveCategory(cat);

    return { success: true, data: newTasks };
  } catch (error: unknown) {
    return { success: false, error: "Failed to create tasks" };
  }
}

export async function updateActivityTask(id: string, name: string, role_context?: "site_led" | "cro_led" | "shared" | null, staff_roles?: string[]): Promise<{ success: boolean; data?: DbActivityTask; error?: string }> {
  try {
    const cats = await localGetCategories();
    let foundTask: DbActivityTask | null = null;
    let foundCat: DbActivityCategory | null = null;

    for (const c of cats) {
        const t = c.activity_tasks?.find(t => t.id === id);
        if (t) {
            foundTask = t;
            foundCat = c;
            break;
        }
    }
    if (!foundTask || !foundCat) throw new Error("Not found");

    foundTask.name = name;
    if (role_context !== undefined) foundTask.role_context = role_context ?? undefined;
    if (staff_roles) foundTask.task_roles = staff_roles.map(r => ({ role: r as UserRole }));

    await localSaveCategory(foundCat);

    return { success: true, data: foundTask };
  } catch (error: unknown) {
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteActivityTask(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cats = await localGetCategories();
    for (const c of cats) {
        const t = c.activity_tasks?.find(t => t.id === id);
        if (t) {
            t.is_active = false;
            await localSaveCategory(c);
            break;
        }
    }
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: "Failed to delete task" };
  }
}

// --- Subtasks ---

export async function createActivitySubtask(taskId: string, name: string): Promise<{ success: boolean; data?: DbActivitySubtask; error?: string }> {
  try {
    const cats = await localGetCategories();
    let foundTask: DbActivityTask | null = null;
    let foundCat: DbActivityCategory | null = null;

    for (const c of cats) {
        const t = c.activity_tasks?.find(t => t.id === taskId);
        if (t) {
            foundTask = t;
            foundCat = c;
            break;
        }
    }
    if (!foundTask || !foundCat) throw new Error("Not found");

    const subtask: DbActivitySubtask = {
        id: generateId(),
        task_id: taskId,
        name,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    if (!foundTask.activity_subtasks) foundTask.activity_subtasks = [];
    foundTask.activity_subtasks.push(subtask);
    await localSaveCategory(foundCat);

    return { success: true, data: subtask };
  } catch (error: unknown) {
    return { success: false, error: "Failed to create subtask" };
  }
}

export async function updateActivitySubtask(id: string, name: string): Promise<{ success: boolean; data?: DbActivitySubtask; error?: string }> {
  try {
    const cats = await localGetCategories();
    let foundSub: DbActivitySubtask | null = null;
    let foundCat: DbActivityCategory | null = null;

    for (const c of cats) {
        if (c.activity_tasks) {
            for (const t of c.activity_tasks) {
                const s = t.activity_subtasks?.find(s => s.id === id);
                if (s) {
                    foundSub = s;
                    foundCat = c;
                    break;
                }
            }
        }
    }
    if (!foundSub || !foundCat) throw new Error("Not found");

    foundSub.name = name;
    await localSaveCategory(foundCat);

    return { success: true, data: foundSub };
  } catch (error: unknown) {
    return { success: false, error: "Failed to update subtask" };
  }
}

export async function deleteActivitySubtask(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cats = await localGetCategories();
    for (const c of cats) {
        if (c.activity_tasks) {
            for (const t of c.activity_tasks) {
                const s = t.activity_subtasks?.find(s => s.id === id);
                if (s) {
                    s.is_active = false;
                    await localSaveCategory(c);
                    break;
                }
            }
        }
    }
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: "Failed to delete subtask" };
  }
}

// --- Category Roles ---

export async function addCategoryRole(categoryId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
    return updateCategoryRoles(categoryId, [role]);
}

export async function addCategoryRoles(categoryId: string, roles: UserRole[]): Promise<{ success: boolean; error?: string }> {
    return updateCategoryRoles(categoryId, roles);
}

export async function removeCategoryRole(categoryId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
    const cats = await localGetCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (cat && cat.category_roles) {
        cat.category_roles = cat.category_roles.filter(r => r.role !== role);
        await localSaveCategory(cat);
    }
    return { success: true };
}

export async function updateCategoryRoles(
  categoryId: string,
  roles: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const cats = await localGetCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (!cat) throw new Error("Not found");

    cat.category_roles = roles.map(r => ({ role: r as UserRole }));
    await localSaveCategory(cat);

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: "Failed to update category roles",
    };
  }
}
