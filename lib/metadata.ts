import { translations, type Locale } from './translations';

export function generateMetadata(locale: Locale = 'en') {
  const t = translations[locale];
  
  return {
    title: t.metadata.title,
    description: t.metadata.description,
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: t.metadata.openGraph.title,
      description: t.metadata.openGraph.description,
      url: "https://saturasa.id",
      siteName: "saturasa",
    },
  };
}

export function getLocaleFromStorage(): Locale {
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'id')) {
      return savedLocale;
    }
  }
  return 'en';
}