import React, { useState, useEffect } from "react";
import { LayoutDashboard, Clock, History, BarChart3, Plus, WifiOff, RefreshCw, Bell, Users, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { User, MOCK_USERS, AppNotification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type View = "dashboard" | "log" | "history" | "reports" | "team";

interface ShellProps {
  currentView: View;
  onViewChange: (view: View) => void;
  children: React.ReactNode;
  isOnline: boolean;
  isSyncing: boolean;
  syncQueueCount: number;
  currentUser: User;
  onChangeUser: (userId: string) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onSimulateNotification: () => void;
}

export function Shell({ 
  currentView, 
  onViewChange, 
  children, 
  isOnline, 
  isSyncing, 
  syncQueueCount,
  currentUser,
  onChangeUser,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onSimulateNotification
}: ShellProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications ? notifications.filter(n => !n.isRead && n.userId === currentUser.id).length : 0;
  const userNotifications = notifications ? notifications.filter(n => n.userId === currentUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  const navItems: { id: View; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "log", label: "Log Time", icon: Clock },
    { id: "history", label: "History", icon: History },
    { id: "reports", label: "Reports", icon: BarChart3 },
    ...(currentUser.role === "Manager" ? [{ id: "team" as View, label: "Team", icon: Users }] : []),
  ];

  const handleTestNotification = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("ClinOps Reminder", {
            body: "Don't forget to log your hours for today's monitoring visits!",
            icon: "/favicon.ico"
          });
          toast.success("Push notification sent!");
        } else {
          toast.error("Notification permission denied.");
        }
      });
    } else {
      toast.error("Push notifications are not supported in this browser.");
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-indigo-900">ClinOps Tracker</h1>
          <p className="text-xs text-neutral-500 mt-1">Time & Activity Logging</p>
        </div>
        
        {/* User Selector */}
        <div className="px-4 mb-4">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
            Current User (Demo)
          </label>
          <select 
            value={currentUser.id}
            onChange={(e) => onChangeUser(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {MOCK_USERS.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-neutral-400")} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 space-y-3">
          {/* Sync Status */}
          {(!isOnline || syncQueueCount > 0 || isSyncing) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
              {!isOnline ? (
                <WifiOff className="w-4 h-4" />
              ) : (
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              )}
              <span>
                {!isOnline ? "Offline" : isSyncing ? "Syncing..." : "Pending Sync"}
                {syncQueueCount > 0 && ` (${syncQueueCount})`}
              </span>
            </div>
          )}





          {/* Notifications Dropdown Desktop */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors relative"
              title="Notifications Desktop"
            >
              <Bell className="w-4 h-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                  <div className="flex gap-2">
                     <button onClick={onSimulateNotification} className="text-xs text-indigo-600 hover:underline" title="Simulate a push notification">Test</button>
                     {unreadCount > 0 && (
                        <button onClick={onClearNotifications} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
                     )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {userNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No new notifications
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-indigo-50/50'}`}
                        onClick={() => {
                          if (!notif.isRead) onMarkNotificationRead(notif.id);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            {notif.type === 'info' && <Bell className="w-4 h-4 text-blue-500" />}
                            {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                            {notif.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{formatDistanceToNow(new Date(notif.date), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => onViewChange("log")}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-indigo-900">ClinOps Tracker</h1>
            {(!isOnline || syncQueueCount > 0) && (
              <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={currentUser.id}
              onChange={(e) => onChangeUser(e.target.value)}
              className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none max-w-[120px]"
            >
              {MOCK_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          {/* Notifications Dropdown Mobile */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-indigo-600 bg-indigo-50 rounded-full transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                  <div className="flex gap-2">
                     <button onClick={onSimulateNotification} className="text-xs text-indigo-600 hover:underline" title="Simulate a push notification">Test</button>
                     {unreadCount > 0 && (
                        <button onClick={onClearNotifications} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
                     )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {userNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No new notifications
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-indigo-50/50'}`}
                        onClick={() => {
                          if (!notif.isRead) onMarkNotificationRead(notif.id);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            {notif.type === 'info' && <Bell className="w-4 h-4 text-blue-500" />}
                            {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                            {notif.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{formatDistanceToNow(new Date(notif.date), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
            <button 
              onClick={() => onViewChange("log")}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 pb-safe z-20">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors",
                  isActive ? "text-indigo-600" : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                <div className={cn(
                  "p-1 rounded-full mb-1 transition-colors",
                  isActive ? "bg-indigo-50" : "bg-transparent"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
