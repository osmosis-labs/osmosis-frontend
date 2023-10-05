import { MultiLanguageInternalT } from "./types";

const REPLACE_REGEX = /{([^}]+)}/g;

export const internalTranslate: MultiLanguageInternalT = (
  path,
  translations,
  language,
  args
) => {
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

    return path;
  }

  if (args && typeof current === "string") {
    current = current.replace(REPLACE_REGEX, (_, match) => args[match]);
  }

  return current;
};
