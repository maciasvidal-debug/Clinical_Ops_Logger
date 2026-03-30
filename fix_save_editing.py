import re

with open('components/settings/SettingsView.tsx', 'r') as f:
    content = f.read()

# Replace updateActivityCategory import
old_import = "updateActivityCategory,"
new_import = "updateActivityCategory,\n  updateCategoryRoles,"
content = content.replace(old_import, new_import)

# Replace saveEditing function
old_save_editing = """  const saveEditing = async (
    id: string,
    type: "category" | "task" | "subtask",
  ) => {
    if (!editValue.trim()) return cancelEditing();
    let res;
    if (type === "category") res = await updateActivityCategory(id, editValue);
    else if (type === "task")
      res = await updateActivityTask(
        id,
        editValue,
        editRoleContext,
        editStaffRoles,
      );
    else res = await updateActivitySubtask(id, editValue);

    if (res?.success) {
      toast.success("Actualizado");
      await refreshActivitiesConfig();
      cancelEditing();
    } else {
      toast.error(res?.error ?? "Error al actualizar");
    }
  };"""

new_save_editing = """  const saveEditing = async (
    id: string,
    type: "category" | "task" | "subtask",
  ) => {
    if (!editValue.trim()) return cancelEditing();
    let res;
    if (type === "category") {
      res = await updateActivityCategory(id, editValue);
      if (res.success) {
        const rolesRes = await updateCategoryRoles(id, editCategoryRoles);
        if (!rolesRes.success) {
          toast.error(rolesRes.error ?? "Error al actualizar roles de la categoría");
        }
      }
    } else if (type === "task") {
      res = await updateActivityTask(
        id,
        editValue,
        editRoleContext,
        editStaffRoles,
      );
    } else {
      res = await updateActivitySubtask(id, editValue);
    }

    if (res?.success) {
      toast.success("Actualizado");
      await refreshActivitiesConfig();
      cancelEditing();
    } else {
      toast.error(res?.error ?? "Error al actualizar");
    }
  };"""

content = content.replace(old_save_editing, new_save_editing)

with open('components/settings/SettingsView.tsx', 'w') as f:
    f.write(content)

print("Updated saveEditing and imports")
