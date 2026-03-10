"use server";

import { genai } from "./gemini";

// Define the response type for the Server Action
export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Generates an AI response using the Gemini API.
 * This function runs exclusively on the server and safely handles errors.
 *
 * @param prompt - The user input prompt.
 * @returns A structured ActionResponse with either the generated text or an error message.
 */
export async function generateAIResponse(
  prompt: string
): Promise<ActionResponse<string>> {
  try {
    if (!prompt || typeof prompt !== "string") {
      return { success: false, error: "Se requiere un prompt de texto válido." };
    }

    // Attempt to generate content using the instantiated client
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const generatedText = response.text;

    if (!generatedText) {
      return { success: false, error: "La API no devolvió una respuesta de texto válida." };
    }

    return { success: true, data: generatedText };
  } catch (error) {
    // Log the actual error securely on the server for debugging
    console.error("Error generating AI response:", error);

    // Return a controlled error message to the client (Zero Regressions)
    return {
      success: false,
      error: "Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.",
    };
  }
}

import { LogEntry, User } from "./types";

export interface ParsedLogData {
  projectId?: string;
  protocolId?: string;
  siteId?: string;
  activityName?: string;
  hours?: number;
  minutes?: number;
  notes?: string;
}

export async function parseNaturalLanguageLog(
  input: string,
  userRole: string,
  availableProjects: any[],
  availableProtocols: any[],
  availableSites: any[]
): Promise<ActionResponse<ParsedLogData>> {
  try {
    if (!input || typeof input !== "string") {
      return { success: false, error: "Se requiere un texto válido." };
    }

    const prompt = `
You are an AI assistant helping a clinical operations professional log their time.
They have provided the following natural language description of their activity:
"${input}"

Their role is: ${userRole}

Available Projects (ID: Name): ${availableProjects.map(p => p.id + ': ' + p.name).join(', ')}
Available Protocols (ID: Name): ${availableProtocols.map(p => p.id + ': ' + p.name).join(', ')}
Available Sites (ID: Name): ${availableSites.map(s => s.id + ': ' + s.name).join(', ')}

Extract the relevant information and map it to the provided IDs if possible.
Return ONLY a valid JSON object with the following optional keys (no markdown formatting, just raw JSON):
{
  "projectId": "string (the ID of the matched project, or null if none match)",
  "protocolId": "string (the ID of the matched protocol, or null if none match)",
  "siteId": "string (the ID of the matched site, or null if none match)",
  "activityName": "string (a short 2-5 word description of the activity/task)",
  "hours": "number (extracted hours, or 0)",
  "minutes": "number (extracted minutes, or 0)",
  "notes": "string (the original text or a useful summary)"
}`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const generatedText = response.text;

    if (!generatedText) {
      return { success: false, error: "Failed to generate a valid response." };
    }

    try {
      const parsed = JSON.parse(generatedText);
      return { success: true, data: parsed };
    } catch (e) {
       console.error("JSON parse error:", e, "Text:", generatedText);
       return { success: false, error: "Failed to parse AI response into structured data." };
    }

  } catch (error) {
    console.error("Error parsing natural language log:", error);
    return {
      success: false,
      error: "An error occurred while analyzing your input. Please try again.",
    };
  }
}
