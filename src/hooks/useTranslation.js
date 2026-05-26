import { useLangStore } from "../store/useLangStore";
import { th, en } from "../i18n";

export const useTranslation = () => {
  const { lang, toggleLang, setLang } = useLangStore();
  const translations = lang === "th" ? th : en;

  const t = (key) => {
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) {
      if (value[k] === undefined) {
        return key; // return key if translation not found
      }
      value = value[k];
    }
    return value;
  };

  return { t, lang, toggleLang, setLang };
};

export default useTranslation;
