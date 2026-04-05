import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Todo,
  DbActivityCategory,
  LogEntry, 
  UserProfile, 
  AppNotification, 
  Project, 
  Protocol, 
  Site,
  UserRole,
  UserStatus,
  LogQuery,
  Region
} from "./types";
import { toast } from "sonner";
import { setSecureItem, getSecureItem, removeSecureItem } from "./secure_store";
import { logError } from "./utils";
import { useTranslation } from "./i18n";

import {
  localGetProfile,
  localGetLogs,
  localSaveLog,
  localDeleteLog,
  localGetProjects,
  localGetProtocols,
  localGetSites,
  localGetTodos,
  localSaveTodo,
  localDeleteTodo,
  localGetCategories,
  localGetNotifications,
  localSaveNotification,
  localDeleteNotification,
  localClearNotifications,
  generateId,
} from "./local_db";

const TIMER_KEY = "clinical_ops_timer";

export function useAppStore() {
  const { t } = useTranslation();
  const [user, setUser] = useState<{ id: string, email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  const [projectAssignments, setProjectAssignments] = useState<any[]>([]);
  const [protocolAssignments, setProtocolAssignments] = useState<any[]>([]);
  const [siteAssignments, setSiteAssignments] = useState<any[]>([]);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [activityCategories, setActivityCategories] = useState<DbActivityCategory[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [activeTimer, setActiveTimer] = useState<{ startTime: string | null }>({ startTime: null });
  const isTimerInitialized = useRef(false);

  useEffect(() => {
    if (isTimerInitialized.current || typeof window === "undefined") return;
    isTimerInitialized.current = true;

    getSecureItem(TIMER_KEY).then(decrypted => {
      if (decrypted) {
        try {
          const parsed = JSON.parse(decrypted);
          setActiveTimer(parsed);
        } catch (e) {
          logError(e, "store_parsing_timer");
        }
      }
    });
  }, []);

  const fetchRegions = useCallback(async () => {
    // No regions implemented in local defaults currently
    setRegions([]);
  }, []);

  const refreshActivitiesConfig = useCallback(async () => {
    const cats = await localGetCategories();
    setActivityCategories(cats);
  }, []);

  const fetchAppData = useCallback(async () => {
    const lLogs = await localGetLogs();
    setLogs(lLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    setProjects(await localGetProjects());
    setProtocols(await localGetProtocols());
    setSites(await localGetSites());
    setTodos(await localGetTodos());
    setNotifications(await localGetNotifications());
    setActivityCategories(await localGetCategories());
    setProfiles(profile ? [profile] : []); // Only one user
  }, [profile]);

  useEffect(() => {
    const loadSession = async () => {
      const storedProfile = await localGetProfile();
      if (storedProfile) {
        setProfile(storedProfile);
        setUser({ id: storedProfile.id, email: storedProfile.email });
        await fetchAppData();
      }
      setIsLoaded(true);
    };
    loadSession();
  }, [fetchAppData]);


  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addLog = async (log: Partial<LogEntry>) => {
    if (!profile) return;
    const newLog: LogEntry = {
      ...log,
      id: generateId(),
      user_id: profile.id,
      date: log.date || new Date().toISOString().split('T')[0],
      duration_minutes: log.duration_minutes || 0,
      role: profile.role,
      category: log.category || '',
      activity: log.activity || '',
      notes: log.notes || '',
      synced: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profiles: { first_name: profile.first_name, last_name: profile.last_name }
    };

    await localSaveLog(newLog);
    setLogs([newLog, ...logs]);
    toast.success(t.toasts.saveSuccessTitle, { description: t.toasts.saveSuccessDesc });
  };

  const deleteLog = async (id: string) => {
    await localDeleteLog(id);
    setLogs(logs.filter(l => l.id !== id));
    toast.success(t.toasts.deleteSuccessTitle, { description: t.toasts.deleteSuccessDesc });
  };

  const addQuery = async (logId: string, question: string) => {
    // Queries no son muy útiles en app single-user, mockearemos
    toast.error("Queries not supported in offline personal mode");
  };

  const replyToQuery = async (logId: string, queryId: string, response: string) => {
     // Mock
  };

  const markNotificationRead = async (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      await localSaveNotification(notif);
      setNotifications(notifications.map(n => n.id === id ? notif : n));
    }
  };

  const clearNotifications = async (userId: string) => {
    await localClearNotifications();
    setNotifications([]);
  };

  const addTodo = async (todo: Todo) => {
    await localSaveTodo(todo);
    setTodos([todo, ...todos]);
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const todo = todos.find(t => t.id === id);
    if(todo) {
      const updated = { ...todo, ...updates, updated_at: new Date().toISOString() };
      await localSaveTodo(updated);
      setTodos(todos.map(t => t.id === id ? updated : t));
    }
  };

  const deleteTodoAction = async (id: string) => {
    await localDeleteTodo(id);
    setTodos(todos.filter(t => t.id !== id));
  };

  const startTimer = () => {
    const newState = { startTime: new Date().toISOString() };
    setActiveTimer(newState);
    setSecureItem(TIMER_KEY, JSON.stringify(newState));
    toast.success(t.toasts.timerStartedTitle, { description: t.toasts.timerStartedDesc });
  };

  const stopTimer = () => {
    if (!activeTimer.startTime) return 0;
    const elapsedMs = new Date().getTime() - new Date(activeTimer.startTime).getTime();
    const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 60000));
    setActiveTimer({ startTime: null });
    removeSecureItem(TIMER_KEY);
    return elapsedMinutes;
  };

  const updateAssignments = async (userId: string, projectIds: string[], protocolIds: string[]) => {
    // No-op for single user
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
     // No-op for single user
  };

  const signOut = async () => {
    // Sign out local doesn't delete profile from idb, just locks screen.
    setUser(null);
  };

  const signIn = async (profileData: UserProfile) => {
    setProfile(profileData);
    setUser({ id: profileData.id, email: profileData.email });
    await fetchAppData();
  };

  return { 
    user,
    profile,
    logs, 
    projects,
    protocols,

    setProjects,
    setProtocols,
    setSites,

    regions,
    fetchRegions,
    sites,
    notifications,
    profiles,

    projectAssignments,
    protocolAssignments,
    siteAssignments,
    isLoaded,

    isOnline, 
    activeTimer,
    startTimer,
    stopTimer,
    addLog, 
    deleteLog, 
    addQuery,
    replyToQuery,
    markNotificationRead,
    clearNotifications,
    updateAssignments,
    updateUserStatus,
    signOut,
    signIn,
    refreshProfile: async () => {}, // mock
    refreshAppData: fetchAppData,
    todos,
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo: deleteTodoAction,
    activityCategories,
    setActivityCategories,
    refreshActivitiesConfig
  };
}
