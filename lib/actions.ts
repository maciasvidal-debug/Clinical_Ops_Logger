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

import { LogEntry, User, Project, Protocol, Site, Role } from "./types";
import { Type, Schema } from "@google/genai";

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
  userRole: Role | string,
  availableProjects: Project[],
  availableProtocols: Protocol[],
  availableSites: Site[]
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

Extract the relevant information and map it to the provided IDs if possible. Also, reply in the same language as the input text.`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        projectId: { type: Type.STRING, description: "The ID of the matched project, or null if none match", nullable: true },
        protocolId: { type: Type.STRING, description: "The ID of the matched protocol, or null if none match", nullable: true },
        siteId: { type: Type.STRING, description: "The ID of the matched site, or null if none match", nullable: true },
        activityName: { type: Type.STRING, description: "A short 2-5 word description of the activity/task", nullable: true },
        hours: { type: Type.NUMBER, description: "Extracted hours, or 0", nullable: true },
        minutes: { type: Type.NUMBER, description: "Extracted minutes, or 0", nullable: true },
        notes: { type: Type.STRING, description: "The original text or a useful summary", nullable: true }
      }
    };

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
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

export interface AIInsight {
  title: string;
  message: string;
  type: "warning" | "success" | "danger" | "info";
}

export async function generateManagerInsights(
  teamLogs: LogEntry[]
): Promise<ActionResponse<AIInsight[]>> {
  try {
    if (!teamLogs || teamLogs.length === 0) {
      return { success: false, error: "No logs provided to analyze." };
    }

    // Limit to 100 recent logs to avoid exceeding context window
    const recentLogs = teamLogs.slice(0, 100).map(log => ({
      user: log.userName,
      date: log.date,
      durationMinutes: log.durationMinutes,
      project: log.projectId,
      activity: log.activity,
      queries: log.queries?.length || 0
    }));

    const prompt = `You are an AI assistant helping a clinical operations manager analyze their team's recent activity logs.\nHere is a summary of recent logs (max 100):\n${JSON.stringify(recentLogs, null, 2)}\n\nAnalyze this data and generate 1 to 3 insightful observations or alerts for the manager.\nExamples of good insights:\n- \"Warning: [User] has logged a lot of hours in the past few days, potential burnout risk.\"\n- \"Success: The team has been very active resolving queries in [Project].\"\n- \"Danger: A high volume of new queries were created today.\"\n\nReply in the same language as the activity names (likely English or Spanish).\n\nReturn an array of JSON objects with the following keys:\n- title: A short title for the insight.\n- message: A detailed but concise explanation (1-2 sentences).\n- type: Must be one of \"warning\", \"success\", \"danger\", or \"info\".`;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          message: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["warning", "success", "danger", "info"] }
        },
        required: ["title", "message", "type"]
      }
    };

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const generatedText = response.text;

    if (!generatedText) {
      return { success: false, error: "Failed to generate AI insights." };
    }

    try {
      const parsed = JSON.parse(generatedText);
      return { success: true, data: parsed };
    } catch (e) {
       console.error("JSON parse error in manager insights:", e, "Text:", generatedText);
       return { success: false, error: "Failed to parse AI response into structured insights." };
    }

  } catch (error) {
    console.error("Error generating manager insights:", error);
    return {
      success: false,
      error: "An error occurred while generating insights. Please try again.",
    };
  }
}
