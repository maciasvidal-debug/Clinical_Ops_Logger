import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';

import { getGeminiClient } from './gemini';

describe('gemini: getGeminiClient', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const originalGoogleGenAI = globalThis._googleGenAI;

  beforeEach(() => {
    // Reset global state before each test
    delete globalThis._googleGenAI;
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    // Restore global state after each test
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true, configurable: true, enumerable: true });
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalApiKey;
    globalThis._googleGenAI = originalGoogleGenAI;
  });

  it('should create a new client in production and not set globalThis', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true, enumerable: true });

    const client = getGeminiClient();

    assert.ok(client !== undefined);
    assert.strictEqual(globalThis._googleGenAI, undefined);
  });

  it('should create a new client in development and set globalThis', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true, enumerable: true });

    assert.strictEqual(globalThis._googleGenAI, undefined);

    const client = getGeminiClient();

    assert.ok(client !== undefined);
    assert.strictEqual(globalThis._googleGenAI, client);
  });

  it('should reuse the existing client in development if it is already set', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true, enumerable: true });

    // First call to initialize
    const client1 = getGeminiClient();

    assert.ok(client1 !== undefined);
    assert.strictEqual(globalThis._googleGenAI, client1);

    // Second call should return the exact same instance
    const client2 = getGeminiClient();

    assert.strictEqual(client1, client2);
  });
});
