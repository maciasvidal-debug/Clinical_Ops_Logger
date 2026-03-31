import re

with open('lib/crypto.test.ts', 'r') as f:
    content = f.read()

# I need to do the same for the other three but maybe they didn't match perfectly. Let's see.

# 1. should fallback to returning encrypted string if decryption fails (legacy support)
content = content.replace("should fallback to returning encrypted string if decryption fails (legacy support)", "should return null if decryption fails")
content = content.replace(
    """    // Suppress console.warn for the test
    const originalConsoleWarn = console.warn;
    console.warn = () => {};

    const decrypted = await decryptData(invalidEncrypted);

    console.warn = originalConsoleWarn;
    assert.strictEqual(decrypted, invalidEncrypted);""",
    """    // Suppress console.error for the test
    const originalConsoleError = console.error;
    console.error = () => {};

    const decrypted = await decryptData(invalidEncrypted);

    console.error = originalConsoleError;
    assert.strictEqual(decrypted, null);"""
)

# 2. should fall back to original string if encryption fails
content = content.replace("should fall back to original string if encryption fails", "should return null if encryption fails")
content = content.replace(
    """    const data = "test-data";
    // Redirect console.error to avoid test output noise
    const originalConsoleError = console.error;
    console.error = () => {};

    const encrypted = await encryptData(data);

    // Restore console.error
    console.error = originalConsoleError;

    assert.strictEqual(encrypted, data);""",
    """    const data = "test-data";
    // Redirect console.error to avoid test output noise
    const originalConsoleError = console.error;
    console.error = () => {};

    const encrypted = await encryptData(data);

    // Restore console.error
    console.error = originalConsoleError;

    assert.strictEqual(encrypted, null);"""
)

# 3. should fall back to original string if decryption fails
content = content.replace("should fall back to original string if decryption fails", "should return null if decryption fails when mocked")
content = content.replace(
    """    const validBase64 = "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=";

    // Redirect console.warn to avoid test output noise
    const originalConsoleWarn = console.warn;
    console.warn = () => {};

    const decrypted = await decryptData(validBase64);

    // Restore console.warn
    console.warn = originalConsoleWarn;

    // Restore crypto
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true
    });

    assert.strictEqual(decrypted, validBase64);""",
    """    const validBase64 = "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=";

    // Redirect console.error to avoid test output noise
    const originalConsoleError = console.error;
    console.error = () => {};

    const decrypted = await decryptData(validBase64);

    // Restore console.error
    console.error = originalConsoleError;

    // Restore crypto
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true
    });

    assert.strictEqual(decrypted, null);"""
)

with open('lib/crypto.test.ts', 'w') as f:
    f.write(content)
