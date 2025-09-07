"use client";

import { useState } from 'react';
import { useTranslation } from '@/lib/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';
import { type Locale } from '@/lib/translations';

const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  id: { name: 'Bahasa Indonesia', flag: '🇮🇩' },
};

export default function LanguageSelector() {
  const { locale, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages[locale];

  const handleLanguageChange = (newLocale: Locale) => {
    changeLanguage(newLocale);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(languages).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Locale)}
            className={`flex items-center gap-2 cursor-pointer ${
              locale === code ? 'bg-purple-50 text-purple-600' : ''
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {locale === code && (
              <span className="ml-auto text-purple-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}