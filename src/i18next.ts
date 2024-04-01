import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import languageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import se from "./locales/se.json";

export const initI18n = () => {
  i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: en,
        se: se,
      },
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });

  return i18n;
};
