import { useState, useEffect } from 'react';
import { translations, type Locale, type TranslationKeys } from '../translations';

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('en');
  
  useEffect(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'id')) {
      setLocale(savedLocale);
    }
  }, []);
  
  const t = translations[locale] as TranslationKeys;
  
  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    // Reload the page to ensure all components re-render with new language
    window.location.reload();
  };
  
  return {
    t,
    locale,
    changeLanguage,
  };
}

export type UseTranslationReturn = ReturnType<typeof useTranslation>;