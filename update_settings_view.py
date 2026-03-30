import re

with open('components/settings/SettingsView.tsx', 'r') as f:
    content = f.read()

# 1. Add editCategoryRoles state
state_code = """  const [editStaffRoles, setEditStaffRoles] = useState<string[]>([]);
  const [editCategoryRoles, setEditCategoryRoles] = useState<UserRole[]>([]);"""
content = content.replace("  const [editStaffRoles, setEditStaffRoles] = useState<string[]>([]);", state_code)

# 2. Modify startEditing signature and body
start_editing_orig = """  const startEditing = (
    id: string,
    currentValue: string,
    roleContext?: RoleContext,
    staffRoles: string[] = [],
  ) => {
    setEditingId(id);
    setEditValue(currentValue);
    setEditRoleContext(roleContext || null);
    setEditStaffRoles(staffRoles || []);
  };"""

start_editing_new = """  const startEditing = (
    id: string,
    currentValue: string,
    roleContext?: RoleContext,
    staffRoles: string[] = [],
    categoryRoles: UserRole[] = [],
  ) => {
    setEditingId(id);
    setEditValue(currentValue);
    setEditRoleContext(roleContext || null);
    setEditStaffRoles(staffRoles || []);
    setEditCategoryRoles(categoryRoles || []);
  };"""
content = content.replace(start_editing_orig, start_editing_new)

with open('components/settings/SettingsView.tsx', 'w') as f:
    f.write(content)
print("Updated states and startEditing")
