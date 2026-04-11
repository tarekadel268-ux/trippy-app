import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { I18nManager } from "react-native";
import translations, { Language, TranslationKey } from "@/constants/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: async () => {},
  t: (key) => key,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.getItem("@language").then((saved) => {
      if (saved === "en" || saved === "ar") {
        setLang(saved);
        I18nManager.forceRTL(saved === "ar");
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLang(lang);
    I18nManager.forceRTL(lang === "ar");
    await AsyncStorage.setItem("@language", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translations[language][key] ?? translations.en[key] ?? key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
