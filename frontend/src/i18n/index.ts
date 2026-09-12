import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import as from './locales/as.json';
import ne from './locales/ne.json';
import kha from './locales/kha.json';
import miz from './locales/miz.json';

export interface LanguageOption {
  code: string;
  nativeName: string;
  englishName: string;
  shortLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', shortLabel: 'EN' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', shortLabel: 'HI' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', shortLabel: 'AS' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', shortLabel: 'NE' },
  { code: 'kha', nativeName: 'खासी', englishName: 'Khasi', shortLabel: 'Kh' },
  { code: 'miz', nativeName: 'Mizo', englishName: 'Mizo', shortLabel: 'Mz' },
];

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  as: { translation: as },
  ne: { translation: ne },
  kha: { translation: kha },
  miz: { translation: miz },
};

// Map full backend database names (e.g., "Hindi", "Assamese", "English", "অসমীয়া", "हिन्दी") to code
export function normalizeLanguageCode(langOrCode?: string | null): string {
  if (!langOrCode) return 'en';
  const lower = langOrCode.toLowerCase().trim();
  if (lower === 'hi' || lower === 'hindi' || lower === 'हिन्दी') return 'hi';
  if (lower === 'as' || lower === 'assamese' || lower === 'অসমীয়া') return 'as';
  if (lower === 'ne' || lower === 'nepali' || lower === 'नेपाली') return 'ne';
  if (lower === 'kha' || lower === 'khasi' || lower === 'खासी') return 'kha';
  if (lower === 'miz' || lower === 'lus' || lower === 'mizo') return 'miz';
  if (lower === 'en' || lower === 'english') return 'en';
  return 'en';
}

// Map code back to database preferredLanguage name
export function languageCodeToName(code: string): string {
  switch (code) {
    case 'hi': return 'Hindi';
    case 'as': return 'Assamese';
    case 'ne': return 'Nepali';
    case 'kha': return 'Khasi';
    case 'miz': return 'Mizo';
    case 'en':
    default: return 'English';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
