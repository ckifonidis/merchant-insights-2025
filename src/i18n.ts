import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import grTranslations from './locales/gr.json';

const resources = {
  en: {
    translation: enTranslations
  },
  gr: {
    translation: grTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'gr', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // react already does escaping
    }
  });

export default i18n;
