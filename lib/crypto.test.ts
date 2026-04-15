import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { encryptData, decryptData, _resetKeyCache } from './crypto.ts';

describe('crypto', () => {
  const originalWindow = globalThis.window;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock window to bypass SSR safety check
    (globalThis as any).window = {};
    // Mock console.error to keep test output clean
    mock.method(console, 'error', () => {});
    _resetKeyCache();
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    mock.restoreAll();
    console.error = originalConsoleError;
  });

  it('encryptData returns null when encryption fails', async () => {
    // Mock crypto.subtle.encrypt to throw an error
    mock.method(crypto.subtle, 'encrypt', () => {
      throw new Error('Mocked encryption failure');
    });

    const result = await encryptData('test-data');
    assert.strictEqual(result, null);

    const consoleMock = console.error as any;
    // Find the encryption failure log, as there might be other logs (e.g. Node warnings)
    const encryptionErrorLog = consoleMock.mock.calls.find((call: any) =>
      call.arguments[0] === 'Encryption failed:'
    );
    assert.ok(encryptionErrorLog, 'Encryption failure should be logged');
    assert.strictEqual(encryptionErrorLog.arguments[1].message, 'Mocked encryption failure');
  });

  it('can encrypt and decrypt data successfully', async () => {
    const data = 'secret message';
    const encrypted = await encryptData(data);

    assert.ok(encrypted, 'Encryption should return a string');
    assert.notStrictEqual(encrypted, data, 'Encrypted data should not be the same as original data');

    const decrypted = await decryptData(encrypted!);
    assert.strictEqual(decrypted, data, 'Decrypted data should match original data');
  });

  it('decryptData returns null when decryption fails', async () => {
    // Encrypt some data first to get a valid-looking encrypted string
    const data = 'secret message';
    const encrypted = await encryptData(data);
    assert.ok(encrypted);

    // Mock crypto.subtle.decrypt to throw an error
    mock.method(crypto.subtle, 'decrypt', () => {
      throw new Error('Mocked decryption failure');
    });

    const result = await decryptData(encrypted!);
    assert.strictEqual(result, null);

    const consoleMock = console.error as any;
    // Note: It might have been called more than once if there are other errors,
    // but at least once for our mocked failure.
    assert.ok(consoleMock.mock.callCount() >= 1);

    // Find the decryption failure log
    const decryptionErrorLog = consoleMock.mock.calls.find((call: any) =>
      call.arguments[0] === 'Decryption failed:'
    );
    assert.ok(decryptionErrorLog);
    assert.strictEqual(decryptionErrorLog.arguments[1].message, 'Mocked decryption failure');
  });

  it('decryptData returns original string if it is legacy unencrypted JSON', async () => {
    const legacyData = '{"key": "value"}';
    const result = await decryptData(legacyData);
    assert.strictEqual(result, legacyData);

    const legacyArray = '[1, 2, 3]';
    const result2 = await decryptData(legacyArray);
    assert.strictEqual(result2, legacyArray);
  });
});
