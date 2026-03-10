"use client";

import React, { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LogFormView } from "@/components/log/LogFormView";
import { HistoryView } from "@/components/history/HistoryView";
import { ReportsView } from "@/components/reports/ReportsView";
import { TeamView } from "@/components/team/TeamView";
import { useAppStore } from "@/lib/store";
import { Toaster } from "sonner";

type View = "dashboard" | "log" | "history" | "reports" | "team";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const { 
    logs, 
    isLoaded, 
    addLog, 
    deleteLog, 
    isOnline, 
    isSyncing, 
    syncQueueCount,
    currentUser,
    changeUser,
    assignments,
    updateAssignments,
    addQuery,
    replyToQuery
  } = useAppStore();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <Shell 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isOnline={isOnline}
        isSyncing={isSyncing}
        syncQueueCount={syncQueueCount}
        currentUser={currentUser}
        onChangeUser={changeUser}
      >
        {currentView === "dashboard" && (
          <DashboardView logs={logs} onNavigate={setCurrentView} currentUser={currentUser} />
        )}
        {currentView === "log" && (
          <LogFormView 
            onAddLog={addLog} 
            onSuccess={() => setCurrentView("dashboard")} 
            currentUser={currentUser}
            assignments={assignments}
          />
        )}
        {currentView === "history" && (
          <HistoryView 
            logs={logs} 
            onDeleteLog={deleteLog} 
            currentUser={currentUser}
            onAddQuery={addQuery}
            onReplyToQuery={replyToQuery}
          />
        )}
        {currentView === "reports" && (
          <ReportsView logs={logs} currentUser={currentUser} />
        )}
        {currentView === "team" && currentUser.role === "Manager" && (
          <TeamView 
            assignments={assignments}
            onUpdateAssignments={updateAssignments}
          />
        )}
      </Shell>
    </>
  );
}
