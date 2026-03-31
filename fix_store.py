with open('lib/store.ts', 'r') as f:
    content = f.read()

content = content.replace("""    encryptData(JSON.stringify(newState)).then(encrypted => {
      localStorage.setItem(TIMER_KEY, encrypted);
    });""", """    encryptData(JSON.stringify(newState)).then(encrypted => {
      if (encrypted) {
        localStorage.setItem(TIMER_KEY, encrypted);
      }
    });""")

with open('lib/store.ts', 'w') as f:
    f.write(content)
