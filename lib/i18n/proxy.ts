import { Dictionary } from './types';
import { dictionaries } from './dictionaries';

function createI18nProxy(target: any, path: string = ''): any {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      const newPath = path ? `${path}.${String(prop)}` : String(prop);

      // If the value is undefined, it means the translation key is missing
      if (value === undefined) {
        // Log a warning in development so we know what's missing
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing translation for key: "${newPath}"`);
        }

        // Fallback to English dictionary to prevent the app from breaking or showing empty text
        const keys = newPath.split('.');
        let enValue: any = dictionaries.en;
        for (const k of keys) {
          if (enValue && typeof enValue === 'object') {
            enValue = enValue[k];
          } else {
            enValue = undefined;
            break;
          }
        }

        if (enValue !== undefined) {
            // We found the english fallback! If it's an object, wrap it too.
            if (typeof enValue === 'object' && enValue !== null) {
                return createI18nProxy(enValue, newPath);
            }
            return enValue;
        }

        // Ultimate fallback: Just return the key name itself so it's not totally blank
        return newPath;
      }

      // If the value is an object, recursively wrap it in a proxy
      if (typeof value === 'object' && value !== null) {
        return createI18nProxy(value, newPath);
      }

      return value;
    }
  });
}

export function getTranslationProxy(language: 'en' | 'es' | 'pt'): Dictionary {
  const dictionary = dictionaries[language] || dictionaries.en;
  return createI18nProxy(dictionary) as Dictionary;
}
