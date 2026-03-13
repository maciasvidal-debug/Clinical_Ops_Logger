"use server";

import { getGeminiClient } from "./gemini";
import { Type } from "@google/genai";
import { 
  ROLE_HIERARCHY, 
  UserRole, 
  Project, 
  Protocol,
  LogEntry
} from "./types";

export type ActionResponse<T> = { success: true; data: T } | { success: false; error: string };

export interface ParsedLogData {
  duration_minutes?: number;
  project_id?: string;
  protocol_id?: string;
  category?: string;
  activity?: string;
  sub_task?: string;
  notes?: string;
}

export async function parseNaturalLanguageLog(
  input: string,
  userRole: UserRole,
  availableProjects: Project[],
  availableProtocols: Protocol[]
): Promise<ActionResponse<ParsedLogData>> {
  try {
    const ai = getGeminiClient();
    
    const availableCategories = ROLE_HIERARCHY[userRole] || [];
    
    const prompt = `
      You are an AI assistant for a Clinical Operations time tracking app.
      Parse the following natural language input into a structured log entry.
      
      User Input: "${input}"
      
      Available Projects: ${JSON.stringify(availableProjects.map(p => ({ id: p.id, name: p.name })))}
      Available Protocols: ${JSON.stringify(availableProtocols.map(p => ({ id: p.id, name: p.name, projectId: p.project_id })))}
      Available Categories and Tasks for this user's role (${userRole}): ${JSON.stringify(availableCategories)}
      
      Extract the following:
      - duration_minutes: Total duration in minutes (e.g., "2 hours" = 120).
      - project_id: The ID of the best matching project.
      - protocol_id: The ID of the best matching protocol.
      - category: The name of the best matching category.
      - activity: The name of the best matching task/activity.
      - sub_task: The name of the best matching sub-task (if applicable).
      - notes: Any additional context or notes from the input.
      
      If you cannot determine a field with high confidence, omit it.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            duration_minutes: { type: Type.NUMBER },
            project_id: { type: Type.STRING },
            protocol_id: { type: Type.STRING },
            category: { type: Type.STRING },
            activity: { type: Type.STRING },
            sub_task: { type: Type.STRING },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      return { success: false, error: "No response from AI" };
    }

    const data = JSON.parse(text);
    return { success: true, data };
  } catch (error: unknown) {
    console.error("AI Parsing Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to parse input" };
  }
}

export async function generateAIReport(
  logs: LogEntry[],
  userRole: UserRole,
  userName: string
): Promise<ActionResponse<string>> {
  try {
    const ai = getGeminiClient();
    
    // Summarize logs to reduce token usage
    const summarizedLogs = logs.map(log => ({
      date: log.date,
      duration: log.duration_minutes,
      project: log.project_id, // We don't have project names here easily without passing them, but ID might be enough or we can pass names
      protocol: log.protocol_id,
      activity: log.activity,
      sub_task: log.sub_task,
      user: log.user_profiles?.first_name ? `${log.user_profiles.first_name} ${log.user_profiles.last_name}` : log.role
    }));

    const prompt = `
      You are an expert Clinical Operations Manager and Data Analyst.
      Generate a weekly summary report based on the following time tracking logs.
      
      User Role: ${userRole}
      User Name: ${userName}
      
      Logs Data (JSON):
      ${JSON.stringify(summarizedLogs)}
      
      Instructions:
      1. Analyze the data and provide a concise, insightful summary of the week's activities.
      2. Tailor the insights to the user's role:
         - If Manager: Focus on team productivity, project distribution, bottlenecks, and query resolution rates.
         - If CRA/CRC: Focus on individual performance, time spent on key activities (e.g., monitoring, patient visits), and areas for efficiency improvement.
      3. Highlight any anomalies or notable trends (e.g., "A significant amount of time was spent on SAE follow-ups this week").
      4. Format the output in clean, readable Markdown. Use headings, bullet points, and bold text for emphasis.
      5. Keep the tone professional, encouraging, and actionable.
      6. Do not include any raw JSON or technical jargon in the final output.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      return { success: false, error: "No response from AI" };
    }

    return { success: true, data: text };
  } catch (error: unknown) {
    console.error("AI Report Generation Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate report" };
  }
}
