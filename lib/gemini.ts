import "server-only";
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
export const genai = globalForGenAI.genai ?? new GoogleGenAI({ apiKey: apiKey || "" });

if (process.env.NODE_ENV !== "production") {
  globalForGenAI.genai = genai;
}
