import { useEffect } from "react";

import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { LanguageState } from "~/stores/user-settings";

/** Use current user-set laungage. */
export function useCurrentLanguage() {
  const { userSettings } = useStore();
  const { changeLanguage, changeTranslations } = useTranslation();
  const currentLanguage: string | undefined =
    userSettings.getUserSettingById<LanguageState>("language")?.state.language;

  useEffect(() => {
    if (currentLanguage) {
      const load = async () => {
        const language = await import(
          `../../localizations/${currentLanguage}.json`
        );
        await import(`../../localizations/dayjs-locale-${currentLanguage}.js`);

        changeTranslations({
          [currentLanguage]: { ...language },
        });
        changeLanguage(currentLanguage);
      };
      load();
    }
  }, [changeLanguage, changeTranslations, currentLanguage]);

  return currentLanguage ?? "en";
}
