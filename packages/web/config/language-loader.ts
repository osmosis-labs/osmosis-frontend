import dayjs from "dayjs";

import type { Translations } from "~/hooks/language/types";

/** Loaded after hydration; server builds use language-loader.server.ts. */
export async function loadLanguage(
  language: string
): Promise<Translations[string]> {
  const translations = await import(`../localizations/${language}.json`);
  const { default: dateLocale } = await import(
    `../localizations/dayjs-locale-${language}.js`
  );
  // Some locale files only export data; register it before changeLanguage selects it.
  // Keep Day.js's built-in English locale: the exported one lacks `ordinal` and `formats`.
  if (language !== "en") dayjs.locale(dateLocale, undefined, true);

  return translations.default;
}
