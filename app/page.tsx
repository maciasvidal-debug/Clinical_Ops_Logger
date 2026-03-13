"use client";

import React, { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LogFormView } from "@/components/log/LogFormView";
import { HistoryView } from "@/components/history/HistoryView";
import { ReportsView } from "@/components/reports/ReportsView";
import { TeamView } from "@/components/team/TeamView";
import { AuthView } from "@/components/auth/AuthView";
import { PendingApprovalView } from "@/components/auth/PendingApprovalView";
import { useAppStore } from "@/lib/store";
import { LogEntry } from "@/lib/types";
import { Toaster } from "sonner";
import { format } from "date-fns";

type View = "dashboard" | "log" | "history" | "reports" | "team";

export default function App() {
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
    refreshAppData
  } = useAppStore();

  // Push Notifications Reminder
  useEffect(() => {
    if (!profile || profile.status !== "active") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      if (Notification.permission === "granted") {
        const todayLogs = logs.filter(
          (l) =>
            l.user_id === user?.id &&
            l.date === format(new Date(), "yyyy-MM-dd"),
        );
        if (todayLogs.length === 0 && new Date().getHours() >= 16) {
          new Notification("Time Tracking Reminder", {
            body: "You haven't logged any activities today. Don't forget to update your timesheet!",
            icon: "/favicon.ico",
          });
        }
      }

      if (profile.role === "manager") {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        logs.forEach((log) => {
          log.log_queries?.forEach((query) => {
            if (
              query.status === "OPEN" &&
              new Date(query.question_date) < threeDaysAgo
            ) {
              const hasRecentNotification = notifications.some(
                (n) =>
                  n.type === "reminder" &&
                  n.message.includes("3 days"),
              );

              if (!hasRecentNotification) {
                // In a real app, we'd call an addNotification function that saves to DB
                console.log("Should notify manager about old query");
              }
            }
          });
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [logs, user, profile, notifications]);

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

  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center">
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Configuration Required</h1>
          <p className="text-neutral-600 mb-6">
            Please set the <code className="bg-neutral-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-neutral-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> environment variables in the Settings menu to connect to your database.
          </p>
          <div className="text-sm text-neutral-400">
            Once set, the application will refresh automatically.
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading SiteFlow...</p>
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

  if (profile?.status === "pending") {
    return (
      <>
        <Toaster position="top-center" richColors />
        <PendingApprovalView email={user.email || ""} />
      </>
    );
  }

  if (profile?.status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-neutral-600 mb-6">Your account request has been rejected. Please contact your administrator.</p>
          <button 
            onClick={signOut} 
            className="text-indigo-600 font-medium"
          >
            Sign Out
          </button>
        </div>
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
        {currentView === "team" && (profile?.role === "manager" || profile?.role === "super_admin") && (
          <TeamView
            profiles={profiles}
            projects={projects}
            protocols={protocols}
            projectAssignments={projectAssignments}
            protocolAssignments={protocolAssignments}
            onUpdateAssignments={updateAssignments}
            onUpdateUserStatus={updateUserStatus}
            onRefresh={refreshAppData}
          />
        )}
      </Shell>
    </>
  );
}
