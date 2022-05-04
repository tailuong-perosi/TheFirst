import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import en from './translations/en.json'
import vi from './translations/vi.json'

const lang = localStorage.getItem('language')
if (lang) localStorage.setItem('language', 'vi')

// the translations
const resources = {
  en: { translation: en },
  vi: { translation: vi },
}

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: lang || 'vi',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  })

export default i18n
