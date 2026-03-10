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
