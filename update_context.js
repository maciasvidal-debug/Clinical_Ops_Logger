const fs = require('fs');

let content = fs.readFileSync('lib/i18n/context.tsx', 'utf8');

// Import the proxy
if (!content.includes('getTranslationProxy')) {
  content = content.replace(
    "import { dictionaries } from './dictionaries';",
    "import { dictionaries } from './dictionaries';\nimport { getTranslationProxy } from './proxy';"
  );
}

// Update the t variable
content = content.replace(
  "const t = dictionaries[language];",
  "const t = getTranslationProxy(language);"
);

// Update default t value in context
content = content.replace(
  "t: dictionaries[defaultLanguage],",
  "t: getTranslationProxy(defaultLanguage),"
);

fs.writeFileSync('lib/i18n/context.tsx', content);
