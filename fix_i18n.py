with open('lib/i18n/context.tsx', 'r') as f:
    content = f.read()

# Update decryptData in context.tsx
old_decrypt = """        if (stored) {
          const decrypted = await decryptData(stored);
          if (decrypted === 'en' || decrypted === 'es' || decrypted === 'pt') {"""
new_decrypt = """        if (stored) {
          const decrypted = await decryptData(stored);
          if (decrypted && (decrypted === 'en' || decrypted === 'es' || decrypted === 'pt')) {"""

content = content.replace(old_decrypt, new_decrypt)

# Update encryptData in context.tsx
old_encrypt = """    try {
      const encrypted = await encryptData(lang);
      localStorage.setItem(LANGUAGE_KEY, encrypted);
    } catch (error) {"""
new_encrypt = """    try {
      const encrypted = await encryptData(lang);
      if (encrypted) {
        localStorage.setItem(LANGUAGE_KEY, encrypted);
      }
    } catch (error) {"""

content = content.replace(old_encrypt, new_encrypt)

with open('lib/i18n/context.tsx', 'w') as f:
    f.write(content)
