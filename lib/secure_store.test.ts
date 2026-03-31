import { describe, it, beforeEach, afterEach, mock } from "node:test";
import * as assert from "node:assert";
import { setSecureItem, getSecureItem, removeSecureItem } from "./secure_store";

// Mock global objects
beforeEach(() => {
  (globalThis as any).window = {};

  // Mock localStorage
  (globalThis as any).localStorage = {
    getItem: mock.fn(),
    setItem: mock.fn(),
    removeItem: mock.fn()
  };

  // Mock IndexedDB
  (globalThis as any).indexedDB = {
    open: mock.fn(() => {
      const request: any = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: {
          objectStoreNames: { contains: () => true },
          transaction: mock.fn(() => ({
            objectStore: mock.fn(() => ({
              put: mock.fn(() => {
                const req: any = { onsuccess: null, onerror: null };
                setTimeout(() => req.onsuccess && req.onsuccess(), 0);
                return req;
              }),
              get: mock.fn(() => {
                // Return a valid base64 string that atob can handle
                const req: any = { onsuccess: null, onerror: null, result: Buffer.from('mock-encrypted-data').toString('base64') };
                setTimeout(() => req.onsuccess && req.onsuccess(), 0);
                return req;
              }),
              delete: mock.fn(() => {
                const req: any = { onsuccess: null, onerror: null };
                setTimeout(() => req.onsuccess && req.onsuccess(), 0);
                return req;
              })
            }))
          }))
        }
      };
      setTimeout(() => request.onsuccess && request.onsuccess(), 0);
      return request;
    })
  };

  // Stubbing web crypto methods using Object.defineProperty to bypass readonly crypto object
  const subtleMock = {
    generateKey: async () => ({ type: 'secret', extractable: false, algorithm: { name: 'AES-GCM' }, usages: ['encrypt', 'decrypt'] }),
    importKey: async () => ({}),
    encrypt: async () => new Uint8Array([1, 2, 3]).buffer,
    decrypt: async () => new TextEncoder().encode("decrypted-data").buffer
  };

  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => arr,
      subtle: subtleMock
    },
    configurable: true // Allows deleting it later
  });

  // Mock Base64 globals as well since Node 22 environment might handle them differently
  (globalThis as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
  (globalThis as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
});

afterEach(() => {
  mock.restoreAll();
  delete (globalThis as any).window;
  delete (globalThis as any).localStorage;
  delete (globalThis as any).indexedDB;
  delete (globalThis as any).crypto;
  delete (globalThis as any).btoa;
  delete (globalThis as any).atob;
});

describe("secure_store", () => {
  it("should encrypt and store data in IndexedDB", async () => {
    await setSecureItem("test-key", "test-value");

    assert.strictEqual(((globalThis as any).localStorage.setItem as ReturnType<typeof mock.fn>).mock.calls.length, 0);
  });

  it("should retrieve and decrypt data from IndexedDB", async () => {
    const result = await getSecureItem("test-key");

    assert.strictEqual(result, "decrypted-data");
    assert.strictEqual(((globalThis as any).localStorage.getItem as ReturnType<typeof mock.fn>).mock.calls.length, 0);
  });

  it("should migrate legacy data from localStorage", async () => {
    // Modify the mock to simulate IndexedDB returning nothing, but localStorage having data
    (globalThis as any).indexedDB.open = mock.fn(() => {
      const request: any = {
        onsuccess: null,
        result: {
          objectStoreNames: { contains: () => true },
          transaction: mock.fn(() => ({
            objectStore: mock.fn(() => ({
              get: mock.fn(() => {
                const req: any = { onsuccess: null, result: null }; // IndexedDB is empty
                setTimeout(() => req.onsuccess && req.onsuccess(), 0);
                return req;
              }),
              put: mock.fn(() => {
                 const req: any = { onsuccess: null };
                 setTimeout(() => req.onsuccess && req.onsuccess(), 0);
                 return req;
              })
            }))
          }))
        }
      };
      setTimeout(() => request.onsuccess && request.onsuccess(), 0);
      return request;
    });

    (globalThis as any).localStorage.getItem = mock.fn(() => Buffer.from('legacy-encrypted-data').toString('base64'));

    const result = await getSecureItem("test-key");

    assert.strictEqual(result, "decrypted-data");

    // It should have read from localStorage
    assert.strictEqual(((globalThis as any).localStorage.getItem as ReturnType<typeof mock.fn>).mock.calls.length, 1);

    // It should have removed it from localStorage
    assert.strictEqual(((globalThis as any).localStorage.removeItem as ReturnType<typeof mock.fn>).mock.calls.length, 1);
    assert.strictEqual(((globalThis as any).localStorage.removeItem as ReturnType<typeof mock.fn>).mock.calls[0].arguments[0], "test-key");
  });

  it("should remove data from IndexedDB and localStorage", async () => {
    await removeSecureItem("test-key");
    assert.strictEqual(((globalThis as any).localStorage.removeItem as ReturnType<typeof mock.fn>).mock.calls.length, 1);
    assert.strictEqual(((globalThis as any).localStorage.removeItem as ReturnType<typeof mock.fn>).mock.calls[0].arguments[0], "test-key");
  });
});
