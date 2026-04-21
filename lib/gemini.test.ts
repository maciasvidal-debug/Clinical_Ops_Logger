import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { getGeminiClient, _resetGeminiCache } from "./gemini";

describe("gemini: getGeminiClient", () => {
  const originalApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  beforeEach(() => {
    _resetGeminiCache();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalApiKey;
  });

  it("should create a GoogleGenAI client", () => {
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = "test-api-key";
    const client = getGeminiClient();
    assert.ok(client, "Client should be created");
    // @ts-ignore - access private apiKey for verification in test
    assert.strictEqual(client.apiKey, "test-api-key");
  });

  it("should reuse the cached client", () => {
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = "test-api-key";
    const client1 = getGeminiClient();
    const client2 = getGeminiClient();
    assert.strictEqual(client1, client2, "Clients should be identical (cached)");
  });

  it("should not expose _googleGenAI on globalThis", () => {
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = "test-api-key";
    getGeminiClient();
    // @ts-ignore
    assert.strictEqual(globalThis._googleGenAI, undefined, "globalThis._googleGenAI should be undefined");
  });

  it("should handle missing API key", () => {
    delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const client = getGeminiClient();
    assert.ok(client, "Client should be created even without API key");
    // @ts-ignore
    assert.strictEqual(client.apiKey, "");
  });
});
