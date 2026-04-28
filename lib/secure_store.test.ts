import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { getSecureItem, setSecureItem, removeSecureItem } from './secure_store.ts';
import { encryptData, decryptData, _resetKeyCache } from './crypto.ts';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get store() { return store; }
  };
})();

// Mock IndexedDB (minimal)
const indexedDBMock = (() => {
  let store: Record<string, string> = {};
  return {
    _store: store,
    _clear: () => { store = {}; }
  };
})();

function mockIDB(getValue: any, key: string) {
  return {
    open: (name: string) => {
      const req: any = {
        onsuccess: null,
        onerror: null,
        result: {
          transaction: () => ({
            objectStore: () => ({
              get: () => {
                const getReq: any = { onsuccess: null };
                setTimeout(() => {
                    // For AppCryptoDB, always return null to force key generation
                    // For AppSecureStoreDB, return getValue
                    const result = name === "AppCryptoDB" ? null : getValue;
                    if (getReq.onsuccess) getReq.onsuccess({ target: { result } });
                }, 1);
                return getReq;
              },
              put: (val: string) => {
                  if (name !== "AppCryptoDB") {
                    indexedDBMock._store[key] = val;
                  }
                  const putReq: any = { onsuccess: null };
                  setTimeout(() => {
                      if (putReq.onsuccess) putReq.onsuccess({ target: putReq });
                  }, 1);
                  return putReq;
              }
            })
          })
        }
      };
      setTimeout(() => req.onsuccess && req.onsuccess({ target: req }), 1);
      return req;
    }
  };
}

describe('secure_store migration', () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;
  const originalIndexedDB = globalThis.indexedDB;

  beforeEach(() => {
    (globalThis as any).window = {};
    (globalThis as any).localStorage = localStorageMock;
    (globalThis as any).indexedDB = undefined;
    localStorageMock.clear();
    indexedDBMock._clear();
    _resetKeyCache();
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalLocalStorage;
    (globalThis as any).indexedDB = originalIndexedDB;
    mock.restoreAll();
  });

  it('migrates unencrypted JSON from localStorage and encrypts it', async () => {
    const key = 'test-key';
    const rawValue = '{"user": "jules", "role": "admin"}';
    localStorageMock.setItem(key, rawValue);

    // Mock IndexedDB to allow successful put and migration
    (globalThis as any).indexedDB = mockIDB(null, key);

    const result = await getSecureItem(key);

    assert.strictEqual(result, rawValue, 'Should return the original value');
    assert.strictEqual(localStorageMock.getItem(key), null, 'Should remove from localStorage');

    // Verify it was encrypted in IDB
    const storedInIdb = indexedDBMock._store[key];
    assert.ok(storedInIdb);
    assert.notStrictEqual(storedInIdb, rawValue);
  });

  it('migrates already encrypted data from localStorage without double encrypting', async () => {
    const key = 'test-key';
    const rawValue = 'secret';
    const encryptedValue = await encryptData(rawValue);
    assert.ok(encryptedValue);

    localStorageMock.setItem(key, encryptedValue!);

    // Mock IndexedDB to allow successful put and migration
    (globalThis as any).indexedDB = mockIDB(null, key);

    const result = await getSecureItem(key);

    assert.strictEqual(result, rawValue, 'Should return the decrypted value');
    assert.strictEqual(localStorageMock.getItem(key), null, 'Should remove from localStorage');

    // Verify it was stored in IDB (should be the same encrypted value)
    assert.strictEqual(indexedDBMock._store[key], encryptedValue);
  });

  it('handles non-JSON strings that happen to be unencrypted but don\'t start with { or [', async () => {
    const key = 'test-key';
    const rawValue = 'not-json';
    localStorageMock.setItem(key, rawValue);

    const result = await getSecureItem(key);

    // It will attempt to decrypt 'not-json' as base64, which will likely fail
    assert.strictEqual(result, null);
    // In our test, IDB is undefined so it won't remove from localStorage
    assert.strictEqual(localStorageMock.getItem(key), rawValue);
  });

  it('detects and encrypts unencrypted JSON already in IndexedDB', async () => {
    const key = 'test-key';
    const rawValue = '{"already": "in-idb"}';

    // Mock IndexedDB behavior for this test
    (globalThis as any).indexedDB = mockIDB(rawValue, key);

    const result = await getSecureItem(key);

    assert.strictEqual(result, rawValue);

    // Verify it was encrypted in IDB (this happens in background, but our mock is fast)
    // We add a small delay to be safe
    await new Promise(resolve => setTimeout(resolve, 10));
    const storedInIdb = indexedDBMock._store[key];
    assert.ok(storedInIdb, 'Should have stored something in IDB');
    assert.notStrictEqual(storedInIdb, rawValue, 'Should have encrypted the value in IDB');
  });
});
