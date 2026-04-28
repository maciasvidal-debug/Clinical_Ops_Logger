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

      // Security Fix: Detect if IndexedDB value is unencrypted JSON and encrypt it
      if (encryptedValue && (encryptedValue.startsWith("{") || encryptedValue.startsWith("["))) {
        const valToEncrypt = encryptedValue;
        const encrypted = await encryptData(valToEncrypt);
        if (encrypted) {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          store.put(encrypted, key);
        }
      }
    }

    // Migration from legacy localStorage
    if (!encryptedValue && typeof localStorage !== "undefined") {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue) {
        // We found a legacy value.
        // Security Fix: Detect if legacy value is unencrypted JSON and encrypt it before migration
        let valueToStore = legacyValue;
        if (legacyValue.startsWith("{") || legacyValue.startsWith("[")) {
          const encrypted = await encryptData(legacyValue);
          if (encrypted) {
            valueToStore = encrypted;
          }
        }

        encryptedValue = valueToStore;

        // Save to IndexedDB
        if (typeof indexedDB !== "undefined") {
          const db = await getSecureDb();
          await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(valueToStore, key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              // Only remove from localStorage if IndexedDB save was successful
              localStorage.removeItem(key);
              resolve();
            };
          });
        } else {
          // If IndexedDB is not available, we still want to return the value
          // but we might not be able to "migrate" it properly while keeping security.
          // However, for consistency with existing code, we don't remove from localStorage here
          // because migration (to IDB) didn't happen.
        }
      }
    }

    if (encryptedValue) {
      // Security Fix: Handle case where data is still unencrypted JSON
      if (encryptedValue.startsWith("{") || encryptedValue.startsWith("[")) {
        return encryptedValue;
      }
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
