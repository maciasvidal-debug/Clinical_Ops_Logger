import re

with open('components/settings/SettingsView.tsx', 'r') as f:
    content = f.read()

# The block to replace
old_editing_block = """                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1.5 text-[14px] border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold w-full sm:w-64 flex-1 shadow-sm transition-shadow"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                saveEditing(cat.id, "category");
                              if (e.key === "Escape") cancelEditing();
                            }}
                          />
                          <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                            <button
                              onClick={() => saveEditing(cat.id, "category")}
                              className="flex items-center justify-center w-8 h-8 text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center justify-center w-8 h-8 text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>"""

new_editing_block = """                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1.5 text-[14px] border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold w-full sm:w-64 flex-1 shadow-sm transition-shadow"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                saveEditing(cat.id, "category");
                              if (e.key === "Escape") cancelEditing();
                            }}
                          />
                          <div className="relative group/popover shrink-0">
                            <button
                              type="button"
                              className="px-2 py-1.5 flex items-center gap-1.5 text-[13px] border border-indigo-300 rounded-md focus:outline-none bg-white font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
                            >
                              <Users className="w-4 h-4" />
                              {editCategoryRoles.length === 0
                                ? "Todos los roles"
                                : `${editCategoryRoles.length} roles`}
                            </button>
                            <div className="absolute top-full mt-1 left-0 sm:right-0 sm:left-auto w-56 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-xl shadow-xl opacity-0 invisible group-hover/popover:opacity-100 group-hover/popover:visible transition-all z-[100] p-2 grid grid-cols-1 gap-1">
                              {ALL_ROLES.map(({ role, label, desc }) => (
                                <label
                                  key={role}
                                  className="flex items-start gap-2 p-2 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editCategoryRoles.includes(role)}
                                    onChange={(e) => {
                                      if (e.target.checked)
                                        setEditCategoryRoles([
                                          ...editCategoryRoles,
                                          role,
                                        ]);
                                      else
                                        setEditCategoryRoles(
                                          editCategoryRoles.filter(
                                            (r) => r !== role,
                                          ),
                                        );
                                    }}
                                    className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-[12.5px] font-semibold text-neutral-800 leading-tight">
                                      {label}
                                    </span>
                                    <span className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                                      {desc}
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                            <button
                              onClick={() => saveEditing(cat.id, "category")}
                              className="flex items-center justify-center w-8 h-8 text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center justify-center w-8 h-8 text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>"""

content = content.replace(old_editing_block, new_editing_block)

with open('components/settings/SettingsView.tsx', 'w') as f:
    f.write(content)

print("Updated inline category editing UI")
