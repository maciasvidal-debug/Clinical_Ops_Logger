import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { logError } from './utils.ts';

describe('logError', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    mock.method(console, 'error', mock.fn());
  });

  afterEach(() => {
    mock.restoreAll();
    console.error = originalConsoleError;
  });

  it('logs an Error object correctly', async () => {
    const error = new Error('Test error');
    error.stack = 'Test stack';
    const context = 'Test context';
    const userId = 'user-123';

    await logError(error, context, userId);

    const consoleMock = console.error as any;
    assert.strictEqual(consoleMock.mock.callCount(), 1);

    const call = consoleMock.mock.calls[0];
    assert.strictEqual(call.arguments[0], 'App Error:');
    assert.deepStrictEqual(call.arguments[1], {
      errorMessage: 'Test error',
      stackTrace: 'Test stack',
      context: 'Test context',
      userId: 'user-123'
    });
  });

  it('logs a string error correctly', async () => {
    const error = 'Simple string error';
    const context = 'String context';

    await logError(error, context);

    const consoleMock = console.error as any;
    assert.strictEqual(consoleMock.mock.callCount(), 1);

    const call = consoleMock.mock.calls[0];
    assert.strictEqual(call.arguments[0], 'App Error:');
    assert.deepStrictEqual(call.arguments[1], {
      errorMessage: 'Simple string error',
      stackTrace: undefined,
      context: 'String context',
      userId: undefined
    });
  });

  it('handles null error', async () => {
    const error = null;
    const context = 'Null context';

    await logError(error, context);

    const consoleMock = console.error as any;
    assert.strictEqual(consoleMock.mock.callCount(), 1);

    const call = consoleMock.mock.calls[0];
    assert.strictEqual(call.arguments[0], 'App Error:');
    assert.deepStrictEqual(call.arguments[1], {
      errorMessage: 'null',
      stackTrace: undefined,
      context: 'Null context',
      userId: undefined
    });
  });

  it('silently catches internal errors (e.g., if console.error throws)', async () => {
    // Force console.error to throw
    mock.method(console, 'error', mock.fn(() => {
      throw new Error('Console failure');
    }));

    // Should not throw
    await assert.doesNotReject(async () => {
      await logError(new Error('Test'), 'Context');
    });
  });
});
