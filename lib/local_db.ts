import { openDB } from 'idb';
import {
  Todo,
  DbActivityCategory,
  LogEntry,
  UserProfile,
  AppNotification,
  Project,
  Protocol,
  Site,
  Region,
} from "./types";

const DB_NAME = "SiteFlowOfflineDB";
const DB_VERSION = 1;

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile');
      if (!db.objectStoreNames.contains('logs')) db.createObjectStore('logs', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('protocols')) db.createObjectStore('protocols', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('sites')) db.createObjectStore('sites', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('regions')) db.createObjectStore('regions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('todos')) db.createObjectStore('todos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('activityCategories')) db.createObjectStore('activityCategories', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('notifications')) db.createObjectStore('notifications', { keyPath: 'id' });
    },
  });
}

// Generadores de ID simples para local
export const generateId = () => crypto.randomUUID();

export async function localGetProfile(): Promise<UserProfile | null> {
  const db = await getDb();
  const profile = await db.get('profile', 'current');
  return profile || null;
}

export async function localSaveProfile(profile: UserProfile): Promise<void> {
  const db = await getDb();
  await db.put('profile', profile, 'current');
}

export async function localGetLogs(): Promise<LogEntry[]> {
  const db = await getDb();
  return db.getAll('logs');
}

export async function localSaveLog(log: LogEntry): Promise<void> {
  const db = await getDb();
  await db.put('logs', log);
}

export async function localSaveLogs(logs: LogEntry[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('logs', 'readwrite');
  for (const log of logs) {
    await tx.store.put(log);
  }
  await tx.done;
}

export async function localDeleteLog(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('logs', id);
}

export async function localGetProjects(): Promise<Project[]> {
  const db = await getDb();
  return db.getAll('projects');
}

export async function localSaveProject(project: Project): Promise<void> {
  const db = await getDb();
  await db.put('projects', project);
}

export async function localSaveProjects(projects: Project[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('projects', 'readwrite');
  for (const project of projects) {
    await tx.store.put(project);
  }
  await tx.done;
}

export async function localGetProtocols(): Promise<Protocol[]> {
  const db = await getDb();
  return db.getAll('protocols');
}

export async function localSaveProtocol(protocol: Protocol): Promise<void> {
  const db = await getDb();
  await db.put('protocols', protocol);
}

export async function localSaveProtocols(protocols: Protocol[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('protocols', 'readwrite');
  for (const protocol of protocols) {
    await tx.store.put(protocol);
  }
  await tx.done;
}

export async function localGetSites(): Promise<Site[]> {
  const db = await getDb();
  return db.getAll('sites');
}

export async function localSaveSite(site: Site): Promise<void> {
  const db = await getDb();
  await db.put('sites', site);
}

export async function localSaveSites(sites: Site[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('sites', 'readwrite');
  for (const site of sites) {
    await tx.store.put(site);
  }
  await tx.done;
}

export async function localGetTodos(): Promise<Todo[]> {
  const db = await getDb();
  return db.getAll('todos');
}

export async function localSaveTodo(todo: Todo): Promise<void> {
  const db = await getDb();
  await db.put('todos', todo);
}

export async function localSaveTodos(todos: Todo[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('todos', 'readwrite');
  for (const todo of todos) {
    await tx.store.put(todo);
  }
  await tx.done;
}

export async function localDeleteTodo(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('todos', id);
}

export async function localGetCategories(): Promise<DbActivityCategory[]> {
  const db = await getDb();
  return db.getAll('activityCategories');
}

export async function localSaveCategory(category: DbActivityCategory): Promise<void> {
  const db = await getDb();
  await db.put('activityCategories', category);
}

export async function localSaveCategories(categories: DbActivityCategory[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('activityCategories', 'readwrite');
  for (const category of categories) {
    await tx.store.put(category);
  }
  await tx.done;
}

export async function localGetNotifications(): Promise<AppNotification[]> {
  const db = await getDb();
  return db.getAll('notifications');
}

export async function localSaveNotification(notif: AppNotification): Promise<void> {
  const db = await getDb();
  await db.put('notifications', notif);
}

export async function localDeleteNotification(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('notifications', id);
}

export async function localClearNotifications(): Promise<void> {
  const db = await getDb();
  await db.clear('notifications');
}

export async function initializeDefaultData(profile: UserProfile) {
  const projects = await localGetProjects();
  if (projects.length === 0) {
    const defaultProject: Project = { id: generateId(), name: "Personal Project", created_at: new Date().toISOString() };
    await localSaveProject(defaultProject);
    const defaultProtocol: Protocol = { id: generateId(), project_id: defaultProject.id, name: "General Protocol", created_at: new Date().toISOString() };
    await localSaveProtocol(defaultProtocol);
    const defaultSite: Site = { id: generateId(), protocol_id: defaultProtocol.id, name: "Home Office", country: "US", created_at: new Date().toISOString() };
    await localSaveSite(defaultSite);

    // Default categories for personal use
    const defaultCategory: DbActivityCategory = {
      id: generateId(),
      name: "Administration",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activity_tasks: [
        {
          id: generateId(),
          category_id: "default",
          name: "Email & Comm",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    };
    defaultCategory.activity_tasks![0].category_id = defaultCategory.id;
    await localSaveCategory(defaultCategory);
  }
}
