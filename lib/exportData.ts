import { supabase } from "./supabase";
import { UserProfile } from "./types";
import { toast } from "sonner";
import { Dictionary } from "./i18n/types";

interface ExportDataPayload {
  profile: UserProfile;
  exported_at: string;
  app: string;
  logs?: unknown[];
}

export async function exportUserData(profile: UserProfile, t: Dictionary) {
  try {
    const dataToExport: ExportDataPayload = {
      profile: profile,
      exported_at: new Date().toISOString(),
      app: "SiteFlow",
    };

    // Consultar logs del usuario
    const { data: logs, error: logsError } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", profile.id);

    if (logsError) throw logsError;
    dataToExport.logs = logs || [];

    // Formatear JSON
    const jsonStr = JSON.stringify(dataToExport, null, 2);

    // Crear Blob y enlace de descarga
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `siteflow_data_export_${profile.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();

    // Limpieza
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t.toasts.exportSuccessTitle, { description: t.toasts.exportSuccessDesc });
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(t.toasts.errorTitle, { description: error.message });
    } else {
      toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
    }
  }
}
