import { noop } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { Fragment, FunctionComponent } from "react";

import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { LanguageUserSetting } from "~/stores/user-settings";

export const SettingsModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    const { t } = useTranslation();

    const { userSettings } = useStore();
    const languageSetting = userSettings.getUserSettingById(
      "language"
    ) as LanguageUserSetting;

    return (
      <ModalBase
        {...props}
        className="max-h-screen"
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
  const { t } = useTranslation();
  const languageSetting = userSettings.getUserSettingById(
    "language"
  ) as LanguageUserSetting;

  return (
    <div
      className={classNames("relative mt-8", {
        "overflow-auto": !languageSetting.state.isControlOpen,
        "overflow-hidden": languageSetting.state.isControlOpen,
      })}
    >
      {userSettings.userSettings.map((setting) => (
        <Fragment key={setting.getLabel(t)}>
          {setting.controlComponent(setting.state as any, setting.setState)}
        </Fragment>
      ))}
    </div>
  );
});
