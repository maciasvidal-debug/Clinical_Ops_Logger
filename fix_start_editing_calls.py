import re

with open('components/settings/SettingsView.tsx', 'r') as f:
    content = f.read()

# Replace cat startEditing call
orig_cat_call = """onClick={() => startEditing(cat.id, cat.name)}"""
new_cat_call = """onClick={() => startEditing(cat.id, cat.name, undefined, [], cat.category_roles?.map((cr) => cr.role) || [])}"""
content = content.replace(orig_cat_call, new_cat_call)

with open('components/settings/SettingsView.tsx', 'w') as f:
    f.write(content)

print("Updated startEditing calls")
