import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { cn } from './utils'; // extensionless import works with tsx loader

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
