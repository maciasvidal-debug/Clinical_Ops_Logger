import { describe, it } from "node:test";
import * as assert from "node:assert";

// Mock para evitar el error de "server-only" en `gemini.ts`
import Module from "node:module";
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id: string) {
  if (id === "server-only") {
    return {};
  }
  return originalRequire.apply(this, arguments as any);
};

import { parseNaturalLanguageLog } from "./actions";
import { dictionaries } from "./i18n/dictionaries";

describe("actions: parseNaturalLanguageLog input validation", () => {
  const dummyRole = "cra";
  const dummyProjects: any[] = [];
  const dummyProtocols: any[] = [];

  it("should return success: false for empty string input", async () => {
    const result = await parseNaturalLanguageLog("", dummyRole as any, dummyProjects, dummyProtocols, "en");
    assert.deepStrictEqual(result, { success: false, error: "Invalid input." });
  });

  it("should return success: false for null input", async () => {
    // @ts-expect-error Testing invalid input type
    const result = await parseNaturalLanguageLog(null, dummyRole as any, dummyProjects, dummyProtocols, "en");
    assert.deepStrictEqual(result, { success: false, error: "Invalid input." });
  });

  it("should return success: false for undefined input", async () => {
    // @ts-expect-error Testing invalid input type
    const result = await parseNaturalLanguageLog(undefined, dummyRole as any, dummyProjects, dummyProtocols, "en");
    assert.deepStrictEqual(result, { success: false, error: "Invalid input." });
  });

  it("should return success: false for non-string input", async () => {
    // @ts-expect-error Testing invalid input type
    const result = await parseNaturalLanguageLog(12345, dummyRole as any, dummyProjects, dummyProtocols, "en");
    assert.deepStrictEqual(result, { success: false, error: "Invalid input." });
  });

  it("should return localized error when input exceeds 2000 characters (en)", async () => {
    const longInput = "a".repeat(2001);
    const result = await parseNaturalLanguageLog(longInput, dummyRole as any, dummyProjects, dummyProtocols, "en");
    assert.deepStrictEqual(result, {
      success: false,
      error: dictionaries["en"].logForm.aiInputTooLong
    });
  });

  it("should return localized error when input exceeds 2000 characters (es)", async () => {
    const longInput = "a".repeat(2001);
    const result = await parseNaturalLanguageLog(longInput, dummyRole as any, dummyProjects, dummyProtocols, "es");
    assert.deepStrictEqual(result, {
      success: false,
      error: dictionaries["es"].logForm.aiInputTooLong
    });
  });

  it("should return localized error when input exceeds 2000 characters (pt)", async () => {
    const longInput = "a".repeat(2001);
    const result = await parseNaturalLanguageLog(longInput, dummyRole as any, dummyProjects, dummyProtocols, "pt");
    assert.deepStrictEqual(result, {
      success: false,
      error: dictionaries["pt"].logForm.aiInputTooLong
    });
  });
});

import { mock } from "node:test";
import { supabase } from "./supabase";

describe("actions: parseNaturalLanguageLog execution", () => {
  const dummyRole = "cra";
  const dummyProjects: any[] = [{ id: "proj-1", name: "Project A" }];
  const dummyProtocols: any[] = [{ id: "prot-1", name: "Protocol X", project_id: "proj-1" }];

  let originalGoogleGenAI: any;

  it("should successfully parse natural language input and return parsed data", async () => {
    // Save original global state
    originalGoogleGenAI = globalThis._googleGenAI;

    // 1. Mock getActivitiesConfig indirectly by mocking supabase
    const mockOrder = mock.fn(async () => {
      return {
        data: [
          {
            id: "cat-1",
            name: "Monitoring",
            category_roles: [{ role: "cra" }],
            activity_tasks: [
              {
                id: "task-1",
                name: "Site Visit",
                role_context: "On-site visit",
                activity_subtasks: [{ id: "sub-1", name: "SDV" }]
              }
            ]
          }
        ],
        error: null
      };
    });

    const mockSelect = mock.fn(() => ({ order: mockOrder }));
    const mockFrom = mock.method(supabase, "from", () => ({ select: mockSelect }));

    // 2. Mock Gemini client via globalThis._googleGenAI
    const mockGenerateContent = mock.fn(async () => {
      return {
        text: JSON.stringify({
          duration_minutes: 120,
          project_id: "proj-1",
          protocol_id: "prot-1",
          category: "Monitoring",
          activity: "Site Visit",
          sub_task: "SDV",
          notes: "Did some work"
        })
      };
    });

    globalThis._googleGenAI = {
      models: {
        generateContent: mockGenerateContent
      }
    } as any;

    // 3. Execute
    const input = "I worked 2 hours on Project A Protocol X doing Site Visit SDV";
    const result = await parseNaturalLanguageLog(input, dummyRole as any, dummyProjects, dummyProtocols, "en");

    // 4. Verify
    assert.deepStrictEqual(result, {
      success: true,
      data: {
        duration_minutes: 120,
        project_id: "proj-1",
        protocol_id: "prot-1",
        category: "Monitoring",
        activity: "Site Visit",
        sub_task: "SDV",
        notes: "Did some work"
      }
    });

    // Check if models.generateContent was called correctly
    assert.strictEqual(mockGenerateContent.mock.calls.length, 1);
    const callArgs: any[] | undefined = mockGenerateContent.mock.calls[0]?.arguments;
    assert.ok(callArgs && callArgs.length > 0 && callArgs[0].contents.includes(input));

    // Cleanup
    mockFrom.mock.restore();
    globalThis._googleGenAI = originalGoogleGenAI;
  });

  it("should return success false when AI returns no text", async () => {
    // Save original global state
    originalGoogleGenAI = globalThis._googleGenAI;

    // Mock supabase
    const mockOrder = mock.fn(async () => ({ data: [], error: null }));
    const mockSelect = mock.fn(() => ({ order: mockOrder }));
    const mockFrom = mock.method(supabase, "from", () => ({ select: mockSelect }));

    // Mock Gemini client to return no text
    const mockGenerateContent = mock.fn(async () => {
      return { text: null };
    });

    globalThis._googleGenAI = {
      models: {
        generateContent: mockGenerateContent
      }
    } as any;

    const result = await parseNaturalLanguageLog("test", dummyRole as any, dummyProjects, dummyProtocols, "en");

    assert.deepStrictEqual(result, {
      success: false,
      error: "No response from AI"
    });

    // Cleanup
    mockFrom.mock.restore();
    globalThis._googleGenAI = originalGoogleGenAI;
  });

  it("should handle invalid JSON from AI gracefully", async () => {
    // Save original global state
    originalGoogleGenAI = globalThis._googleGenAI;

    // Mock supabase
    const mockOrder = mock.fn(async () => ({ data: [], error: null }));
    const mockSelect = mock.fn(() => ({ order: mockOrder }));
    const mockFrom = mock.method(supabase, "from", () => ({ select: mockSelect }));

    // Mock Gemini client to return invalid JSON
    const mockGenerateContent = mock.fn(async () => {
      return { text: "invalid json string" };
    });

    globalThis._googleGenAI = {
      models: {
        generateContent: mockGenerateContent
      }
    } as any;

    const result = await parseNaturalLanguageLog("test", dummyRole as any, dummyProjects, dummyProtocols, "en");

    assert.strictEqual(result.success, false);
    assert.ok(result.error && (result.error as string).includes("Unexpected token"));

    // Cleanup
    mockFrom.mock.restore();
    globalThis._googleGenAI = originalGoogleGenAI;
  });

  it("should handle general AI Parsing Errors when Gemini throws", async () => {
    // Save original global state
    originalGoogleGenAI = globalThis._googleGenAI;

    // Mock supabase
    const mockOrder = mock.fn(async () => ({ data: [], error: null }));
    const mockSelect = mock.fn(() => ({ order: mockOrder }));
    const mockFrom = mock.method(supabase, "from", () => ({ select: mockSelect }));

    // Mock Gemini client to throw error
    const mockGenerateContent = mock.fn(async () => {
      throw new Error("API Limit Reached");
    });

    globalThis._googleGenAI = {
      models: {
        generateContent: mockGenerateContent
      }
    } as any;

    const result = await parseNaturalLanguageLog("test", dummyRole as any, dummyProjects, dummyProtocols, "en");

    assert.deepStrictEqual(result, {
      success: false,
      error: "API Limit Reached"
    });

    // Cleanup
    mockFrom.mock.restore();
    globalThis._googleGenAI = originalGoogleGenAI;
  });
});
