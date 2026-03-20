with open('components/layout/Shell.tsx', 'r') as f:
    content = f.read()
content = content.replace('const mobileMoreMenuNode = (', 'const mobileMoreMenuNode = (\n')
with open('components/layout/Shell.tsx', 'w') as f:
    f.write(content)
