import { test, mock } from "node:test";
import assert from "node:assert";

// We need to mock 'idb' before importing local_db
// But local_db imports openDB from 'idb'
// Since we are in a Node environment, we can use mock.module if supported,
// or just mock the functions after import if they are exported,
// but openDB is used internally in getDb which is not exported.

// However, we can use the fact that we can mock the entire module if we use a loader or if we mock it before.
// In this environment, I'll try to mock it globally or use a proxy.

// Actually, I'll just write a standalone test that simulates what local_db does
// and what the optimized version will do, to establish the baseline of "calls to openDB" and "transactions".

test("Baseline: N+1 calls to localSaveLog", async (t) => {
  let openDbCalls = 0;
  let putCalls = 0;

  const mockDb = {
    put: async () => {
      putCalls++;
      return Promise.resolve();
    }
  };

  const getDb = async () => {
    openDbCalls++;
    return mockDb;
  };

  const localSaveLog = async (log: any) => {
    const db = await getDb();
    await db.put('logs', log);
  };

  const data = {
    logs: Array.from({ length: 100 }, (_, i) => ({ id: i.toString(), notes: "test" }))
  };

  // Simulate current behavior
  const start = performance.now();
  if (data.logs) {
    for (const item of data.logs) {
      await localSaveLog(item);
    }
  }
  const end = performance.now();

  console.log(`Baseline - Logs: ${data.logs.length}`);
  console.log(`Baseline - getDb calls: ${openDbCalls}`);
  console.log(`Baseline - put calls: ${putCalls}`);

  assert.strictEqual(openDbCalls, 100);
  assert.strictEqual(putCalls, 100);
});

test("Optimized: Batch call to localSaveLogs (Simulated)", async (t) => {
    let openDbCalls = 0;
    let putCalls = 0;
    let transactionCalls = 0;

    const mockStore = {
      put: async () => {
        putCalls++;
        return Promise.resolve();
      }
    };

    const mockTx = {
      store: mockStore,
      done: Promise.resolve()
    };

    const mockDb = {
      transaction: (storeName: string, mode: string) => {
        transactionCalls++;
        return mockTx;
      }
    };

    const getDb = async () => {
      openDbCalls++;
      return mockDb;
    };

    const localSaveLogs = async (logs: any[]) => {
      const db = await getDb();
      const tx = db.transaction('logs', 'readwrite');
      for (const item of logs) {
        await tx.store.put(item);
      }
      await tx.done;
    };

    const data = {
      logs: Array.from({ length: 100 }, (_, i) => ({ id: i.toString(), notes: "test" }))
    };

    // Simulate optimized behavior
    const start = performance.now();
    if (data.logs) {
      await localSaveLogs(data.logs);
    }
    const end = performance.now();

    console.log(`Optimized - Logs: ${data.logs.length}`);
    console.log(`Optimized - getDb calls: ${openDbCalls}`);
    console.log(`Optimized - transaction calls: ${transactionCalls}`);
    console.log(`Optimized - put calls: ${putCalls}`);

    assert.strictEqual(openDbCalls, 1);
    assert.strictEqual(transactionCalls, 1);
    assert.strictEqual(putCalls, 100);
  });
