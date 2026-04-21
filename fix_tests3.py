import re

with open('lib/crypto.test.ts', 'r') as f:
    content = f.read()

# Fix the variable name `originalConsoleError` in the 8th test
content = content.replace("    console.warn = originalConsoleError;", "    console.warn = originalConsoleWarn;")
content = content.replace("    const originalConsoleError = console.warn;\n    console.warn = () => {};", "    const originalConsoleWarn = console.warn;\n    console.warn = () => {};")
content = content.replace("    console.warn = originalConsoleError;\n\n    // Restore crypto\n", "    console.warn = originalConsoleWarn;\n\n    // Restore crypto\n")

with open('lib/crypto.test.ts', 'w') as f:
    f.write(content)
