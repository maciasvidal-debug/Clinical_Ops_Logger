/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import { LogEntry, Role, User, UserAssignment, MOCK_USERS, AppNotification, SavedTemplate } from "./types";
import { toast } from "sonner";
import { encryptData, decryptData } from "./crypto";

const STORAGE_KEY = "clinical_ops_logs";
const SYNC_QUEUE_KEY = "clinical_ops_sync_queue";
const USER_KEY = "clinical_ops_user";
const ASSIGNMENTS_KEY = "clinical_ops_assignments";
const NOTIFICATIONS_KEY = "clinical_ops_notifications";
const TEMPLATES_KEY = "clinical_ops_templates";

const DEFAULT_ASSIGNMENTS: UserAssignment[] = [
  { userId: "u2", projectIds: ["PRJ-JIT"], protocolIds: ["PROT-101", "PROT-202"] },
  { userId: "u3", projectIds: ["PRJ-FSP"], protocolIds: ["PROT-303"] },
  { userId: "u4", projectIds: ["PRJ-JIT", "PRJ-FSP"], protocolIds: ["PROT-101", "PROT-303"] },
  { userId: "u5", projectIds: ["PRJ-FULL"], protocolIds: ["PROT-404"] },
];


export interface ActiveTimer {
  startTime: number;
  isRunning: boolean;
}

export function useAppStore() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [syncQueue, setSyncQueue] = useState<LogEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [assignments, setAssignments] = useState<UserAssignment[]>(DEFAULT_ASSIGNMENTS);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);

  // Refs to track the last persisted state to avoid redundant encryption and potential race conditions
  const lastPersistedLogs = useRef<string>("");
  const lastPersistedQueue = useRef<string>("");
  const lastPersistedUser = useRef<string>("");
  const lastPersistedAssignments = useRef<string>("");
  const lastPersistedNotifications = useRef<string>("");
  const lastPersistedTemplates = useRef<string>("");

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      const getItem = async (key: string) => {
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        // Try to decrypt
        const decrypted = await decryptData(stored);
        if (decrypted) return decrypted;

        // Fallback for legacy plaintext data (if it looks like JSON or is a simple value)
        return stored;
      };

      const storedLogs = await getItem(STORAGE_KEY);
      const storedQueue = await getItem(SYNC_QUEUE_KEY);
      const storedUser = await getItem(USER_KEY);
      const storedAssignments = await getItem(ASSIGNMENTS_KEY);
      const storedNotifications = await getItem(NOTIFICATIONS_KEY);
      const storedTemplates = await getItem(TEMPLATES_KEY);

      if (storedLogs) {
        try {
          setLogs(JSON.parse(storedLogs));
          lastPersistedLogs.current = storedLogs;
        } catch (e) {
          console.error("Failed to parse logs", e);
        }
      }
      if (storedQueue) {
        try {
          setSyncQueue(JSON.parse(storedQueue));
          lastPersistedQueue.current = storedQueue;
        } catch (e) {
          console.error("Failed to parse sync queue", e);
        }
      }
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const user = MOCK_USERS.find(u => u.id === parsedUser.id) || MOCK_USERS[0];
          setCurrentUser(user);
          lastPersistedUser.current = JSON.stringify(user);
        } catch (e) {
          console.error("Failed to parse user", e);
        }
      }
      if (storedNotifications) {
        try {
          setNotifications(JSON.parse(storedNotifications));
          lastPersistedNotifications.current = storedNotifications;
        } catch (e) { console.error("Error parsing stored notifications", e); }
      }

      if (storedTemplates) {
        try {
          setTemplates(JSON.parse(storedTemplates));
          lastPersistedTemplates.current = storedTemplates;
        } catch (e) { console.error("Error parsing stored templates", e); }
      }

      if (storedAssignments) {
        try {
          setAssignments(JSON.parse(storedAssignments));
          lastPersistedAssignments.current = storedAssignments;
        } catch (e) {
          console.error("Failed to parse assignments", e);
        }
      }

      setIsLoaded(true);
      setIsOnline(navigator.onLine);
    };

    loadState();
  }, []);

  // Persistence Effects - using effects to handle async encryption and localStorage writes
  useEffect(() => {
    if (!isLoaded) return;
    const data = JSON.stringify(logs);
    if (data === lastPersistedLogs.current) return;

    encryptData(data).then(encrypted => {
      localStorage.setItem(STORAGE_KEY, encrypted);
      lastPersistedLogs.current = data;
    }).catch(err => console.error("Failed to persist logs", err));
  }, [logs, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const data = JSON.stringify(syncQueue);
    if (data === lastPersistedQueue.current) return;

    if (syncQueue.length === 0) {
      localStorage.removeItem(SYNC_QUEUE_KEY);
      lastPersistedQueue.current = data;
    } else {
      encryptData(data).then(encrypted => {
        localStorage.setItem(SYNC_QUEUE_KEY, encrypted);
        lastPersistedQueue.current = data;
      }).catch(err => console.error("Failed to persist sync queue", err));
    }
  }, [syncQueue, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const data = JSON.stringify(currentUser);
    if (data === lastPersistedUser.current) return;

    encryptData(data).then(encrypted => {
      localStorage.setItem(USER_KEY, encrypted);
      lastPersistedUser.current = data;
    }).catch(err => console.error("Failed to persist user", err));
  }, [currentUser, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const data = JSON.stringify(assignments);
    if (data === lastPersistedAssignments.current) return;

    encryptData(data).then(encrypted => {
      localStorage.setItem(ASSIGNMENTS_KEY, encrypted);
      lastPersistedAssignments.current = data;
    }).catch(err => console.error("Failed to persist assignments", err));
  }, [assignments, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const data = JSON.stringify(notifications);
    if (data === lastPersistedNotifications.current) return;

    encryptData(data).then(encrypted => {
      localStorage.setItem(NOTIFICATIONS_KEY, encrypted);
      lastPersistedNotifications.current = data;
    }).catch(err => console.error("Failed to persist notifications", err));
  }, [notifications, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const data = JSON.stringify(templates);
    if (data === lastPersistedTemplates.current) return;

    encryptData(data).then(encrypted => {
      localStorage.setItem(TEMPLATES_KEY, encrypted);
      lastPersistedTemplates.current = data;
    }).catch(err => console.error("Failed to persist templates", err));
  }, [templates, isLoaded]);


  // Online/Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online. Syncing data...");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline. Changes will be saved locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync logic
  const processSyncQueue = useCallback(async () => {
    if (!isOnline || syncQueue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mark all as synced
    const syncQueueIds = new Set(syncQueue.map(q => q.id));
    const syncedLogs = logs.map(log => 
      syncQueueIds.has(log.id) ? { ...log, synced: true } : log
    );

    setLogs(syncedLogs);
    setSyncQueue([]);
    
    setIsSyncing(false);
    toast.success("All offline changes synced successfully.");
  }, [isOnline, syncQueue, logs, isSyncing]);

  useEffect(() => {
    if (isOnline && syncQueue.length > 0 && !isSyncing) {
      processSyncQueue();
    }
  }, [isOnline, syncQueue.length, isSyncing, processSyncQueue]);

  const addLog = (log: Omit<LogEntry, "id" | "synced" | "userId" | "userName">) => {
    const newLog: LogEntry = {
      ...log,
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.name,
      synced: isOnline,
    };
    
    setLogs(prev => [newLog, ...prev]);

    if (!isOnline) {
      setSyncQueue(prev => [...prev, newLog]);
    } else {
      // Simulate immediate sync
      toast.success("Activity logged successfully.");
    }
  };


  // Notification Actions
  const addNotification = useCallback((notificationData: Omit<AppNotification, "id" | "date" | "isRead">) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Attempt system web notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(newNotification.title, { body: newNotification.message });
    } else if ("Notification" in window && Notification.permission !== "denied") {
       Notification.requestPermission().then(permission => {
         if (permission === "granted") {
           new Notification(newNotification.title, { body: newNotification.message });
         }
       });
    }

  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.filter(n => !n.isRead));
  }, []);

  // Template Actions
  const addTemplate = useCallback((templateData: Omit<SavedTemplate, "id" | "userId">) => {
    const newTemplate: SavedTemplate = {
      ...templateData,
      id: crypto.randomUUID(),
      userId: currentUser.id,
    };
    setTemplates(prev => [...prev, newTemplate]);
    toast.success("Template saved successfully.");
  }, [currentUser.id]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success("Template deleted.");
  }, []);

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter((l) => l.id !== id));
    setSyncQueue(prev => prev.filter((l) => l.id !== id));
  };

  const changeUser = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      toast.info(`Switched to ${user.name}`);
    }
  };

  const updateAssignments = (userId: string, projectIds: string[], protocolIds: string[]) => {
    setAssignments(prev => {
      const next = prev.filter(a => a.userId !== userId);
      next.push({ userId, projectIds, protocolIds });
      return next;
    });
    toast.success("Assignments updated successfully.");
  };

  const addQuery = (logId: string, question: string) => {
    setLogs(prev => prev.map(log => {
      if (log.id === logId) {
        const queries = log.queries || [];
        return {
          ...log,
          queries: [
            ...queries,
            {
              id: crypto.randomUUID(),
              managerName: currentUser.name,
              question,
              questionDate: new Date().toISOString(),
              status: "OPEN" as const
            }
          ]
        };
      }
      return log;
    }));
    toast.success("Query added.");
  };

  const replyToQuery = (logId: string, queryId: string, response: string) => {
    setLogs(prev => prev.map(log => {
      if (log.id === logId && log.queries) {
        return {
          ...log,
          queries: log.queries.map(q => 
            q.id === queryId 
              ? { ...q, staffResponse: response, responseDate: new Date().toISOString(), status: "RESOLVED" as const }
              : q
          )
        };
      }
      return log;
    }));
    toast.success("Query resolved.");
  };


  const startTimer = () => {
    setActiveTimer({ startTime: Date.now(), isRunning: true });
  };

  const stopTimer = () => {
    if (!activeTimer) return 0;
    const durationMs = Date.now() - activeTimer.startTime;
    setActiveTimer(null);
    return Math.floor(durationMs / 60000); // Return duration in minutes
  };

  const cancelTimer = () => {
    setActiveTimer(null);
  };

  return { 
    logs,
    activeTimer,
    startTimer,
    stopTimer,
    cancelTimer,
    notifications,
    templates,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    addTemplate,
    deleteTemplate,
    isLoaded, 
    addLog, 
    deleteLog, 
    isOnline, 
    isSyncing, 
    syncQueueCount: syncQueue.length,
    currentUser,
    changeUser,
    assignments,
    updateAssignments,
    addQuery,
    replyToQuery
  };
}
