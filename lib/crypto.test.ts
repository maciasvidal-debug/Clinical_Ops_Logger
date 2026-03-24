import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { encryptData, decryptData } from './crypto';

describe('crypto utilities', () => {
  let originalWindow: any;
  let originalLocalStorage: any;
  let originalCrypto: any;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalLocalStorage = globalThis.localStorage;
    originalCrypto = globalThis.crypto;

    // Mock window to bypass SSR check
    (globalThis as any).window = {};

    // Mock localStorage
    const store = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (key: string) => store.get(key) || null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalLocalStorage;
    // Restore crypto if it was modified
    if (originalCrypto !== globalThis.crypto) {
       Object.defineProperty(globalThis, 'crypto', {
         value: originalCrypto,
         writable: true,
         configurable: true
       });
    }
  });

  it('should return original data if window is undefined (SSR)', async () => {
    (globalThis as any).window = undefined;
    const data = "test-data";
    const encrypted = await encryptData(data);
    assert.strictEqual(encrypted, data);
  });

  it('should successfully encrypt and decrypt a string', async () => {
    const data = "secret-message-123";
    const encrypted = await encryptData(data);

    // Should not be the same as input
    assert.notStrictEqual(encrypted, data);

    // Should be a base64-like string (not JSON)
    assert.ok(encrypted.length > data.length);

    const decrypted = await decryptData(encrypted);
    assert.strictEqual(decrypted, data);
  });

  it('should reuse the same key for multiple encryptions', async () => {
    const data1 = "first message";
    const data2 = "second message";

    const encrypted1 = await encryptData(data1);
    const encrypted2 = await encryptData(data2);

    assert.notStrictEqual(encrypted1, data1);
    assert.notStrictEqual(encrypted2, data2);

    const decrypted1 = await decryptData(encrypted1);
    const decrypted2 = await decryptData(encrypted2);

    assert.strictEqual(decrypted1, data1);
    assert.strictEqual(decrypted2, data2);
  });

  it('should fallback to returning encrypted string if decryption fails (legacy support)', async () => {
    const invalidEncrypted = "not-a-valid-base64-or-encrypted-string";
    // Suppress console.warn for the test
    const originalConsoleWarn = console.warn;
    console.warn = () => {};

    const decrypted = await decryptData(invalidEncrypted);

    console.warn = originalConsoleWarn;
    assert.strictEqual(decrypted, invalidEncrypted);
  });

  it('should return string as is if it looks like legacy JSON array', async () => {
    const jsonString = '[{"id":1}]';
    const decrypted = await decryptData(jsonString);
    assert.strictEqual(decrypted, jsonString);
  });

  it('should return string as is if it looks like legacy JSON object', async () => {
    const jsonString = '{"key":"value"}';
    const decrypted = await decryptData(jsonString);
    assert.strictEqual(decrypted, jsonString);
  });

  it('should fall back to original string if encryption fails', async () => {
    // Mock crypto.subtle.encrypt to throw an error
    const mockCrypto = {
      ...originalCrypto,
      subtle: {
        ...originalCrypto.subtle,
        encrypt: async () => { throw new Error('Encryption failed mock error'); }
      }
    };

    Object.defineProperty(globalThis, 'crypto', {
        value: mockCrypto,
        writable: true,
        configurable: true
    });

    const data = "test-data";
    // Redirect console.error to avoid test output noise
    const originalConsoleError = console.error;
    console.error = () => {};

    const encrypted = await encryptData(data);

    // Restore console.error
    console.error = originalConsoleError;

    assert.strictEqual(encrypted, data);
  });
});
