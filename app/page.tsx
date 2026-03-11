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
  const [repeatLogId, setRepeatLogId] = useState<string | null>(null);
  const [aiPreFillData, setAiPreFillData] = useState<any | null>(null);
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
    replyToQuery,
    activeTimer,
    startTimer,
    stopTimer,
    cancelTimer,
    notifications,
    templates,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    addTemplate,
    deleteTemplate
  } = useAppStore();

  const handleSimulateNotification = () => {
    addNotification({
      userId: currentUser.id,
      title: "New Query Assigned",
      message: "Manager created a new query for PROT-101.",
      type: "warning",
    });
  };

      const handleSmartLog = (data: any) => {
    setAiPreFillData(data);
    setCurrentView("log");
  };

  const handleRepeat = (logId: string) => {
    setRepeatLogId(logId);
    setCurrentView("log");
  };

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
        notifications={notifications}
        onMarkNotificationRead={markNotificationAsRead}
        onClearNotifications={clearNotifications}
        onSimulateNotification={handleSimulateNotification}
      >
        {currentView === "dashboard" && (
          <DashboardView logs={logs} onNavigate={setCurrentView} currentUser={currentUser} activeTimer={activeTimer} startTimer={startTimer} onRepeat={handleRepeat} onSmartLog={handleSmartLog} assignments={assignments} />
        )}
        {currentView === "log" && (
          <LogFormView 
            onAddLog={addLog} 
            onSuccess={() => { setCurrentView("dashboard"); setRepeatLogId(null); setAiPreFillData(null); }}
            currentUser={currentUser}
            assignments={assignments}
            activeTimer={activeTimer}
            stopTimer={stopTimer}
            cancelTimer={cancelTimer}
            repeatLogId={repeatLogId}
            logs={logs}
            aiPreFillData={aiPreFillData}
          />
        )}
        {currentView === "history" && (
          <HistoryView 
            logs={logs}
            onRepeat={handleRepeat}
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
