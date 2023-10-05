import { PropsWithChildren, useCallback, useState } from "react";

import en from "~/localizations/en.json";
import { createContext } from "~/utils/react-context";

type LanguageTranslations = typeof en;

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

type TranslationPath = Join<PathsToStringProps<LanguageTranslations>, ".">;

type Translations = { [key: string]: LanguageTranslations };

interface MultiLanguageContextState {
  language: string;
  translations: Translations;
  setLanguage: (language: string) => void;
  setTranslations: (translations: Translations) => void;
  t: (path: TranslationPath) => string;
}

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
const REPLACE_REGEX = /{([^}]+)}/g;

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

  const t = useCallback(
    (path: TranslationPath, args?: { [key: string]: string }) => {
      const keys = path.split(".");
      let current: any = translations[language];

      for (const key of keys) {
        if (current.hasOwnProperty(key)) {
          current = current[key];
        } else {
          current = undefined;
        }
      }

      if (!current) {
        console.warn(`I couldn't find a translation with the key: ${path}`, {
          cause: "MultiLanguageProvider: function 't'",
        });
      }

      if (args && typeof current === "string") {
        current = current.replace(REPLACE_REGEX, (_, match) => args[match]);
      }

      return current;
    },
    [language, translations]
  );

  return (
    <MultiLanguageInnerProvider
      value={{
        language,
        translations,
        setLanguage,
        setTranslations,
        t,
      }}
    >
      {children}
    </MultiLanguageInnerProvider>
  );
};

export { useMultiLanguage };
