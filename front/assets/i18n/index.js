import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ES from './ES/ES.json';
import CA from './CA/CA.json';
import EN from './EN/EN.json';

const resources = {
    ES: { translation: ES },
    CA: { translation: CA },
    EN: { translation: EN },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ES',
        fallbackLng: 'EN',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;