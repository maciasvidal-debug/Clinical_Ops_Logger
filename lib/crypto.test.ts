import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import * as assert from 'node:assert';
import { encryptData, decryptData, _resetKeyCache } from './crypto';

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
    (globalThis as any).indexedDB = undefined;
    mock.restoreAll();

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
    assert.ok(encrypted && encrypted.length > data.length);

    const decrypted = await decryptData(encrypted as string);
    assert.strictEqual(decrypted, data);
  });

  it('should reuse the same key for multiple encryptions', async () => {
    const data1 = "first message";
    const data2 = "second message";

    const encrypted1 = await encryptData(data1);
    const encrypted2 = await encryptData(data2);

    assert.notStrictEqual(encrypted1, data1);
    assert.notStrictEqual(encrypted2, data2);

    const decrypted1 = await decryptData(encrypted1 as string);
    const decrypted2 = await decryptData(encrypted2 as string);

    assert.strictEqual(decrypted1, data1);
    assert.strictEqual(decrypted2, data2);
  });

  it('should return null if decryption fails', async () => {
    const invalidEncrypted = "not-a-valid-base64-or-encrypted-string";
    // Suppress console.error for the test
    const originalConsoleError = console.error;
    console.error = () => {};

    const decrypted = await decryptData(invalidEncrypted);

    console.error = originalConsoleError;
    assert.strictEqual(decrypted, null);
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

  it('should return null if encryption fails', async () => {
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

    assert.strictEqual(encrypted, null);
  });

  it('should return null if decryption fails when mocked', async () => {
    // Mock crypto.subtle.decrypt to throw an error
    const mockCrypto = {
      ...originalCrypto,
      subtle: {
        ...originalCrypto.subtle,
        decrypt: async () => { throw new Error('Decryption failed mock error'); }
      }
    };

    Object.defineProperty(globalThis, 'crypto', {
        value: mockCrypto,
        writable: true,
        configurable: true
    });

    const validBase64 = "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=";

    // Redirect console.warn to avoid test output noise
    const originalConsoleError = console.error;
    console.error = () => {};

    const decrypted = await decryptData(validBase64);

    // Restore console.warn
    console.error = originalConsoleError;

    // Restore crypto
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true
    });

    assert.strictEqual(decrypted, null);
  });
  it('should return null if btoa throws an error during encryptData', async () => {
    // Mock btoa to throw an error
    const originalBtoa = globalThis.btoa;
    globalThis.btoa = () => { throw new Error('btoa failed mock error'); };

    const data = "test-data";
    // Redirect console.error to avoid test output noise
    const originalConsoleError = console.error;
    console.error = () => {};

    const encrypted = await encryptData(data);

    // Restore
    console.error = originalConsoleError;
    globalThis.btoa = originalBtoa;

    assert.strictEqual(encrypted, null);
  });

  it('should return null if crypto.getRandomValues throws an error during encryptData', async () => {
    // Mock crypto.getRandomValues to throw an error
    const mockCrypto = {
      ...originalCrypto,
      subtle: {
        ...originalCrypto.subtle,
      },
      getRandomValues: () => { throw new Error('getRandomValues failed mock error'); }
    };

    Object.defineProperty(globalThis, 'crypto', {
        value: mockCrypto,
        writable: true,
        configurable: true
    });

    const data = "test-data-random-fail";
    // Redirect console.error to avoid test output noise
    const originalConsoleError = console.error;
    console.error = () => {};

    const encrypted = await encryptData(data);

    // Restore
    console.error = originalConsoleError;
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true
    });

    assert.strictEqual(encrypted, null);
  });

  it('should generate a key with extractable set to false', async () => {
    _resetKeyCache();

    // Ensure no IndexedDB and no localStorage key to force generation
    (globalThis as any).indexedDB = undefined;
    (globalThis as any).localStorage.removeItem('app_encryption_key');

    const generateKeyMock = mock.method(globalThis.crypto.subtle, 'generateKey');

    await encryptData("test");

    assert.strictEqual(generateKeyMock.mock.calls.length, 1);
    const [algorithm, extractable, keyUsages] = generateKeyMock.mock.calls[0].arguments;

    assert.deepStrictEqual(algorithm, { name: "AES-GCM", length: 256 });
    assert.strictEqual(extractable, false, "Security Fix: Key must NOT be extractable");
    assert.deepStrictEqual(keyUsages, ["encrypt", "decrypt"]);
  });

  it('should import a legacy key with extractable set to false', async () => {
    _resetKeyCache();

    // Mock legacy key in localStorage
    const rawKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    (globalThis as any).localStorage.setItem('app_encryption_key', JSON.stringify(Array.from(rawKey)));
    (globalThis as any).indexedDB = undefined;

    const importKeyMock = mock.method(globalThis.crypto.subtle, 'importKey');

    await encryptData("test");

    assert.strictEqual(importKeyMock.mock.calls.length, 1);
    const [format, keyData, algorithm, extractable, keyUsages] = importKeyMock.mock.calls[0].arguments;

    assert.strictEqual(format, "raw");
    assert.deepStrictEqual(algorithm, { name: "AES-GCM" });
    assert.strictEqual(extractable, false, "Security Fix: Imported key must NOT be extractable");
    assert.deepStrictEqual(keyUsages, ["encrypt", "decrypt"]);
  });
});
