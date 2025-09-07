import { en } from './en';
import { id } from './id';

export const translations = {
  en,
  id,
};

export type Locale = keyof typeof translations;
export type TranslationKeys = typeof en;

export { en, id };