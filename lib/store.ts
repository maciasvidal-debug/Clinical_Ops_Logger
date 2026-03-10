/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { LogEntry, Role, User, UserAssignment, MOCK_USERS } from "./types";
import { toast } from "sonner";

const STORAGE_KEY = "clinical_ops_logs";
const SYNC_QUEUE_KEY = "clinical_ops_sync_queue";
const USER_KEY = "clinical_ops_user";
const ASSIGNMENTS_KEY = "clinical_ops_assignments";

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

  // Load initial state
  useEffect(() => {
    const storedLogs = localStorage.getItem(STORAGE_KEY);
    const storedQueue = localStorage.getItem(SYNC_QUEUE_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const storedAssignments = localStorage.getItem(ASSIGNMENTS_KEY);

    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }
    if (storedQueue) {
      try {
        setSyncQueue(JSON.parse(storedQueue));
      } catch (e) {
        console.error("Failed to parse sync queue", e);
      }
    }
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const user = MOCK_USERS.find(u => u.id === parsedUser.id) || MOCK_USERS[0];
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
    if (storedAssignments) {
      try {
        setAssignments(JSON.parse(storedAssignments));
      } catch (e) {
        console.error("Failed to parse assignments", e);
      }
    }

    setIsLoaded(true);
    setIsOnline(navigator.onLine);
  }, []);

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
    const syncedLogs = logs.map(log => 
      syncQueue.find(q => q.id === log.id) ? { ...log, synced: true } : log
    );

    setLogs(syncedLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedLogs));
    
    setSyncQueue([]);
    localStorage.removeItem(SYNC_QUEUE_KEY);
    
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
    
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));

    if (!isOnline) {
      const newQueue = [...syncQueue, newLog];
      setSyncQueue(newQueue);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
    } else {
      // Simulate immediate sync
      toast.success("Activity logged successfully.");
    }
  };

  const deleteLog = (id: string) => {
    const newLogs = logs.filter((l) => l.id !== id);
    setLogs(newLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));

    // Remove from sync queue if it was pending
    const newQueue = syncQueue.filter((l) => l.id !== id);
    if (newQueue.length !== syncQueue.length) {
      setSyncQueue(newQueue);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
    }
  };

  const changeUser = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      toast.info(`Switched to ${user.name}`);
    }
  };

  const updateAssignments = (userId: string, projectIds: string[], protocolIds: string[]) => {
    const newAssignments = assignments.filter(a => a.userId !== userId);
    newAssignments.push({ userId, projectIds, protocolIds });
    setAssignments(newAssignments);
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(newAssignments));
    toast.success("Assignments updated successfully.");
  };

  const addQuery = (logId: string, question: string) => {
    const newLogs = logs.map(log => {
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
    });
    setLogs(newLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
    toast.success("Query added.");
  };

  const replyToQuery = (logId: string, queryId: string, response: string) => {
    const newLogs = logs.map(log => {
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
    });
    setLogs(newLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
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
