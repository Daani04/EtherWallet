import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './ES/ES.json';
import ca from './CA/CA.json';
import en from './EN/EN.json';

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