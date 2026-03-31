import re

with open('lib/store.ts', 'r') as f:
    content = f.read()

content = content.replace("""      decryptData(stored).then(decrypted => {
        try {
          const parsed = JSON.parse(decrypted);
          setActiveTimer(parsed);
        } catch (e) {""", """      decryptData(stored).then(decrypted => {
        if (!decrypted) return;
        try {
          const parsed = JSON.parse(decrypted);
          setActiveTimer(parsed);
        } catch (e) {""")

with open('lib/store.ts', 'w') as f:
    f.write(content)
