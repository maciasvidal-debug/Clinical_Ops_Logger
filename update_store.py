import re

with open('lib/store.ts', 'r') as f:
    content = f.read()

# Update decryptData in store.ts
# Original:
#      decryptData(stored).then(decrypted => {
#        try {
#          const parsed = JSON.parse(decrypted);

replacement = """      decryptData(stored).then(decrypted => {
        if (!decrypted) return;
        try {
          const parsed = JSON.parse(decrypted);"""

content = content.replace("""      decryptData(stored).then(decrypted => {
        try {
          const parsed = JSON.parse(decrypted);""", replacement)


# Wait, what if there's encryptData usage in store.ts?
# Let's check:
