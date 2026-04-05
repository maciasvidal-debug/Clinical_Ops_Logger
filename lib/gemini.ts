import { GoogleGenAI } from "@google/genai";

declare global {
  var _googleGenAI: GoogleGenAI | undefined;
}

export const getGeminiClient = () => {
  if (process.env.NODE_ENV === "production") {
    return new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
  } else {
    if (!globalThis._googleGenAI) {
      globalThis._googleGenAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    }
    return globalThis._googleGenAI;
  }
};
