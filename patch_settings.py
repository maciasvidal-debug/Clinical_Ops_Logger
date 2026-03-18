import re

with open('components/settings/SettingsView.tsx', 'r') as f:
    content = f.read()

# I want to add a new section in the "general" tab for Data Export, before or after the under construction message.
# Let's replace the whole "general" tab block:

replacement = """      {(activeTab === "general" || (activeTab === "activities" && profile.role !== "super_admin" && profile.role !== "manager")) && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              {t.settings.exportMyData}
            </h3>
            <p className="text-sm text-neutral-500 mb-4 max-w-2xl">
              {t.settings.exportMyDataDesc}
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              {isExporting ? t.common.loading : t.settings.exportMyData}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              {t.settings.underConstruction}
            </h3>
            <p className="text-neutral-500 max-w-md">
              {t.settings.generalSettingsDesc}
            </p>
          </div>
        </div>
      )}"""

content = re.sub(
    r'\{\(activeTab === "general" \|\| \(activeTab === "activities" && profile\.role !== "super_admin" && profile\.role !== "manager"\)\) && \(\s*<div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">.*?</div>\s*\)\}',
    replacement,
    content,
    flags=re.DOTALL
)

with open('components/settings/SettingsView.tsx', 'w') as f:
    f.write(content)
