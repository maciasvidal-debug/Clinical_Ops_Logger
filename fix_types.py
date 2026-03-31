import re

with open('lib/crypto.test.ts', 'r') as f:
    content = f.read()

content = content.replace("    const decrypted = await decryptData(encrypted);", "    const decrypted = await decryptData(encrypted as string);")
content = content.replace("    assert.ok(encrypted.length > data.length);", "    assert.ok(encrypted && encrypted.length > data.length);")
content = content.replace("    const decrypted1 = await decryptData(encrypted1);", "    const decrypted1 = await decryptData(encrypted1 as string);")
content = content.replace("    const decrypted2 = await decryptData(encrypted2);", "    const decrypted2 = await decryptData(encrypted2 as string);")

with open('lib/crypto.test.ts', 'w') as f:
    f.write(content)
