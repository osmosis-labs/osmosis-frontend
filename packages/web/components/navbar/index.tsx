import Image from "next/image";
import { ButtonHTMLAttributes, FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { WalletStatus } from "@keplr-wallet/stores";
import { Button } from "../buttons";
import { useStore } from "../../stores";
import { useBooleanWithWindowEvent, useWindowSize } from "../../hooks";
import { IUserSetting } from "../../stores/user-settings";
import { useTranslation } from "react-multi-lang";
import { MainLayoutMenu, CustomClasses } from "../types";
import { MainMenu } from "../main-menu";

export const NavBar: FunctionComponent<
  {
    title: string;
    backElementClassNames?: string;
    menus: MainLayoutMenu[];
  } & CustomClasses
> = observer(({ title, className, backElementClassNames, menus }) => {
  const { navBarStore, userSettings } = useStore();

  // settings button
  const [settingsDropdownOpen, setSettingsDropdownOpen] =
    useBooleanWithWindowEvent(false);

  // mobile nav menu
  const [mobileNavMenuOptionsOpen, setMobileNavMenuOptionsOpen] =
    useBooleanWithWindowEvent(false);

  return (
    <>
      <div
        className={classNames(
          "fixed z-50 flex place-content-between md:place-content-start lg:gap-5 items-center bg-osmoverse-900 h-navbar md:h-navbar-mobile w-[calc(100vw_-_12.875rem)] md:w-full px-8 md:px-4",
          className
        )}
      >
        <div className="relative hidden md:flex items-center shrink-0">
          <Image
            alt="mobile menu"
            src="/icons/hamburger.svg"
            height={30}
            width={30}
            onClick={() => {
              if (!mobileNavMenuOptionsOpen) setMobileNavMenuOptionsOpen(true);
            }}
          />
          {settingsDropdownOpen && (
            <SettingsDropdown userSettings={userSettings.userSettings} />
          )}
          {mobileNavMenuOptionsOpen && (
            <div
              className="absolute flex flex-col gap-2 w-52 top-[100%] top-navbar-mobile py-4 px-3 bg-osmoverse-800 rounded-3xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MainMenu
                menus={menus.concat({
                  label: "Settings",
                  link: (e) => {
                    e.stopPropagation();
                    setMobileNavMenuOptionsOpen(false);
                    setSettingsDropdownOpen(true);
                  },
                  icon: "/icons/setting-white.svg",
                })}
              />
              <WalletInfo />
            </div>
          )}
        </div>
        <div className="grow flex items-center md:place-content-between shrink-0 gap-9 lg:gap-2 md:gap-1">
          <h4 className="md:font-h6 md:text-h6">
            {navBarStore.title || title}
          </h4>
          <div className="flex items-center gap-3 lg:gap-1">
            {navBarStore.callToActionButtons.map((button, index) => (
              <Button
                className="w-[180px] lg:w-fit h-fit lg:px-2"
                mode={index > 0 ? "secondary" : undefined}
                key={index}
                {...button}
              >
                <span className="subtitle1 mx-auto">{button.label}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="md:hidden flex gap-3 lg:gap-2 shrink-0 items-center">
          <div className="relative">
            <NavBarButton
              iconurl="/icons/setting.svg"
              hovericonurl="/icons/setting-white.svg"
              onClick={() => {
                // allow global event to close dropdown when clicking settings button
                if (!settingsDropdownOpen) setSettingsDropdownOpen(true);
              }}
            />
            {settingsDropdownOpen && (
              <SettingsDropdown userSettings={userSettings.userSettings} />
            )}
          </div>
          <WalletInfo className="md:hidden" />
        </div>
      </div>
      {/* Back-layer element to occupy space for the caller */}
      <div
        className={classNames(
          "bg-osmoverse-900 h-navbar md:h-navbar-mobile",
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
      className="flex bg-osmoverse-700 items-center px-3 py-2 rounded-xl hover:bg-osmoverse-600 transition-colors"
    >
      <Image
        alt="settings"
        src={hovered ? hovericonurl : iconurl}
        height={24}
        width={24}
        priority={true}
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
      className="absolute top-[110%] md:top-navbar-mobile left-[50%] md:left-0 -translate-x-1/2 md:translate-x-0 flex flex-col gap-10 min-w-[385px] md:w-[90vw] md:min-w-min md:max-w-[385px] text-left bg-osmoverse-800 p-8 rounded-3xl"
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

const WalletInfo: FunctionComponent<CustomClasses> = observer(
  ({ className }) => {
    const {
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
      navBarStore,
    } = useStore();
    const t = useTranslation();
    const { isMobile } = useWindowSize();

    // wallet
    const account = accountStore.getAccount(chainId);
    const walletConnected = account.walletStatus === WalletStatus.Loaded;
    const [hoverWalletInfo, setHoverWalletInfo] = useState(false);

    // mobile: show disconnect on tap vs hover
    const [mobileTapInfo, setMobileTapInfo] = useState(false);

    return (
      <div className={classNames("w-40 lg:w-36 md:w-full shrink-0", className)}>
        {!walletConnected ? (
          <Button
            className="w-40 lg:w-36 md:w-full !h-10"
            onClick={() => {
              account.init();
              setHoverWalletInfo(false);
            }}
          >
            <span className="mx-auto button">{t("connectWallet")}</span>
          </Button>
        ) : hoverWalletInfo || mobileTapInfo ? (
          <Button
            className="w-40 lg:w-36 md:w-full !h-10"
            mode="secondary"
            onMouseLeave={() => setHoverWalletInfo(false)}
            onClick={() => {
              account.disconnect();
              setHoverWalletInfo(false);
            }}
          >
            <span className="mx-auto button">{t("menu.signOut")}</span>
          </Button>
        ) : (
          <div
            className="flex items-center gap-3 place-content-between px-2 py-1 rounded-xl border border-osmoverse-700"
            onMouseOver={() => {
              if (!isMobile) setHoverWalletInfo(true);
            }}
            onClick={() => {
              if (isMobile) setMobileTapInfo(true);
            }}
          >
            <div className="w-7 h-7 shrink-0">
              <Image
                alt="wallet-icon"
                src={navBarStore.walletInfo.logoUrl}
                height={28}
                width={28}
              />
            </div>

            <div className="flex w-full leading-tight flex-col text-center truncate">
              <span className="text-button font-button">
                {navBarStore.walletInfo.balance.toString()}
              </span>
              <span className="caption truncate">
                {navBarStore.walletInfo.name}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);
