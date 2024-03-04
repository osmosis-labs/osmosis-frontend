import en from "~/localizations/en.json";

export type LanguageTranslations = typeof en;

export type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

export type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

export type StringWithAutocomplete<T> = T | (string & Record<never, never>);

export type ExactTranslationPath = Join<
  PathsToStringProps<LanguageTranslations>,
  "."
>;

export type TranslationPath = StringWithAutocomplete<ExactTranslationPath>;

export type Translations = { [key: string]: LanguageTranslations };

export type MultiLanguageT = (
  path: TranslationPath,
  args?: { [key: string]: string }
) => string;

export type MultiLanguageInternalT = (
  path: TranslationPath,
  translations: Translations,
  language: string,
  args?: { [key: string]: string }
) => string;

export interface MultiLanguageContextState {
  language: string;
  translations: Translations;
  changeLanguage: (language: string) => void;
  changeTranslations: (translations: Translations) => void;
  t: MultiLanguageT;
}
