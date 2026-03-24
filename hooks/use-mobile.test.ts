import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import * as React from 'react';

// Use a factory function to create a fresh mock for each test
const createMockMql = () => ({
  addEventListener: mock.fn(),
  removeEventListener: mock.fn(),
});

// Mock window before importing the hook
(globalThis as any).window = {
  innerWidth: 1024,
  matchMedia: mock.fn(),
};

import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  const originalWindow = (globalThis as any).window;
  let currentMockMql: ReturnType<typeof createMockMql>;

  beforeEach(() => {
    mock.restoreAll();
    currentMockMql = createMockMql();
    (globalThis as any).window = {
      innerWidth: 1024,
      matchMedia: mock.fn(() => currentMockMql),
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it('should return false initially (undefined coerced to false)', () => {
    // Mock useState and useEffect to prevent them from actually running React logic
    mock.method(React, 'useState', () => [undefined, mock.fn()]);
    mock.method(React, 'useEffect', () => {});

    const result = useIsMobile();
    assert.strictEqual(result, false);
  });

  it('should initialize and set up event listener in useEffect', () => {
    const setState = mock.fn();
    let effectCallback: (() => void | (() => void)) | undefined;

    mock.method(React, 'useState', () => [undefined, setState]);
    mock.method(React, 'useEffect', (cb: any) => {
      effectCallback = cb;
    });

    useIsMobile();

    assert.ok(effectCallback, 'useEffect should have been called with a callback');

    // Simulate mounting
    effectCallback!();

    // Should check innerWidth immediately
    assert.strictEqual(setState.mock.callCount(), 1);
    // 1024 < 768 is false
    assert.strictEqual(setState.mock.calls[0].arguments[0], false);

    // Should add event listener
    assert.strictEqual(currentMockMql.addEventListener.mock.callCount(), 1);
    assert.strictEqual(currentMockMql.addEventListener.mock.calls[0].arguments[0], 'change');
  });

  it('should update state when window is resized to mobile', () => {
    const setState = mock.fn();
    let effectCallback: (() => void | (() => void)) | undefined;

    mock.method(React, 'useState', () => [undefined, setState]);
    mock.method(React, 'useEffect', (cb: any) => {
      effectCallback = cb;
    });

    useIsMobile();
    effectCallback!();

    const onChange = currentMockMql.addEventListener.mock.calls[0].arguments[1];

    // Simulate resize to mobile
    (globalThis as any).window.innerWidth = 500;
    onChange();

    // Second call to setState (first was in effect initialization)
    assert.strictEqual(setState.mock.callCount(), 2);
    assert.strictEqual(setState.mock.calls[1].arguments[0], true);
  });

  it('should clean up event listener on unmount', () => {
    let effectCallback: (() => void | (() => void)) | undefined;

    mock.method(React, 'useEffect', (cb: any) => {
      effectCallback = cb;
    });

    useIsMobile();
    const cleanup = effectCallback!();

    assert.ok(typeof cleanup === 'function', 'useEffect should return a cleanup function');

    (cleanup as () => void)();

    assert.strictEqual(currentMockMql.removeEventListener.mock.callCount(), 1);
    assert.strictEqual(currentMockMql.removeEventListener.mock.calls[0].arguments[0], 'change');
  });
});
