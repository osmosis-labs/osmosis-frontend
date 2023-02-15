import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { useStore } from "../stores";
import { LanguageUserSetting } from "../stores/user-settings";
import { noop } from "../utils/function";
import { ModalBase, ModalBaseProps } from "./base";

export const SettingsModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    const t = useTranslation();

    const { userSettings } = useStore();
    const languageSetting = userSettings.getUserSettingById(
      "language"
    ) as LanguageUserSetting;

    return (
      <ModalBase
        {...props}
        title={
          <h1 className="w-full text-center text-h6 font-h6">
            {languageSetting.state.isControlOpen
              ? t("settings.titleLanguage")
              : t("settings.title")}
          </h1>
        }
        onRequestBack={languageSetting.state.isControlOpen ? noop : undefined}
      >
        <SettingsContent />
      </ModalBase>
    );
  }
);

const SettingsContent = observer(() => {
  const { userSettings } = useStore();

  return (
    <div className="relative mt-8 overflow-auto">
      {userSettings.userSettings.map((setting) => (
        <>{setting.controlComponent(setting.state as any, setting.setState)}</>
      ))}
    </div>
  );
});
