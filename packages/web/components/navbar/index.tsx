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
          "fixed shadow-md z-50 flex place-content-between md:place-content-start lg:gap-5 items-center bg-osmoverse-900 h-navbar md:h-navbar-mobile w-[calc(100vw_-_12.875rem)] md:w-full px-8 md:px-4",
          className
        )}
      >
        <div className="relative hidden shrink-0 items-center md:flex">
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
              className="top-navbar-mobile absolute top-[100%] flex w-52 flex-col gap-2 rounded-3xl bg-osmoverse-800 py-4 px-3"
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
        <div className="flex shrink-0 grow items-center gap-9 lg:gap-2 md:place-content-between md:gap-1">
          <h4 className="md:text-h6 md:font-h6">
            {navBarStore.title || title}
          </h4>
          <div className="flex items-center gap-3 lg:gap-1">
            {navBarStore.callToActionButtons.map((button, index) => (
              <Button
                className="h-fit w-[180px] lg:w-fit lg:px-2"
                mode={
                  index > 0 || navBarStore.callToActionButtons.length === 1
                    ? "secondary"
                    : undefined
                }
                key={index}
                {...button}
              >
                <span className="subtitle1 mx-auto">{button.label}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 lg:gap-2 md:hidden">
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
          "h-navbar bg-osmoverse-900 md:h-navbar-mobile",
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
      className="flex items-center rounded-xl bg-osmoverse-700 px-3 py-2 transition-colors hover:bg-osmoverse-600"
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
      className="absolute shadow-md top-[110%] md:top-navbar-mobile left-[50%] md:left-0 -translate-x-1/2 md:translate-x-0 flex flex-col gap-10 min-w-[385px] md:w-[90vw] md:min-w-min md:max-w-[385px] text-left bg-osmoverse-800 p-8 rounded-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h5>{t("settings.title")}</h5>
      <div className="flex flex-col gap-7">
        {userSettings.map((setting) => (
          <div
            className="flex w-full place-content-between items-center"
            key={setting.id}
          >
            <span className="subtitle1 flex-nowrap text-osmoverse-100">
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
      <div className={classNames("w-40 shrink-0 lg:w-36 md:w-full", className)}>
        {!walletConnected ? (
          <Button
            className="!h-10 w-40 lg:w-36 md:w-full"
            onClick={() => {
              account.init();
              setHoverWalletInfo(false);
            }}
          >
            <span className="button mx-auto">{t("connectWallet")}</span>
          </Button>
        ) : hoverWalletInfo || mobileTapInfo ? (
          <Button
            className="!h-10 w-40 lg:w-36 md:w-full"
            mode="secondary"
            onMouseLeave={() => setHoverWalletInfo(false)}
            onClick={() => {
              account.disconnect();
              setHoverWalletInfo(false);
            }}
          >
            <span className="button mx-auto">{t("menu.signOut")}</span>
          </Button>
        ) : (
          <div
            className="flex place-content-between items-center gap-3 rounded-xl border border-osmoverse-700 px-2 py-1"
            onMouseOver={() => {
              if (!isMobile) setHoverWalletInfo(true);
            }}
            onClick={() => {
              if (isMobile) setMobileTapInfo(true);
            }}
          >
            <div className="h-7 w-7 shrink-0">
              <Image
                alt="wallet-icon"
                src={navBarStore.walletInfo.logoUrl}
                height={28}
                width={28}
              />
            </div>

            <div className="flex w-full flex-col truncate text-center leading-tight">
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
