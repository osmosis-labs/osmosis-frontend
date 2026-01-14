import { useEffect } from "react";

import { useTranslation } from "~/hooks";
import { useUserSettingsStore } from "~/stores/user-settings-store";

/** Use current user-set language. */
export function useCurrentLanguage() {
  const { changeLanguage, changeTranslations } = useTranslation();
  const currentLanguage = useUserSettingsStore((state) => state.language);

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
