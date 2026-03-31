// Native Web Crypto API implementation for encrypting local storage data
// Uses AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)

const ENCRYPTION_KEY_NAME = "app_encryption_key";
const DB_NAME = "AppCryptoDB";
const STORE_NAME = "keys";

let cachedKey: CryptoKey | null = null;

// Helper to open IndexedDB
function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
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

// Helper to get key from IndexedDB
async function getKeyFromDb(): Promise<CryptoKey | null> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(ENCRYPTION_KEY_NAME);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as CryptoKey || null);
    });
  } catch (err) {
    console.warn("Failed to get key from IndexedDB:", err);
    return null;
  }
}

// Helper to save key to IndexedDB
async function saveKeyToDb(key: CryptoKey): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(key, ENCRYPTION_KEY_NAME);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (err) {
    console.warn("Failed to save key to IndexedDB:", err);
  }
}

async function getOrCreateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  // Check if we have a key in IndexedDB first
  if (typeof indexedDB !== "undefined") {
    const dbKey = await getKeyFromDb();
    if (dbKey) {
      cachedKey = dbKey;
      return dbKey;
    }
  }

  // Legacy fallback: check localStorage for migration
  // We keep this to avoid breaking existing users' stored data, but we migrate it out.
  if (typeof localStorage !== "undefined") {
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
    if (storedKey) {
      try {
        const rawKey = new Uint8Array(JSON.parse(storedKey));
        const importedKey = await crypto.subtle.importKey(
          "raw",
          rawKey,
          { name: "AES-GCM" },
          false, // Set to false to prevent future extraction!
          ["encrypt", "decrypt"]
        );

        cachedKey = importedKey;
        if (typeof indexedDB !== "undefined") {
           await saveKeyToDb(importedKey);
        }
        // Remove from vulnerable localStorage
        localStorage.removeItem(ENCRYPTION_KEY_NAME);

        return importedKey;
      } catch (err) {
        console.warn("Failed to migrate legacy encryption key", err);
      }
    }
  }

  // Generate a new key if none exists (now with extractable: false for security)
  const newKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false, // Security Fix: Key is no longer exportable/extractable by JS
    ["encrypt", "decrypt"]
  );

  cachedKey = newKey;

  // Store securely in IndexedDB instead of vulnerable localStorage
  if (typeof indexedDB !== "undefined") {
    await saveKeyToDb(newKey);
  }

  return newKey;
}

export async function encryptData(data: string): Promise<string | null> {
  if (typeof window === "undefined") return data; // SSR safety

  try {
    const key = await getOrCreateKey();
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    // Create a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedData
    );

    // Combine IV and ciphertext for storage
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);

    // Convert to Base64 for string storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption failed:", error);
    return null; // Security Fix: Do not return unencrypted data on failure
  }
}

export async function decryptData(encryptedString: string): Promise<string | null> {
  if (typeof window === "undefined") return encryptedString; // SSR safety

  try {
    // Check if it's legacy unencrypted JSON (starts with { or [)
    if (encryptedString.startsWith("{") || encryptedString.startsWith("[")) {
      return encryptedString;
    }

    const key = await getOrCreateKey();

    // Decode Base64 back to Uint8Array
    const binaryString = atob(encryptedString);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null; // Security Fix: Do not return raw string on failure
  }
}

// For testing purposes only
export function _resetKeyCache() {
  cachedKey = null;
}
