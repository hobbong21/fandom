import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type Language, type Translations, translations } from "@/constants/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const LANG_KEY = "fandom_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ko");

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((val) => {
      if (val === "ko" || val === "en") setLanguageState(val);
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === "ko" ? "en" : "ko";
      AsyncStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
