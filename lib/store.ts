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
  UserProjectAssignment,
  UserProtocolAssignment,
  UserSiteAssignment,
  Region,
  UserRegion
} from "./types";
import { toast } from "sonner";
import { supabase } from "./supabase";
import { getActivitiesConfig, getTodos, saveTodo } from "./actions";
import { encryptData, decryptData } from "./crypto";
import { logError } from "./utils";
import { useTranslation } from "./i18n";
import { User } from "@supabase/supabase-js";

const TIMER_KEY = "clinical_ops_timer";

export function useAppStore() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  const [projectAssignments, setProjectAssignments] = useState<UserProjectAssignment[]>([]);
  const [protocolAssignments, setProtocolAssignments] = useState<UserProtocolAssignment[]>([]);
  const [siteAssignments, setSiteAssignments] = useState<UserSiteAssignment[]>([]);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [activityCategories, setActivityCategories] = useState<DbActivityCategory[]>([]);

  const refreshActivitiesConfig = useCallback(async () => {
    const res = await getActivitiesConfig();
    if (res.success && res.data) {
      setActivityCategories(res.data);
    }
  }, []);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [activeTimer, setActiveTimer] = useState<{ startTime: string | null }>({ startTime: null });
  const isTimerInitialized = useRef(false);

  // Async load encrypted timer
  useEffect(() => {
    if (isTimerInitialized.current || typeof window === "undefined") return;
    isTimerInitialized.current = true;

    const stored = localStorage.getItem(TIMER_KEY);
    if (stored) {
      decryptData(stored).then(decrypted => {
        try {
          const parsed = JSON.parse(decrypted);
          setActiveTimer(parsed);
        } catch (e) {
          logError(e, "store_parsing_timer");
        }
      });
    }
  }, []);

  // Load profile data

  const fetchRegions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      if (data) setRegions(data);
    } catch (error: unknown) {
      logError(error, "fetch_regions");
    }
  }, []);


  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        logError(error, "fetch_profile", userId);
      }
      return null;
    }
    return data as UserProfile;
  }, []);

  // Load all app data
  const fetchAppData = useCallback(async (userId: string, role: UserRole) => {
    // Fetch logs
    let logsQuery = supabase.from("log_entries").select(`
      *,
      user_profiles (first_name, last_name),
      log_queries (*)
    `);

    if (role !== "manager" && role !== "super_admin") {
      logsQuery = logsQuery.eq("user_id", userId);
    }

    const { data: logsData } = await logsQuery.order("date", { ascending: false });
    if (logsData) setLogs(logsData as LogEntry[]);

    // Fetch master data
    const { data: projectsData } = await supabase.from("projects").select("*");
    if (projectsData) setProjects(projectsData);

    const { data: protocolsData } = await supabase.from("protocols").select("*");
    if (protocolsData) setProtocols(protocolsData);

    const { data: sitesData } = await supabase.from("sites").select("*");
    if (sitesData) setSites(sitesData);

    // Fetch notifications
    const { data: notifsData } = await supabase
      .from("app_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (notifsData) setNotifications(notifsData as AppNotification[]);

    // Manager specific data
    if (role === "manager" || role === "super_admin") {
      const { data: profilesData } = await supabase.from("user_profiles").select("*");
      if (profilesData) setProfiles(profilesData as UserProfile[]);

      const { data: projAssignData } = await supabase.from("user_project_assignments").select("*");
      if (projAssignData) setProjectAssignments(projAssignData as UserProjectAssignment[]);

      const { data: protAssignData } = await supabase.from("user_protocol_assignments").select("*");
      if (protAssignData) setProtocolAssignments(protAssignData as UserProtocolAssignment[]);
    }
  }, []);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(p => {
          setProfile(p);
          if (p && p.status === "active") {
            fetchAppData(session.user.id, p.role);
          }
          setIsLoaded(true);
        });
      } else {
        setIsLoaded(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(p => {
          setProfile(p);
          if (p && p.status === "active") {
            fetchAppData(session.user.id, p.role);
          }
        });
      } else {
        setProfile(null);
        setLogs([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchAppData]);

  // Online/Offline listeners
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
    if (!user) return;
    const { data, error } = await supabase.from("log_entries").insert([{
      ...log,
      user_id: user.id,
      synced: true,
      role: profile?.role || "cra"
    }]).select().single();

    if (error) {
      toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
      logError(error, "add_log", user.id);
    } else {
      setLogs([data as LogEntry, ...logs]);
      toast.success(t.toasts.saveSuccessTitle, { description: t.toasts.saveSuccessDesc });
    }
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase.from("log_entries").delete().eq("id", id);
    if (error) {
      toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
    } else {
      setLogs(logs.filter(l => l.id !== id));
      toast.success(t.toasts.deleteSuccessTitle, { description: t.toasts.deleteSuccessDesc });
    }
  };

  const addQuery = async (logId: string, question: string) => {
    if (!user || !profile) return;
    
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    const { data, error } = await supabase.from("log_queries").insert([{
      log_entry_id: logId,
      manager_id: user.id,
      manager_name: `${profile.first_name} ${profile.last_name}`,
      question,
      status: "OPEN"
    }]).select().single();

    if (error) {
      toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
    } else {
      setLogs(logs.map(l => l.id === logId ? { ...l, log_queries: [...(l.log_queries || []), data as LogQuery] } : l));
      
      await supabase.from("app_notifications").insert([{
        user_id: log.user_id,
        title: "New Query",
        message: `${profile.first_name} opened a query on your log entry.`,
        type: "query",
        is_read: false,
        link: "history"
      }]);
      
      toast.success(t.toasts.queryAddedTitle, { description: t.toasts.queryAddedDesc });
    }
  };

  const replyToQuery = async (logId: string, queryId: string, response: string) => {
    if (!user || !profile) return;

    const { data, error } = await supabase.from("log_queries").update({
      staff_response: response,
      response_date: new Date().toISOString(),
      status: "RESOLVED"
    }).eq("id", queryId).select().single();

    if (error) {
      toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
    } else {
      setLogs(logs.map(l => l.id === logId ? {
        ...l,
        log_queries: l.log_queries?.map(q => q.id === queryId ? (data as LogQuery) : q)
      } : l));

      const query = data as LogQuery;
      await supabase.from("app_notifications").insert([{
        user_id: query.manager_id,
        title: "Query Resolved",
        message: `${profile.first_name} replied to your query.`,
        type: "query",
        is_read: false,
        link: "team"
      }]);

      toast.success(t.toasts.queryResolvedTitle, { description: t.toasts.queryResolvedDesc });
    }
  };

  const markNotificationRead = async (id: string) => {
    const { error } = await supabase.from("app_notifications").update({ is_read: true }).eq("id", id);
    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const clearNotifications = async (userId: string) => {
    const { error } = await supabase.from("app_notifications").delete().eq("user_id", userId);
    if (!error) {
      setNotifications([]);
    }
  };

  const addTodo = (todo: any) => setTodos((prev: any) => [todo, ...prev]);
  const updateTodo = (id: string, updates: any) => setTodos((prev: any) => prev.map((t: any) => t.id === id ? { ...t, ...updates } : t));
  const deleteTodo = (id: string) => setTodos((prev: any) => prev.filter((t: any) => t.id !== id));

  const startTimer = () => {
    const newState = { startTime: new Date().toISOString() };
    setActiveTimer(newState);
    // Persist securely
    encryptData(JSON.stringify(newState)).then(encrypted => {
      localStorage.setItem(TIMER_KEY, encrypted);
    });
    toast.success(t.toasts.timerStartedTitle, { description: t.toasts.timerStartedDesc });
  };

  const stopTimer = () => {
    if (!activeTimer.startTime) return 0;
    const elapsedMs = new Date().getTime() - new Date(activeTimer.startTime).getTime();
    const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 60000));
    setActiveTimer({ startTime: null });
    localStorage.removeItem(TIMER_KEY);
    return elapsedMinutes;
  };

  const updateAssignments = async (userId: string, projectIds: string[], protocolIds: string[]) => {
    // Perform project and protocol assignment updates in parallel to reduce network latency
    const updateProjects = async () => {
      await supabase.from("user_project_assignments").delete().eq("user_id", userId);
      if (projectIds.length > 0) {
        await supabase.from("user_project_assignments").insert(
          projectIds.map(pid => ({ user_id: userId, project_id: pid }))
        );
      }
    };

    const updateProtocols = async () => {
      await supabase.from("user_protocol_assignments").delete().eq("user_id", userId);
      if (protocolIds.length > 0) {
        await supabase.from("user_protocol_assignments").insert(
          protocolIds.map(pid => ({ user_id: userId, protocol_id: pid }))
        );
      }
    };

    await Promise.all([updateProjects(), updateProtocols()]);

    // Refresh local state
    if (user && profile) fetchAppData(user.id, profile.role);
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    const { error } = await supabase.from("user_profiles").update({ status }).eq("id", userId);
    if (error) {
      toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
    } else {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, status } : p));
      toast.success(t.toasts.statusUpdatedTitle, { description: t.toasts.statusUpdatedDesc });
      
      // Notify user
      await supabase.from("app_notifications").insert([{
        user_id: userId,
        title: "Account Status Updated",
        message: `Your account has been ${status} by a manager.`,
        type: "system",
        is_read: false,
        link: "/"
      }]);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLogs([]);
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
    refreshProfile: () => user && fetchProfile(user.id).then(setProfile),
    refreshAppData: () => user && profile && fetchAppData(user.id, profile.role),
    todos,
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    activityCategories,
    setActivityCategories,
    refreshActivitiesConfig
  };
}
