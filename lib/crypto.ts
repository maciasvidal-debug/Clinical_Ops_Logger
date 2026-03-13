// Native Web Crypto API implementation for encrypting local storage data
// Uses AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)

const ENCRYPTION_KEY_NAME = "app_encryption_key";

async function getOrCreateKey(): Promise<CryptoKey> {
  // Try to load existing key material from unencrypted storage
  // (In a real high-security app, this would come from a server or PBKDF2 from a user password)
  // For this local-first app, we generate and store it.
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);

  if (storedKey) {
    const rawKey = new Uint8Array(JSON.parse(storedKey));
    return await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Generate a new key if none exists
  const newKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // Store the raw key material (for persistence across reloads)
  const exportedKey = await crypto.subtle.exportKey("raw", newKey);
  localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(Array.from(new Uint8Array(exportedKey))));

  return newKey;
}

export async function encryptData(data: string): Promise<string> {
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
    return data; // Fallback in case of failure
  }
}

export async function decryptData(encryptedString: string): Promise<string> {
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
    console.warn("Decryption failed, assuming legacy unencrypted data:", error);
    return encryptedString; // Fallback to raw string (legacy compatibility)
  }
}
