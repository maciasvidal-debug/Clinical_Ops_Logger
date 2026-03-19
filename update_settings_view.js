const fs = require('fs');
const path = require('path');

const filePath = path.join('components', 'settings', 'SettingsView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Añadir imports
if (!content.includes('import { DeleteAccountModal }')) {
  content = content.replace(
    'import { Download } from "lucide-react";',
    'import { Download, AlertTriangle } from "lucide-react";\nimport { DeleteAccountModal } from "./DeleteAccountModal";'
  );
}

// Añadir estado
if (!content.includes('const [isDeleteModalOpen')) {
  content = content.replace(
    'const [isExporting, setIsExporting] = useState(false);',
    'const [isExporting, setIsExporting] = useState(false);\n  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);'
  );
}

// Añadir Danger Zone UI
const dangerZoneHtml = `

          {/* Danger Zone */}
          <div className="bg-red-50/30 rounded-2xl border border-red-200 shadow-sm p-6 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-900">
                {t.settings.dangerZone || "Zona de Peligro"}
              </h3>
            </div>

            <p className="text-sm text-red-800 mb-6 max-w-2xl">
              {t.settings.dangerZoneDesc || "Eliminar tu cuenta es una acción irreversible. Revocará tu acceso y se anonimizarán tus datos personales (aunque conservaremos estadísticas de tiempo y actividades)."}
            </p>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              {t.settings.deleteAccountButton || "Eliminar mi cuenta"}
            </button>
          </div>

          <DeleteAccountModal
            profile={profile}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onSuccess={() => window.location.href = '/login'}
          />
`;

// Insertarlo antes de cerrar el div final de general tab
if (!content.includes('dangerZone')) {
  content = content.replace(
    '        </div>\n      )}\n\n    </div>\n  );\n}',
    `${dangerZoneHtml}\n        </div>\n      )}\n\n    </div>\n  );\n}`
  );
}

fs.writeFileSync(filePath, content);
console.log('SettingsView updated successfully');
