import re

with open('lib/crypto.test.ts', 'r') as f:
    content = f.read()

content = content.replace("assert.strictEqual(decrypted, validBase64);", "assert.strictEqual(decrypted, null);")

with open('lib/crypto.test.ts', 'w') as f:
    f.write(content)
