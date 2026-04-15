import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { UserProfile } from "@/lib/types";
import { X, AlertTriangle, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { exportUserData } from "@/lib/exportData";
import { getSecureItem, removeSecureItem } from "@/lib/secure_store";

interface DeleteAccountModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteAccountModal({ profile, isOpen, onClose, onSuccess }: DeleteAccountModalProps) {
  const { t } = useTranslation();
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const expectedText = t.settings.deleteConfirmationPhrase || "CONFIRMO ELIMINAR";
  const isConfirmed = confirmationText.trim().toUpperCase() === expectedText.toUpperCase();

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportUserData(profile, t);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await removeSecureItem("local_profile_basic");
      await removeSecureItem("app_pin");
      // Could also delete idb here if we really wanted to wipe everything.

      toast.success(t.toasts.deleteSuccessTitle || t.common.success, {
        description: t.settings.deleteSuccessDesc || "Tu cuenta ha sido eliminada permanentemente."
      });

      onSuccess(); // Redireccionará a /login

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t.toasts.errorTitle || t.common.error, { description: error.message });
      } else {
        toast.error(t.toasts.errorTitle || t.common.error, { description: t.toasts.errorDesc });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900">
              {t.settings.deleteAccountTitle || "Eliminar Cuenta"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800 space-y-2">
            <p><strong>{t.settings.warning || "Advertencia"}:</strong> {t.settings.deleteAccountWarning1 || "Esta acción es irreversible y revocará tu acceso permanentemente."}</p>
            <p>{t.settings.deleteAccountWarning2 || "Tus datos personales serán anonimizados, pero tus registros de horas y actividades se mantendrán de forma estadística para el sistema."}</p>
            <p>{t.settings.deleteAccountWarning3 || "Cualquier consulta pendiente de resolver en tus actividades será cerrada automáticamente notificando tu baja del sistema. Los proyectos y protocolos asignados a ti quedarán huérfanos."}</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <h4 className="font-semibold text-indigo-900 mb-2">{t.settings.downloadDataBeforeDelete || "Descarga tus datos antes de continuar"}</h4>
            <p className="text-sm text-indigo-800 mb-3">
              {t.settings.downloadDataRecommendation || "Te recomendamos descargar un respaldo de toda tu información (perfil y logs de actividades) antes de eliminar tu cuenta, ya que no podrás recuperarla salvo solicitud expresa al administrador (retención por 30 días según términos)."}
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              {isExporting ? t.common.loading : t.settings.exportMyData}
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700">
              {t.settings.typePhraseToConfirm || `Para confirmar, escribe la frase: `}
              <strong className="text-red-600 select-all">{expectedText}</strong>
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={expectedText}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
            />
          </div>
        </div>

        <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 rounded-xl transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors min-w-[140px]"
          >
            {isDeleting ? t.common.loading : t.settings.deleteAccountTitle || "Eliminar Cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
