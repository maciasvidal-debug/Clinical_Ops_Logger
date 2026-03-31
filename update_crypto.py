import re

with open('lib/crypto.ts', 'r') as f:
    content = f.read()

# Update encryptData
content = re.sub(
    r'export async function encryptData\(data: string\): Promise<string> {',
    r'export async function encryptData(data: string): Promise<string | null> {',
    content
)
content = re.sub(
    r'console\.error\("Encryption failed:", error\);\n    return data; // Fallback in case of failure',
    r'console.error("Encryption failed:", error);\n    return null; // Security Fix: Do not return unencrypted data on failure',
    content
)

# Update decryptData
content = re.sub(
    r'export async function decryptData\(encryptedString: string\): Promise<string> {',
    r'export async function decryptData(encryptedString: string): Promise<string | null> {',
    content
)
content = re.sub(
    r'console\.warn\("Decryption failed, assuming legacy unencrypted data:", error\);\n    return encryptedString; // Fallback to raw string \(legacy compatibility\)',
    r'console.error("Decryption failed:", error);\n    return null; // Security Fix: Do not return raw string on failure',
    content
)

with open('lib/crypto.ts', 'w') as f:
    f.write(content)
