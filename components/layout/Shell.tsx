/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  Clock, 
  History, 
  BarChart3, 
  Plus, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  Users, 
  Play, 
  Square, 
  AlertCircle, 
  Info, 
  Activity,
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, AppNotification } from "@/lib/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";

type View = "dashboard" | "log" | "history" | "reports" | "team";

interface ShellProps {
  currentView: View;
  onViewChange: (view: View) => void;
  children: React.ReactNode;
  isOnline: boolean;
  isSyncing: boolean;
  syncQueueCount: number;
  profile: UserProfile | null;
  activeTimer?: { startTime: string | null };
  onStartTimer?: () => void;
  onStopTimer?: () => void;
  onNavigateToLog?: () => void;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onClearNotifications?: (userId: string) => void;
}

export function Shell({ 
  currentView, 
  onViewChange, 
  children, 
  isOnline, 
  isSyncing, 
  syncQueueCount,
  profile,
  activeTimer,
  onStartTimer,
  onStopTimer,
  onNavigateToLog,
  notifications = [],
  onMarkNotificationRead,
  onClearNotifications
}: ShellProps) {
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!activeTimer?.startTime) {
      setElapsedTime("00:00");
      return;
    }

    const updateTimer = () => {
      const elapsedMs = new Date().getTime() - new Date(activeTimer.startTime!).getTime();
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      if (hours > 0) {
        setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeTimer?.startTime]);

  const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "log", label: "Log Time", icon: Clock },
    { id: "history", label: "History", icon: History },
    { id: "reports", label: "Reports", icon: BarChart3 },
    ...(profile?.role === "manager" || profile?.role === "super_admin" ? [{ id: "team" as View, label: "Team", icon: Users }] : []),
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info("Signed out successfully");
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-indigo-900">SiteFlow</h1>
          </div>
          <p className="text-xs text-neutral-500">Clinical Ops Logger</p>
        </div>
        
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                {profile?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
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
        
        <div className="p-4 space-y-2">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          <button 
            onClick={() => onNavigateToLog?.() || onViewChange("log")}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header / Timer Bar */}
        <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-5 h-5" />
              <span className="sr-only">SiteFlow</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-indigo-900">SiteFlow</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Active Timer Widget */}
            {activeTimer?.startTime ? (
              <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded-full pl-4 pr-1.5 py-1.5 shadow-sm">
                <div className="flex items-center gap-2 mr-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-indigo-800 font-mono font-semibold text-sm">{elapsedTime}</span>
                </div>
                <button 
                  onClick={onStopTimer}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors text-xs font-medium shadow-sm"
                  title="Stop Timer & Log"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop & Log</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={onStartTimer}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-sm font-medium transition-colors border border-neutral-200 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current text-green-600" />
                <span className="inline">Smart Timer</span>
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                      <h3 className="font-semibold text-neutral-900">Notifications</h3>
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => profile && onClearNotifications?.(profile.id)}
                          className="text-xs text-neutral-500 hover:text-indigo-600 font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
                          <Bell className="w-8 h-8 text-neutral-300 mb-2" />
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-100">
                          {notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              className={cn(
                                "p-4 hover:bg-neutral-50 transition-colors cursor-pointer",
                                !notif.is_read && "bg-indigo-50/30"
                              )}
                              onClick={() => {
                                onMarkNotificationRead?.(notif.id);
                                if (notif.link) {
                                  onViewChange(notif.link as View);
                                  setShowNotifications(false);
                                }
                              }}
                            >
                              <div className="flex gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                  notif.type === "query" ? "bg-amber-100 text-amber-600" :
                                  notif.type === "reminder" ? "bg-indigo-100 text-indigo-600" :
                                  notif.type === "insight" ? "bg-emerald-100 text-emerald-600" :
                                  "bg-neutral-100 text-neutral-600"
                                )}>
                                  {notif.type === "query" ? <AlertCircle className="w-4 h-4" /> :
                                   notif.type === "reminder" ? <Clock className="w-4 h-4" /> :
                                   notif.type === "insight" ? <BarChart3 className="w-4 h-4" /> :
                                   <Info className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn("text-sm font-medium text-neutral-900", !notif.is_read && "font-semibold")}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-neutral-400 mt-1.5">
                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                                {!notif.is_read && (
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-1.5" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
          <div className="max-w-5xl mx-auto min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-full"
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
