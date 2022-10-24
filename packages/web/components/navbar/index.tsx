import Image from "next/image";
import { ButtonHTMLAttributes, FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { WalletStatus } from "@keplr-wallet/stores";
import { NewButton } from "../buttons";
import { useStore } from "../../stores";
import { CustomClasses } from "../types";
import { useBooleanWithWindowEvent } from "../../hooks";
import { IUserSetting } from "../../stores/user-settings";
import { useTranslation } from "react-multi-lang";

export const NavBar: FunctionComponent<
  { title: string; backElementClassNames?: string } & CustomClasses
> = observer(({ title, className, backElementClassNames }) => {
  const {
    navBarStore,
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    userSettings,
  } = useStore();
  const t = useTranslation();

  // wallet
  const account = accountStore.getAccount(chainId);
  const walletConnected = account.walletStatus === WalletStatus.Loaded;
  const [hoverWalletInfo, setHoverWalletInfo] = useState(false);

  // settings button
  const [settingsDropdownOpen, setSettingsDropdownOpen] =
    useBooleanWithWindowEvent(false);

  return (
    <>
      <div
        className={classNames(
          "fixed z-50 flex place-content-between items-center bg-osmoverse-900 h-navbar w-[calc(100vw_-_12.875rem)] px-8",
          className
        )}
      >
        <div className="flex items-center gap-9">
          <h4>{navBarStore.title || title}</h4>
          <div className="flex items-center gap-3">
            {navBarStore.callToActionButtons.map((button, index) => (
              <NewButton
                mode={index > 0 ? "secondary" : undefined}
                key={index}
                {...button}
              >
                <span className="subtitle1 mx-auto">{button.label}</span>
              </NewButton>
            ))}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <NavBarButton
              iconurl="/icons/setting.svg"
              hovericonurl="/icons/setting-hover.svg"
              onClick={() => {
                // allow global event to close dropdown when clicking settings button
                if (!settingsDropdownOpen) setSettingsDropdownOpen(true);
              }}
            />
            {settingsDropdownOpen && (
              <SettingsDropdown userSettings={userSettings.userSettings} />
            )}
          </div>
          {!walletConnected ? (
            <NewButton
              onClick={() => {
                account.init();
                setHoverWalletInfo(false);
              }}
              className="w-[168px] h-10"
            >
              <span className="mx-auto button">{t("menu.connectWallet")}</span>
            </NewButton>
          ) : hoverWalletInfo ? (
            <NewButton
              className="w-[168px] h-10"
              mode="secondary"
              onMouseLeave={() => setHoverWalletInfo(false)}
              onClick={() => {
                account.disconnect();
                setHoverWalletInfo(false);
              }}
            >
              <span className="mx-auto button">{t("menu.signOut")}</span>
            </NewButton>
          ) : (
            <div
              className="flex items-center gap-3 px-2 py-1 rounded-xl border border-osmoverse-700"
              onMouseOver={() => setHoverWalletInfo(true)}
              onClick={() => setHoverWalletInfo(true)}
            >
              <Image
                alt="wallet-icon"
                src={navBarStore.walletInfo.logoUrl}
                height={28}
                width={28}
              />

              <div className="flex leading-tight flex-col text-center">
                <span className="text-button font-button">
                  {navBarStore.walletInfo.balance.toString()}
                </span>
                <span className="caption">
                  {Bech32Address.shortenAddress(
                    navBarStore.walletInfo.bech32Address,
                    16
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Back-layer element to occupy space for the caller */}
      <div
        className={classNames(
          "bg-osmoverse-900 h-navbar",
          backElementClassNames
        )}
      />
    </>
  );
});

const NavBarButton: FunctionComponent<
  {
    iconurl: string;
    hovericonurl: string;
  } & ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const { iconurl, hovericonurl } = props;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      {...props}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex bg-osmoverse-700 items-center px-3 py-2 rounded-xl hover:bg-osmoverse-600"
    >
      <Image
        alt="settings"
        src={hovered ? hovericonurl : iconurl}
        height={24}
        width={24}
      />
    </button>
  );
};

const SettingsDropdown: FunctionComponent<{
  userSettings: IUserSetting[];
}> = observer(({ userSettings }) => {
  const t = useTranslation();
  return (
    <div
      className="absolute top-[110%] left-[50%] -translate-x-1/2 flex flex-col gap-10 min-w-[385px] text-left bg-osmoverse-800 p-8 rounded-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h5>{t("settings.title")}</h5>
      <div className="flex flex-col gap-7">
        {userSettings.map((setting) => (
          <div
            className="flex items-center w-full place-content-between"
            key={setting.id}
          >
            <span className="flex-nowrap subtitle1 text-osmoverse-100">
              {setting.getLabel(t)}
            </span>
            {setting.controlComponent(setting.state as any, setting.setState)}
          </div>
        ))}
      </div>
    </div>
  );
});
