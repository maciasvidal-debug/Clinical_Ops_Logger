import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Centralized error logging utility.
 * Sends error details to local console since we are purely offline.
 */
export async function logError(error: unknown, context: string, userId?: string): Promise<void> {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    console.error("App Error:", { errorMessage, stackTrace, context, userId });
  } catch {
    // Silent catch if stringification or anything else fails in the logger itself
  }
}
