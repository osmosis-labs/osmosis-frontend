import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { MenuDropdownIconItemProps } from "./types";
import { useTranslation } from "react-multi-lang";
import { IconDropdown } from "./icon-dropdown/icon-dropdown";
import { LanguageState, LanguageUserSetting } from "../../stores/user-settings";

export type LanguageSelectProps = {
  options: MenuDropdownIconItemProps[];
};

export const LanguageSelect: FunctionComponent<LanguageSelectProps> = observer(
  ({ options }: LanguageSelectProps) => {
    const { userSettings } = useStore();
    const t = useTranslation();
    const languageSetting = userSettings.getUserSettingById(
      "language"
    ) as LanguageUserSetting;
    const currentLanguage = languageSetting?.state.language;
    const currentOption = options.find(
      (option) => option.value === currentLanguage
    );

    const onSelect = (option: MenuDropdownIconItemProps) => {
      userSettings
        .getUserSettingById<LanguageState>("language")
        ?.setState({ language: option.value });
    };

    return (
      <IconDropdown
        onSelect={onSelect}
        options={options.filter((option) => option.value !== currentLanguage)}
        currentOption={currentOption ?? languageSetting.defaultLanguage}
        title={t("settings.titleLanguage")}
      />
    );
  }
);
