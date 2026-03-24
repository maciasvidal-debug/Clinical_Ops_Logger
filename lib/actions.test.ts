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
