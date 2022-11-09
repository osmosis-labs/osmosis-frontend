import { useEffect } from "react";
import { setLanguage, setTranslations } from "react-multi-lang";
import { useStore } from "../../stores";

/** Use current user-set laungage. */
export function useCurrentLanguage() {
  const { userSettings } = useStore();
  const currentLanguage: string | undefined =
    userSettings.getUserSettingById("language")?.state.language;

  useEffect(() => {
    if (currentLanguage) {
      const load = async () => {
        const language = await import(
          `../../localizations/${currentLanguage}.json`
        );
        await import(`../../localizations/dayjs-locale-${currentLanguage}.js`);
        setTranslations({
          [currentLanguage]: language,
        });
        setLanguage(currentLanguage);
      };
      load();
    }
  }, [currentLanguage]);

  return currentLanguage ?? "en";
}
