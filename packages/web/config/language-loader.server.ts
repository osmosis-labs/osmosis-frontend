import en from "~/localizations/en.json";

/** SSR starts in English; the browser loads the saved language after hydration. */
export async function loadLanguage(_language: string): Promise<typeof en> {
  return en;
}
