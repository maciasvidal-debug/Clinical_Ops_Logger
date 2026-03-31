import re

with open('lib/actions_config.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'assert.deepStrictEqual(mockInsert.mock.calls[0].arguments[0], [{ name: "New Category", is_active: true }]);',
    'assert.deepStrictEqual((mockInsert.mock.calls[0] as any).arguments[0], [{ name: "New Category", is_active: true }]);'
)

with open('lib/actions_config.test.ts', 'w') as f:
    f.write(content)
