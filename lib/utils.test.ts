import { describe, it, mock, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { cn, logError } from './utils';
import { supabase } from './supabase';

describe('utils: cn', () => {
  it('should merge basic tailwind classes correctly', () => {
    assert.strictEqual(cn('p-4', 'm-2'), 'p-4 m-2');
  });

  it('should resolve tailwind class conflicts using twMerge', () => {
    assert.strictEqual(cn('p-4', 'p-8'), 'p-8');
    assert.strictEqual(cn('text-red-500', 'text-blue-500'), 'text-blue-500');
  });

  it('should handle conditional classes using clsx', () => {
    assert.strictEqual(cn('p-4', true && 'm-2', false && 'text-red-500'), 'p-4 m-2');
    assert.strictEqual(cn('p-4', { 'm-2': true, 'text-red-500': false }), 'p-4 m-2');
  });

  it('should handle undefined, null, and empty inputs gracefully', () => {
    assert.strictEqual(cn('p-4', undefined, null, '', 'm-2'), 'p-4 m-2');
  });

  it('should handle array inputs correctly', () => {
    assert.strictEqual(cn(['p-4', 'm-2'], ['text-red-500', 'p-8']), 'm-2 text-red-500 p-8');
  });
});

describe('utils: logError', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it('should log an Error object correctly', async () => {
    let insertedData: any[] = [];
    const insertMock = mock.fn(async (data: Record<string, unknown>[]) => {
      insertedData = data;
      return { error: null };
    });

    // Typecast through unknown to bypass the complex typing of the Supabase JS client for mocking
    mock.method(supabase, 'from', (table: string) => {
      assert.strictEqual(table, 'system_errors');
      return {
        insert: insertMock,
      } as unknown as ReturnType<typeof supabase.from>;
    });

    const error = new Error('Test error message');
    await logError(error, 'test_context');

    // Due to the asynchronous non-awaited nature in logError, we need to wait briefly
    // for the microtask queue to process the promise chain
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(insertMock.mock.callCount(), 1);
    assert.ok(Array.isArray(insertedData));
    assert.strictEqual(insertedData.length, 1);

    const row = insertedData[0];
    assert.strictEqual(row.message, 'Test error message');
    assert.strictEqual(row.context, 'test_context');
    assert.strictEqual(row.user_id, null);
    assert.ok(typeof row.stack_trace === 'string');
    assert.ok(row.stack_trace.includes('Error: Test error message'));
  });

  it('should log a string error correctly', async () => {
    let insertedData: any[] = [];
    const insertMock = mock.fn(async (data: Record<string, unknown>[]) => {
      insertedData = data;
      return { error: null };
    });

    mock.method(supabase, 'from', (table: string) => {
      assert.strictEqual(table, 'system_errors');
      return {
        insert: insertMock,
      } as unknown as ReturnType<typeof supabase.from>;
    });

    await logError('Just a string error', 'string_context', 'user123');
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(insertMock.mock.callCount(), 1);

    const row = insertedData[0];
    assert.strictEqual(row.message, 'Just a string error');
    assert.strictEqual(row.context, 'string_context');
    assert.strictEqual(row.user_id, 'user123');
    assert.strictEqual(row.stack_trace, undefined);
  });

  it('should fail silently if supabase insert fails', async () => {
    const insertMock = mock.fn(async () => {
      return { error: new Error('Database error') };
    });

    mock.method(supabase, 'from', () => ({ insert: insertMock } as unknown as ReturnType<typeof supabase.from>));

    // This should not throw an exception
    await logError(new Error('Test'), 'silent_fail_context');
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(insertMock.mock.callCount(), 1);
  });

  it('should fail silently if supabase client itself throws', async () => {
    mock.method(supabase, 'from', () => {
      throw new Error('Supabase client crash');
    });

    // This should not throw an exception (caught by the outer try-catch in logError)
    await logError(new Error('Test'), 'crash_context');
    await new Promise(resolve => setTimeout(resolve, 0));

    // If it reached here without throwing, the test passes
    assert.ok(true);
  });
});
