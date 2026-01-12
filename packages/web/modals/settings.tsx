import { noop } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent, useState } from "react";

import { Icon } from "~/components/assets";
import { LanguageSelect } from "~/components/control";
import { Switch } from "~/components/ui/switch";
import { useTranslation, useWindowSize } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import {
  SUPPORTED_LANGUAGES,
  useUserSettingsStore,
} from "~/stores/user-settings-store";

export const SettingsModal: FunctionComponent<ModalBaseProps> = (props) => {
  const { t } = useTranslation();
  const [isLanguageSelectOpen, setIsLanguageSelectOpen] = useState(false);

  return (
    <ModalBase
      {...props}
      className="max-h-screen"
      title={
        <h1 className="w-full text-center text-h6 font-h6">
          {isLanguageSelectOpen
            ? t("settings.titleLanguage")
            : t("settings.title")}
        </h1>
      }
      onRequestBack={isLanguageSelectOpen ? noop : undefined}
    >
      <SettingsContent onLanguageSelectOpenChange={setIsLanguageSelectOpen} />
    </ModalBase>
  );
};

const SettingsContent: FunctionComponent<{
  onLanguageSelectOpenChange: (isOpen: boolean) => void;
}> = ({ onLanguageSelectOpenChange }) => {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();

  const {
    hideDust,
    setHideDust,
    hideBalances,
    setHideBalances,
    showUnverifiedAssets,
    setShowUnverifiedAssets,
  } = useUserSettingsStore();

  const [isLanguageSelectOpen, setIsLanguageSelectOpen] = useState(false);

  const handleLanguageSelectOpenChange = (isOpen: boolean) => {
    setIsLanguageSelectOpen(isOpen);
    onLanguageSelectOpenChange(isOpen);
  };

  return (
    <div
      className={classNames("relative mt-8", {
        "overflow-auto": !isLanguageSelectOpen,
        "overflow-hidden": isLanguageSelectOpen,
      })}
    >
      {/* Language Setting */}
      <LanguageSelect
        options={[...SUPPORTED_LANGUAGES]}
        onOpenChange={handleLanguageSelectOpenChange}
      />

      {/* Hide Dust Setting */}
      <div className="mt-4 flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
        <div className="flex items-center justify-between">
          <Icon id="dust-broom" className="text-osmoverse-200" />
          <Switch
            checked={hideDust}
            onCheckedChange={() => setHideDust(!hideDust)}
          />
        </div>
        <div className="group flex justify-between text-white-full">
          <div className="flex flex-col gap-1">
            <span className="subtitle1 text-left tracking-wide">
              {t("settings.filterDust")}
            </span>
            <span className="caption tracking-wider text-osmoverse-200">
              {t("settings.titleHideDust", { fiatSymbol: "$" })}
            </span>
          </div>
        </div>
      </div>

      {/* Hide Balances Setting (Desktop only) */}
      {!isMobile && (
        <div className="mt-4 flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
          <div className="flex items-center justify-between">
            <Icon id="zoom-out" className="text-osmoverse-200" />
            <Switch
              checked={hideBalances}
              onCheckedChange={() => setHideBalances(!hideBalances)}
            />
          </div>
          <div className="group flex justify-between text-white-full">
            <div className="flex flex-col gap-1">
              <span className="subtitle1 text-left tracking-wide">
                {t("settings.hideBalances")}
              </span>
              <span className="caption tracking-wider text-osmoverse-200">
                {t("settings.titleHideBalances")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Unverified Assets Setting */}
      <div className="mt-4 flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
        <div className="flex items-center justify-between">
          <Icon id="alert-triangle" className="text-osmoverse-200" />
          <Switch
            checked={showUnverifiedAssets}
            onCheckedChange={() =>
              setShowUnverifiedAssets(!showUnverifiedAssets)
            }
          />
        </div>
        <div className="group flex justify-between text-white-full">
          <div className="flex flex-col gap-1">
            <span className="subtitle1 text-left tracking-wide">
              {t("settings.titleUnverifiedAssets")}
            </span>
            <span className="caption tracking-wider text-osmoverse-200">
              {t("settings.unverifiedAssets")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
