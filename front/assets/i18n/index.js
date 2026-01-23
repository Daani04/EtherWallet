import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './es/es.json';
import ca from './ca/ca.json';
import en from './en/en.json';

const resources = {
    es: { translation: es },
    ca: { translation: ca },
    en: { translation: en },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'es',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;