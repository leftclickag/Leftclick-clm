"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  SupportedLocale,
  TranslationStrings,
  getTranslations,
  t as translate,
  LOCALE_NAMES,
  LOCALE_FLAGS,
} from "./translations";

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  translations: TranslationStrings;
  availableLocales: SupportedLocale[];
  localeName: string;
  localeFlag: string;
}

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: SupportedLocale;
  availableLocales?: SupportedLocale[];
}

export function I18nProvider({
  children,
  defaultLocale = "de",
  availableLocales = ["de", "en", "fr", "es", "it", "nl"],
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    // Try to get from localStorage or browser settings
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clm_locale");
      if (stored && availableLocales.includes(stored as SupportedLocale)) {
        return stored as SupportedLocale;
      }

      // Try browser language
      const browserLang = navigator.language.split("-")[0] as SupportedLocale;
      if (availableLocales.includes(browserLang)) {
        return browserLang;
      }
    }
    return defaultLocale;
  });

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      if (availableLocales.includes(newLocale)) {
        setLocaleState(newLocale);
        if (typeof window !== "undefined") {
          localStorage.setItem("clm_locale", newLocale);
        }
      }
    },
    [availableLocales]
  );

  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => {
      return translate(locale, path, params);
    },
    [locale]
  );

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    translations: getTranslations(locale),
    availableLocales,
    localeName: LOCALE_NAMES[locale],
    localeFlag: LOCALE_FLAGS[locale],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Hook for simple translation access
export function useTranslation() {
  const { t, locale, setLocale } = useI18n();
  return { t, locale, setLocale };
}

