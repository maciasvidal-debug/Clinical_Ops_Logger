/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  Settings,
  MoreHorizontal,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, AppNotification } from "@/lib/types";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";

type View = "dashboard" | "log" | "history" | "reports" | "team" | "settings";

interface ShellProps {
  currentView: string;
  onViewChange: (view: any) => void;
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
  const [showMobileMore, setShowMobileMore] = useState(false);
  const { t } = useTranslation();
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileMoreRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (mobileMoreRef.current && !mobileMoreRef.current.contains(event.target as Node)) {
        setShowMobileMore(false);
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

  const primaryNavItems = [
    { id: "dashboard" as View, label: t.navigation.dashboard, icon: LayoutDashboard },
    { id: "log" as View, label: t.navigation.log, icon: Clock },
    { id: "history" as View, label: t.navigation.history, icon: History },
    { id: "reports" as View, label: t.navigation.reports, icon: BarChart3 },
  ];

  const secondaryNavItems = [
    ...(profile?.role === "manager" || profile?.role === "super_admin" ? [{ id: "team" as View, label: t.navigation.team, icon: Users }] : []),
    ...(profile?.role === "manager" || profile?.role === "super_admin" ? [{ id: "settings" as View, label: t.navigation.settings, icon: Settings }] : []),
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t.toasts.logoutSuccessTitle, { description: t.toasts.logoutSuccessDesc });
  };

  return (
    <div className="flex h-screen bg-neutral-50/50 text-neutral-900 overflow-hidden font-sans">
      {/* Background ambient subtle gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-mint-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] glass-panel rounded-none border-r border-neutral-200/60 z-10 shrink-0">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 font-heading">{t.shell.appName}</h1>
          </div>
          <p className="text-xs text-neutral-500 pl-10">{t.shell.appSubtitle}</p>
        </div>
        
        <div className="px-5 my-6">
          <div className="flex items-center gap-3 p-3 glass-button rounded-2xl border border-neutral-200/40">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-700 font-bold shadow-sm border border-indigo-100/50">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                {profile?.role ? t.roles[profile.role] : ''}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto hide-scrollbar">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group active:scale-[0.98]",
                  isActive 
                    ? "bg-indigo-50/80 text-indigo-700 shadow-sm border border-indigo-100/50"
                    : "text-neutral-600 hover:bg-neutral-100/60 hover:text-neutral-900 border border-transparent"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", isActive ? "text-indigo-600" : "text-neutral-400 group-hover:text-neutral-600")} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-5 space-y-3 mt-auto">
          <button 
            onClick={() => onNavigateToLog?.() || onViewChange("log")}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-2xl text-sm font-semibold transition-all shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            {t.navigation.newEntry}
          </button>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:bg-coral-50/50 hover:text-coral-600 transition-colors group active:scale-95"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            {t.navigation.signOut}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header / Timer Bar */}
        <header className="glass-panel rounded-none border-b border-neutral-200/60 px-4 py-3 flex items-center justify-between z-40 shrink-0 sticky top-0">
          <div className="flex items-center md:hidden gap-2">
            <div className="relative w-7 h-7 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-lg text-neutral-900 tracking-tight">{t.shell.appName}</span>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            {/* Active Timer Widget */}
            <AnimatePresence mode="wait">
            {activeTimer?.startTime ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center bg-white/80 backdrop-blur-md border border-mint-200 rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_2px_10px_rgba(34,197,94,0.15)]"
              >
                <div className="flex items-center gap-2 mr-3">
                  <div className="w-2 h-2 rounded-full bg-mint-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  <span className="text-mint-700 font-mono font-bold text-sm tracking-widest">{elapsedTime}</span>
                </div>
                <button 
                  onClick={onStopTimer}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-mint-500 hover:bg-mint-600 text-white rounded-full transition-all text-xs font-bold shadow-sm active:scale-95"
                  title={t.shell.stopLog}
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">{t.shell.stopLog}</span>
                </button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={onStartTimer}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/90 hover:bg-white text-neutral-700 rounded-full text-sm font-semibold transition-all border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:translate-y-0 text-indigo-600 group"
              >
                <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span className="inline">{t.shell.smartTimer}</span>
              </motion.button>
            )}
            </AnimatePresence>

            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-colors active:scale-90"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-coral-500 rounded-full border-2 border-white shadow-sm"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl border border-neutral-200/60 overflow-hidden z-50 origin-top-right shadow-2xl"
                  >
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white/50">
                      <h3 className="font-bold text-neutral-900 font-heading">{t.shell.notifications}</h3>
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => profile && onClearNotifications?.(profile.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                        >{t.shell.clearAll}</button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto hide-scrollbar bg-white/40">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-neutral-400 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                             <Bell className="w-6 h-6 text-neutral-300" />
                          </div>
                          <p className="text-sm font-medium">{t.shell.noNotifications}</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-100/50">
                          {notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              className={cn(
                                "p-4 hover:bg-white/80 transition-colors cursor-pointer",
                                !notif.is_read && "bg-indigo-50/40"
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
                                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                  notif.type === "query" ? "bg-amber-100 text-amber-600" :
                                  notif.type === "reminder" ? "bg-indigo-100 text-indigo-600" :
                                  notif.type === "insight" ? "bg-mint-100 text-mint-600" :
                                  "bg-neutral-100 text-neutral-600"
                                )}>
                                  {notif.type === "query" ? <AlertCircle className="w-4 h-4" /> :
                                   notif.type === "reminder" ? <Clock className="w-4 h-4" /> :
                                   notif.type === "insight" ? <BarChart3 className="w-4 h-4" /> :
                                   <Info className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <p className={cn("text-sm text-neutral-900 leading-tight", !notif.is_read ? "font-bold" : "font-medium")}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] font-medium text-neutral-400 mt-2 uppercase tracking-wider">
                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                                {!notif.is_read && (
                                  <div className="w-3 h-3 bg-indigo-500 rounded-full shrink-0 mt-1 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 hide-scrollbar relative">
          <div className="max-w-5xl mx-auto min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} // smooth, futuristic spring-like easing
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav (Glassmorphism & Simplified) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {showMobileMore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-full left-0 right-0 mb-2 mx-4 glass-panel border border-neutral-200/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] overflow-hidden pointer-events-auto flex flex-col"
                ref={mobileMoreRef}
              >
                <div className="p-2 space-y-1">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onViewChange(item.id);
                          setShowMobileMore(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-5 py-4 rounded-xl text-base font-medium transition-colors active:scale-95 mb-1",
                          currentView === item.id
                            ? "bg-indigo-50/80 text-indigo-700"
                            : "text-neutral-700 hover:bg-neutral-50/80"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", currentView === item.id ? "text-indigo-600" : "text-neutral-500")} />
                        {item.label}
                      </button>
                    );
                  })}
                  <div className="h-px bg-neutral-200/50 my-2 mx-2" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-coral-600 hover:bg-coral-50/50 active:scale-95 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    {t.navigation.signOut}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <nav className="glass-panel border border-white/60 mx-auto rounded-3xl mb-4 px-2 py-2 pointer-events-auto flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setShowMobileMore(false);
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 min-w-0 px-2 py-3 rounded-2xl transition-all duration-300 active:scale-90",
                  isActive ? "text-indigo-700" : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute inset-0 bg-indigo-50/80 rounded-2xl z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 p-1 mb-0.5">
                  <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
                </div>
                <span className={cn("relative z-10 text-[10px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-1 transition-all duration-300", isActive ? "font-bold" : "font-medium")}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {secondaryNavItems.length > 0 && (
             <button
              onClick={() => setShowMobileMore(!showMobileMore)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 min-w-0 px-2 py-3 rounded-2xl transition-all duration-300 active:scale-90",
                showMobileMore ? "text-indigo-700 bg-indigo-50/50" : "text-neutral-500"
              )}
            >
              <div className="relative z-10 p-1 mb-0.5">
                {showMobileMore ? <ChevronUp className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
              </div>
              <span className={cn("relative z-10 text-[10px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-1 transition-all duration-300", showMobileMore ? "font-bold" : "font-medium")}>
                {t.navigation.more}
              </span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
