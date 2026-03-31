import re

with open('lib/crypto.test.ts', 'r') as f:
    content = f.read()

# Fix the variable name `originalConsoleError` in the 8th test
content = content.replace("    console.error = originalConsoleError;", "    console.error = originalConsoleError;")
content = content.replace("    const originalConsoleWarn = console.warn;\n    console.warn = () => {};", "    const originalConsoleError = console.error;\n    console.error = () => {};")
content = content.replace("    console.warn = originalConsoleWarn;\n\n    // Restore crypto\n", "    console.error = originalConsoleError;\n\n    // Restore crypto\n")

with open('lib/crypto.test.ts', 'w') as f:
    f.write(content)
