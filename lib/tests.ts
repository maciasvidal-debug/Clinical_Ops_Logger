/**
 * SiteFlow Clinical Ops Logger - Logic Tests
 * This file contains unit tests for core application logic.
 */

import { format, parseISO, isSameDay } from "date-fns";

// Mocking some types for testing
interface LogEntry {
  duration_minutes: number;
  date: string;
}

/**
 * Test: Time Formatting
 */
export function testFormatHours(minutes: number): string {
  if (typeof minutes !== 'number' || isNaN(minutes) || !isFinite(minutes) || minutes < 0) {
    return '0h 0m';
  }

  const roundedMinutes = Math.round(minutes);
  const h = Math.floor(roundedMinutes / 60);
  const m = roundedMinutes % 60;
  return `${h}h ${m}m`;
}

/**
 * Test: Daily Total Calculation
 */
export function calculateDailyTotal(logs: LogEntry[], targetDate: Date): number {
  return logs
    .filter((log) => isSameDay(parseISO(log.date), targetDate))
    .reduce((acc, log) => acc + log.duration_minutes, 0);
}

/**
 * Test: Natural Language Parsing Logic (Simplified)
 */
export function mockParseNaturalLanguage(input: string) {
  const lowerInput = input.toLowerCase();
  let duration = 0;
  
  // Simple regex for "X hours" or "X mins"
  const hourMatch = lowerInput.match(/(\d+)\s*hour/);
  const minMatch = lowerInput.match(/(\d+)\s*min/);
  
  if (hourMatch) duration += parseInt(hourMatch[1]) * 60;
  if (minMatch) duration += parseInt(minMatch[1]);
  
  return {
    duration_minutes: duration,
    success: duration > 0
  };
}

// Run basic assertions
export function runAuditTests() {
  const results = {
    formatting: testFormatHours(125) === "2h 5m",
    calculation: calculateDailyTotal([{ duration_minutes: 30, date: "2026-03-12" }], new Date("2026-03-12")) === 30,
    parsing: mockParseNaturalLanguage("2 hours and 15 mins").duration_minutes === 135
  };
  
  console.log("Audit Test Results:", results);
  return results;
}
