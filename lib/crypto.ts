"use client";

/**
 * Utility for encrypting and decrypting data in localStorage using the Web Crypto API (AES-GCM).
 * This provides a security layer to prevent sensitive data from being stored in plaintext.
 */

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_STORAGE_ENCRYPTION_KEY || "clinical-ops-default-secure-key-2024-v1";

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(ENCRYPTION_KEY);
  // Hash the key to ensure it's 256 bits (32 bytes) for AES-GCM
  const hash = await crypto.subtle.digest("SHA-256", keyData);
  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a string and returns a base64 encoded string containing IV + ciphertext.
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encodedData = enc.encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedData
    );

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Efficient base64 conversion
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption failed:", error);
    // Throw error to ensure we don't silently fallback to plaintext
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts a base64 encoded string (IV + ciphertext) and returns the original string.
 * Returns null if decryption fails (e.g., if data is not encrypted or key mismatch).
 */
export async function decryptData(encryptedBase64: string): Promise<string | null> {
  if (!encryptedBase64) return null;

  try {
    const key = await getKey();
    const binaryString = atob(encryptedBase64);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    if (combined.length < 13) return null; // IV (12) + at least 1 byte of ciphertext

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    // Decryption might fail if the data is legacy plaintext or corrupted
    return null;
  }
}
