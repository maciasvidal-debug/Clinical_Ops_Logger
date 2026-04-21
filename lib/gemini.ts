import { GoogleGenAI } from "@google/genai";

let cachedClient: GoogleGenAI | undefined;

/**
 * Returns a GoogleGenAI client instance.
 * Uses a module-level cache to avoid multiple instances while keeping the client
 * private and not exposed on globalThis.
 */
export const getGeminiClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (cachedClient) {
    return cachedClient;
  }

  // In production, we can still benefit from caching at the module level.
  // This is safer than globalThis which exposes the instance to the entire environment.
  const client = new GoogleGenAI({ apiKey: apiKey || "" });

  // Only cache if we have an API key, or we might cache an invalid client
  if (apiKey) {
    cachedClient = client;
  }

  return client;
};

/**
 * Resets the cached client. For testing purposes only.
 */
export const _resetGeminiCache = () => {
  cachedClient = undefined;
};
