import { UserProfile } from "./types";
import { toast } from "sonner";
import { Dictionary } from "./i18n/types";
import { localGetLogs, localGetTodos, localGetCategories, localGetProjects, localGetProtocols, localGetSites } from "./local_db";

export async function exportUserData(profile: UserProfile, t: Dictionary) {
  try {
    const dataToExport: any = {
      profile: profile,
      exported_at: new Date().toISOString(),
      app: "SiteFlow",
    };

    dataToExport.logs = await localGetLogs();
    dataToExport.todos = await localGetTodos();
    dataToExport.categories = await localGetCategories();
    dataToExport.projects = await localGetProjects();
    dataToExport.protocols = await localGetProtocols();
    dataToExport.sites = await localGetSites();

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
