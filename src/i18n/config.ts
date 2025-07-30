import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enHero from './locales/en/hero.json';
import enNavigation from './locales/en/navigation.json';
import enDashboard from './locales/en/dashboard.json';
import enCountries from './locales/en/countries.json';
import enLanguages from './locales/en/languages.json';
import enErrors from './locales/en/errors.json';

import esCommon from './locales/es/common.json';
import esHero from './locales/es/hero.json';
import esNavigation from './locales/es/navigation.json';
import esDashboard from './locales/es/dashboard.json';
import esCountries from './locales/es/countries.json';
import esLanguages from './locales/es/languages.json';
import esErrors from './locales/es/errors.json';

import zhCommon from './locales/zh/common.json';
import zhHero from './locales/zh/hero.json';
import zhNavigation from './locales/zh/navigation.json';
import zhDashboard from './locales/zh/dashboard.json';
import zhCountries from './locales/zh/countries.json';
import zhLanguages from './locales/zh/languages.json';
import zhErrors from './locales/zh/errors.json';

import frCommon from './locales/fr/common.json';
import frHero from './locales/fr/hero.json';
import frNavigation from './locales/fr/navigation.json';
import frDashboard from './locales/fr/dashboard.json';
import frCountries from './locales/fr/countries.json';
import frLanguages from './locales/fr/languages.json';
import frErrors from './locales/fr/errors.json';

import arCommon from './locales/ar/common.json';
import arHero from './locales/ar/hero.json';
import arNavigation from './locales/ar/navigation.json';
import arDashboard from './locales/ar/dashboard.json';
import arCountries from './locales/ar/countries.json';
import arLanguages from './locales/ar/languages.json';
import arErrors from './locales/ar/errors.json';

const resources = {
  en: {
    common: enCommon,
    hero: enHero,
    navigation: enNavigation,
    dashboard: enDashboard,
    countries: enCountries,
    languages: enLanguages,
    errors: enErrors,
  },
  es: {
    common: esCommon,
    hero: esHero,
    navigation: esNavigation,
    dashboard: esDashboard,
    countries: esCountries,
    languages: esLanguages,
    errors: esErrors,
  },
  zh: {
    common: zhCommon,
    hero: zhHero,
    navigation: zhNavigation,
    dashboard: zhDashboard,
    countries: zhCountries,
    languages: zhLanguages,
    errors: zhErrors,
  },
  fr: {
    common: frCommon,
    hero: frHero,
    navigation: frNavigation,
    dashboard: frDashboard,
    countries: frCountries,
    languages: frLanguages,
    errors: frErrors,
  },
  ar: {
    common: arCommon,
    hero: arHero,
    navigation: arNavigation,
    dashboard: arDashboard,
    countries: arCountries,
    languages: arLanguages,
    errors: arErrors,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    ns: ['common', 'hero', 'navigation', 'dashboard', 'countries', 'languages', 'errors'],
    defaultNS: 'common',
  });

export default i18n;