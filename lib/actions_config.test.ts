import { describe, it, mock } from "node:test";
import * as assert from "node:assert";

// Mock for "server-only" if needed (standard in this repo's tests)
import Module from "node:module";
const originalRequire = Module.prototype.require;
(Module.prototype as any).require = function(id: string) {
  if (id === "server-only") {
    return {};
  }
  return originalRequire.apply(this, arguments as any);
};

import { createActivityCategory } from "./actions_config";
import { supabase } from "./supabase";

describe("actions_config: createActivityCategory", () => {
  it("should successfully create a category", async () => {
    const mockData = { id: "cat-123", name: "New Category", is_active: true };

    // Mocking supabase.from().insert().select().single()
    const mockSingle = mock.fn(async () => ({ data: mockData, error: null }));
    const mockSelect = mock.fn(() => ({ single: mockSingle }));
    const mockInsert = mock.fn(() => ({ select: mockSelect }));
    const mockFrom = mock.method(supabase, "from", () => ({
      insert: mockInsert
    }));

    const result = await createActivityCategory("New Category");

    assert.deepStrictEqual(result, { success: true, data: mockData });
    assert.strictEqual(mockFrom.mock.calls.length, 1);
    assert.strictEqual((mockFrom.mock.calls[0].arguments as any)[0], "activity_categories");
    assert.deepStrictEqual((mockInsert.mock.calls[0].arguments as any)[0], [{ name: "New Category", is_active: true }]);

    mockFrom.mock.restore();
  });

  it("should return success: false when supabase returns an error", async () => {
    const mockError = { code: "42501", message: "violates row-level security" };

    const mockSingle = mock.fn(async () => ({ data: null, error: mockError }));
    const mockSelect = mock.fn(() => ({ single: mockSingle }));
    const mockInsert = mock.fn(() => ({ select: mockSelect }));
    const mockFrom = mock.method(supabase, "from", () => ({
      insert: mockInsert
    }));

    const result = await createActivityCategory("Forbidden Category");

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Unauthorized: You do not have permission to perform this action.");

    mockFrom.mock.restore();
  });

  it("should return success: false when supabase throws an exception", async () => {
    const mockFrom = mock.method(supabase, "from", () => {
      throw new Error("Unexpected database error");
    });

    const result = await createActivityCategory("Error Category");

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Unexpected database error");

    mockFrom.mock.restore();
  });
});
