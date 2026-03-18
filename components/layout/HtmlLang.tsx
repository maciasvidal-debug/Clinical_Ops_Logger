"use client";
import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';

export function HtmlLang() {
  const { language } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
