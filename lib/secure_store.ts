import { encryptData, decryptData } from "./crypto";

const STORE_DB_NAME = "AppSecureStoreDB";
const STORE_NAME = "secure_data";

// Helper to open IndexedDB for generic secure storage
function getSecureDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORE_DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const encryptedValue = await encryptData(value);

    if (typeof indexedDB !== "undefined") {
      const db = await getSecureDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(encryptedValue, key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  } catch (error) {
    console.error("Failed to set secure item:", error);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    let encryptedValue: string | null = null;

    if (typeof indexedDB !== "undefined") {
      const db = await getSecureDb();
      encryptedValue = await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as string || null);
      });
    }

    // Migration from legacy localStorage
    if (!encryptedValue && typeof localStorage !== "undefined") {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue) {
        // We found a legacy value. Migrate it to IndexedDB and remove from localStorage
        encryptedValue = legacyValue;

        // Save to IndexedDB (as encrypted string directly, since legacy value is already encrypted)
        if (typeof indexedDB !== "undefined") {
          const db = await getSecureDb();
          await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(legacyValue, key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
          });
        }

        localStorage.removeItem(key);
      }
    }

    if (encryptedValue) {
      return await decryptData(encryptedValue);
    }

    return null;
  } catch (error) {
    console.error("Failed to get secure item:", error);
    return null;
  }
}

export async function removeSecureItem(key: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if (typeof indexedDB !== "undefined") {
      const db = await getSecureDb();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }

    // Also remove from localStorage to be safe during migration
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Failed to remove secure item:", error);
  }
}
