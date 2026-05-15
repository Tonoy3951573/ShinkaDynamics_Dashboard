import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import dashboardEn from '../locales/en/dashboard.json';

i18n
  // i18next-http-backend can be used to load translations from an external server
  // .use(Backend)
  // Detects user language
  .use(LanguageDetector)
  // Passes i18n down to react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        dashboard: dashboardEn,
      },
    },
    fallbackLng: 'en',
    ns: ['dashboard'],
    defaultNS: 'dashboard',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
