"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language } from './types';
import { dictionaries } from './dictionaries';
import { getTranslationProxy } from './proxy';
import { encryptData, decryptData } from '../crypto';

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionaries.en;
}

const defaultLanguage: Language = 'en';
const LANGUAGE_KEY = 'siteflow_language_pref';

const I18nContext = createContext<I18nContextProps>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: getTranslationProxy(defaultLanguage),
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load language from encrypted localStorage
    const loadLanguage = async () => {
      try {
        const stored = localStorage.getItem(LANGUAGE_KEY);
        if (stored) {
          const decrypted = await decryptData(stored);
          if (decrypted && (decrypted === 'en' || decrypted === 'es' || decrypted === 'pt')) {
            setLanguageState(decrypted as Language);
          }
        } else {
          // Detect browser language if no preference is set
          const browserLang = navigator.language.split('-')[0];
          if (browserLang === 'es') setLanguageState('es');
          else if (browserLang === 'pt') setLanguageState('pt');
          else setLanguageState('en');
        }
      } catch (error) {
        console.error('Failed to load language preference', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      const encrypted = await encryptData(lang);
      if (encrypted) {
        localStorage.setItem(LANGUAGE_KEY, encrypted);
      }
    } catch (error) {
      console.error('Failed to save language preference', error);
    }
  }, []);

  const t = getTranslationProxy(language);

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
