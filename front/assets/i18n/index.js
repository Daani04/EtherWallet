import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ES from "./ES/ES.json";
import EN from "./EN/EN.json";
import CA from "./CA/CA.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    ES: { translation: ES },
    EN: { translation: EN },
    CA: { translation: CA },
  },
  lng: "ES",        
  fallbackLng: "ES",
  interpolation: {
    escapeValue: false,
  },
});

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'EN',
        fallbackLng: 'ES',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
