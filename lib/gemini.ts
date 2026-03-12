// import "server-only"; // tests break otherwise
import { GoogleGenAI } from "@google/genai";

// Ensure we don't leak the API key to the client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in the environment variables.");
}

// Global scope definition for TypeScript to prevent multiple instances in development
const globalForGenAI = globalThis as unknown as {
  genai: GoogleGenAI | undefined;
};

// Singleton pattern to instantiate the client
// In development, it reuses the existing instance to avoid multiple connections due to HMR
// We use 'let' instead of 'const' to allow mocking in tests
export let genai = globalForGenAI.genai ?? new GoogleGenAI({ apiKey: apiKey || "" });

/**
 * For testing purposes only: allows mocking the genai client.
 */
export function setGenai(newGenai: any) {
  genai = newGenai;
}

if (process.env.NODE_ENV !== "production") {
  globalForGenAI.genai = genai;
}
