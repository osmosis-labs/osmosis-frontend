import { PropsWithChildren, useCallback, useState } from "react";

import en from "~/localizations/en.json";
import { createContext } from "~/utils/react-context";

import { internalTranslate } from "./internal";
import {
  MultiLanguageContextState,
  MultiLanguageT,
  Translations,
} from "./types";

const [MultiLanguageInnerProvider, useMultiLanguage] =
  createContext<MultiLanguageContextState>({
    strict: true,
    name: "LanguageContext",
  });

interface MultiLanguageProviderProps {
  defaultLanguage?: string;
  defaultTranslations?: Translations;
}

const DEFAULT_LANGUAGE = "en";

let globalTranslations: Translations = { en };
let globalLanguage: string = DEFAULT_LANGUAGE;

export const t: MultiLanguageT = (path, args) =>
  internalTranslate(path, globalTranslations, globalLanguage, args);

export const MultiLanguageProvider = (
  props: PropsWithChildren<MultiLanguageProviderProps>
) => {
  const {
    children,
    defaultLanguage = DEFAULT_LANGUAGE,
    defaultTranslations = { en },
  } = props;
  const [language, setLanguage] = useState(defaultLanguage);
  const [translations, setTranslations] = useState(defaultTranslations);

  const t = useCallback<MultiLanguageT>(
    (path, args) => internalTranslate(path, translations, language, args),
    [language, translations]
  );

  const changeLanguage = useCallback((language: string) => {
    globalLanguage = language;
    setLanguage(language);
  }, []);

  const changeTranslations = useCallback((translations: Translations) => {
    globalTranslations = translations;
    setTranslations(translations);
  }, []);

  return (
    <MultiLanguageInnerProvider
      value={{
        language,
        translations,
        changeLanguage,
        changeTranslations,
        t,
      }}
    >
      {children}
    </MultiLanguageInnerProvider>
  );
};

export { useMultiLanguage };
