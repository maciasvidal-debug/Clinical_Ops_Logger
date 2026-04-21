import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import * as assert from 'node:assert';
import { getGeminiClient } from './gemini.ts';
import { GoogleGenAI } from "@google/genai";

describe('getGeminiClient', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = 'test-api-key';
    // Clear the singleton before each test
    (globalThis as any)._googleGenAI = undefined;
  });

  afterEach(() => {
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalApiKey;
    (globalThis as any)._googleGenAI = undefined;
    mock.restoreAll();
  });

  it('returns a singleton instance in non-production (development)', () => {
    process.env.NODE_ENV = 'development';

    const client1 = getGeminiClient();
    const client2 = getGeminiClient();

    assert.strictEqual(client1, client2, 'Should return the same instance');
    assert.ok(client1 instanceof GoogleGenAI, 'Should be an instance of GoogleGenAI');
    assert.strictEqual((globalThis as any)._googleGenAI, client1, 'Should be stored in globalThis');
  });

  it('returns a singleton instance in non-production (test)', () => {
    process.env.NODE_ENV = 'test';

    const client1 = getGeminiClient();
    const client2 = getGeminiClient();

    assert.strictEqual(client1, client2, 'Should return the same instance');
    assert.ok(client1 instanceof GoogleGenAI, 'Should be an instance of GoogleGenAI');
    assert.strictEqual((globalThis as any)._googleGenAI, client1, 'Should be stored in globalThis');
  });

  it('returns a new instance every time in production', () => {
    process.env.NODE_ENV = 'production';

    const client1 = getGeminiClient();
    const client2 = getGeminiClient();

    assert.notStrictEqual(client1, client2, 'Should return different instances');
    assert.ok(client1 instanceof GoogleGenAI, 'First client should be an instance of GoogleGenAI');
    assert.ok(client2 instanceof GoogleGenAI, 'Second client should be an instance of GoogleGenAI');
    assert.strictEqual((globalThis as any)._googleGenAI, undefined, 'Should NOT be stored in globalThis in production');
  });
});
