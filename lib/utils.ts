import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Centralized error logging utility.
 * Sends error details to the `system_errors` table in Supabase asynchronously
 * without blocking the main execution thread.
 *
 * @param error - The error object to be logged.
 * @param context - A string describing where the error occurred (e.g., "store_parsing").
 * @param userId - Optional ID of the user who encountered the error.
 */
export async function logError(error: unknown, context: string, userId?: string): Promise<void> {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    // Send asynchronously without awaiting to avoid blocking UI threads
    supabase
      .from("system_errors")
      .insert([
        {
          message: errorMessage,
          stack_trace: stackTrace,
          context: context,
          user_id: userId || null,
        },
      ])
      .then(({ error: dbError }) => {
        if (dbError) {
          // If the logging system itself fails, we fall back to a silent failure
          // because we don't want to crash the app or show a confusing generic error
          // when the real issue is just the logger failing.
        }
      });
  } catch {
    // Silent catch if stringification or anything else fails in the logger itself
  }
}
