"use client";

import React, { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LogFormView } from "@/components/log/LogFormView";
import { HistoryView } from "@/components/history/HistoryView";
import { ReportsView } from "@/components/reports/ReportsView";
import { AuthView } from "@/components/auth/AuthView";
import { useAppStore } from "@/lib/store";
import { LogEntry, Todo } from "@/lib/types";
import { Toaster } from "sonner";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";


import { SettingsView } from "@/components/settings/SettingsView";







export type View = "dashboard" | "log" | "history" | "reports" | "team" | "settings";

export default function App() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [logFormInitialData, setLogFormInitialData] =
    useState<Partial<LogEntry> | null>(null);

  const {
    user,
    profile,
    logs,
    isLoaded,
    addLog,
    deleteLog,
    isOnline,
    activeTimer,
    startTimer,
    stopTimer,
    notifications,
    markNotificationRead,
    clearNotifications,
    addQuery,
    replyToQuery,
    projects,
    protocols,
    sites,
    profiles,
    projectAssignments,
    protocolAssignments,
    updateAssignments,
    updateUserStatus,
    signOut,
    refreshAppData,
    todos
  } = useAppStore();

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const todayLogs = React.useMemo(() => {
    return logs.filter(
      (l) =>
        l.user_id === user?.id &&
        l.date === todayStr,
    );
  }, [logs, user?.id, todayStr]);

  const pendingTodos = React.useMemo(() => {
    return todos?.filter((t: Todo) => t.status === "pending" && t.user_id === profile?.id);
  }, [todos, profile?.id]);

  // Push Notifications Reminder
  useEffect(() => {
    if (!profile || profile.status !== "active") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      if (Notification.permission === "granted") {
        if (todayLogs.length === 0 && new Date().getHours() >= 16) {
          new Notification(t.notifications.reminderTitle, {
            body: t.notifications.reminderBody,
            icon: "/favicon.ico",
          });
        }
      }

      if (pendingTodos && pendingTodos.length > 0 && Notification.permission === "granted") {
        new Notification(t.shell.notifications || "Notifications", {
          body: `${pendingTodos.length} ${t.notifications.pendingTasksBody}`,
          icon: "/favicon.ico",
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [
    logs,
    notifications,
    profile,
    t.notifications.pendingTasksBody,
    t.notifications.reminderBody,
    t.notifications.reminderTitle,
    t.shell.notifications,
    todayLogs,
    pendingTodos,
  ]);

  const handleRepeatLog = (log: LogEntry) => {
    setLogFormInitialData(log);
    setCurrentView("log");
  };

  const handleStopTimer = () => {
    const minutes = stopTimer();
    setLogFormInitialData({ duration_minutes: minutes });
    setCurrentView("log");
  };

  const handleNavigateToLog = () => {
    setLogFormInitialData(null);
    setCurrentView("log");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <AuthView />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <Shell
        currentView={currentView}
        onViewChange={setCurrentView}
        isOnline={isOnline}
        isSyncing={false}
        syncQueueCount={0}
        profile={profile}
        activeTimer={activeTimer}
        onStartTimer={startTimer}
        onStopTimer={handleStopTimer}
        onNavigateToLog={handleNavigateToLog}
        notifications={notifications}
        onMarkNotificationRead={markNotificationRead}
        onClearNotifications={clearNotifications}
      >
        {currentView === "dashboard" && profile && (
          <DashboardView
            logs={logs}
            onNavigate={setCurrentView}
            profile={profile}
            onRepeatLog={handleRepeatLog}
          />
        )}
        {currentView === "log" && profile && (
          <LogFormView
            onAddLog={addLog}
            onSuccess={() => {
              setLogFormInitialData(null);
              setCurrentView("dashboard");
            }}
            profile={profile}
            projects={projects}
            protocols={protocols}
            sites={sites}
            initialData={logFormInitialData}
          />
        )}
        {currentView === "history" && (
          <HistoryView
            logs={logs}
            onDeleteLog={deleteLog}
            profile={profile}
            projects={projects}
            protocols={protocols}
            sites={sites}
            onAddQuery={addQuery}
            onReplyToQuery={replyToQuery}
          />
        )}
        {currentView === "reports" && profile && (
          <ReportsView 
            logs={logs} 
            profile={profile} 
            projects={projects}
          />
        )}
        {currentView === "settings" && profile && (
          <SettingsView profile={profile} />
        )}
      </Shell>
    </>
  );
}
