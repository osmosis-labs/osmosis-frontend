import Image from "next/image";
import { Fragment, FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { WalletStatus } from "@keplr-wallet/stores";
import { Button } from "../buttons";
import { useStore } from "../../stores";
import {
  useAmplitudeAnalytics,
  useBooleanWithWindowEvent,
  useDisclosure,
} from "../../hooks";
import { UserSetting } from "../../stores/user-settings";
import { useTranslation } from "react-multi-lang";
import { MainLayoutMenu, CustomClasses } from "../types";
import { MainMenu } from "../main-menu";
import { EventName } from "../../config";
import { ProfileModal } from "../../modals/profile";
import IconButton from "../buttons/icon-button";
import { Icon } from "../assets";
import { formatICNSName, getShortAddress } from "../../utils/string";
import { Popover } from "../popover";
import { useDisclosure } from "../../hooks/use-disclosure";
import { SettingsModal } from "../../modals";

export const NavBar: FunctionComponent<
  {
    title: string;
    backElementClassNames?: string;
    menus: MainLayoutMenu[];
  } & CustomClasses
> = observer(({ title, className, backElementClassNames, menus }) => {
  const { navBarStore, userSettings } = useStore();

  const {
    isOpen: isSettingsOpen,
    onClose: onCloseSettings,
    onOpen: onOpenSettings,
  } = useDisclosure();

  // mobile settings menu
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] =
    useBooleanWithWindowEvent(false);

  return (
    <>
      <div
        className={classNames(
          "fixed z-[60] flex h-navbar w-[calc(100vw_-_12.875rem)] place-content-between items-center bg-osmoverse-900 px-8 shadow-md lg:gap-5 md:h-navbar-mobile md:w-full md:place-content-start md:px-4",
          className
        )}
      >
        <div className="relative hidden shrink-0 items-center md:flex">
          <Popover>
            {({ close: closeMobileMainMenu }) => (
              <>
                <Popover.Button as={Fragment}>
                  <IconButton
                    mode="unstyled"
                    size="unstyled"
                    className="py-0"
                    aria-label="Open main menu dropdown"
                    onClick={() => {
                      setIsMobileSettingsOpen(false);
                    }}
                    icon={
                      <Icon
                        id="hamburger"
                        className="text-osmoverse-200"
                        height={30}
                        width={30}
                      />
                    }
                  />
                </Popover.Button>
                {isMobileSettingsOpen && (
                  <SettingsPanel
                    isMobile
                    userSettings={userSettings.userSettings}
                  />
                )}
                <Popover.Panel className="top-navbar-mobile absolute top-[100%] flex w-52 flex-col gap-2 rounded-3xl bg-osmoverse-800 py-4 px-3">
                  <MainMenu
                    menus={menus.concat({
                      label: "Settings",
                      link: (e) => {
                        e.stopPropagation();
                        setIsMobileSettingsOpen(true);
                        closeMobileMainMenu();
                      },
                      icon: (
                        <Icon
                          id="setting"
                          className="text-white-full"
                          width={20}
                          height={20}
                        />
                      ),
                    })}
                  />
                  <WalletInfo />
                </Popover.Panel>
              </>
            )}
          </Popover>
        </div>
        <div className="flex shrink-0 grow items-center gap-9 lg:gap-2 md:place-content-between md:gap-1">
          <h4 className="md:text-h6 md:font-h6">
            {navBarStore.title || title}
          </h4>
          <div className="flex items-center gap-3 lg:gap-1">
            {navBarStore.callToActionButtons.map((button, index) => (
              <Button
                className="h-fit w-[180px] lg:w-fit lg:px-2"
                mode={index > 0 ? "secondary" : undefined}
                key={index}
                {...button}
              >
                <span className="subtitle1 mx-auto">{button.label}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 lg:gap-2 md:hidden">
          <IconButton
            aria-label="Open settings dropdown"
            icon={<Icon id="setting" width={24} height={24} />}
            className="px-3 outline-none"
            onClick={onOpenSettings}
          />
          <SettingsModal
            isOpen={isSettingsOpen}
            onRequestClose={onCloseSettings}
          />
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

const SettingsPanel: FunctionComponent<{
  userSettings: UserSetting[];
  isMobile?: boolean;
}> = observer(({ userSettings, isMobile }) => {
  const t = useTranslation();
  const Component = isMobile ? "div" : Popover.Panel;

  return (
    <Component
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="md:top-navbar-mobile absolute top-[110%] left-[50%] flex min-w-[385px] -translate-x-1/2 flex-col gap-10 rounded-3xl bg-osmoverse-800 p-8 text-left shadow-md md:left-0 md:w-[90vw] md:min-w-min md:max-w-[385px] md:translate-x-0"
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
    </Component>
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
      profileStore,
      queriesExternalStore,
    } = useStore();
    const {
      isOpen: isProfileOpen,
      onOpen: onOpenProfile,
      onClose: onCloseProfile,
    } = useDisclosure();
    const t = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();

    // wallet
    const account = accountStore.getAccount(chainId);
    const walletConnected = account.walletStatus === WalletStatus.Loaded;

    const icnsQuery = queriesExternalStore.queryICNSNames.getQueryContract(
      account.bech32Address
    );

    return (
      <div className={className}>
        {!walletConnected ? (
          <Button
            className="!h-10 w-40 lg:w-36 md:w-full"
            onClick={() => {
              logEvent([EventName.Topnav.connectWalletClicked]);
              account.init();
            }}
          >
            <span className="button mx-auto">{t("connectWallet")}</span>
          </Button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile();
            }}
            className="group flex place-content-between items-center gap-[13px] rounded-xl border border-osmoverse-700 px-1.5 py-1 hover:border-[1.3px] hover:border-wosmongton-300 hover:bg-osmoverse-800 md:w-full"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-[7px] bg-osmoverse-700 group-hover:bg-gradient-positive">
              {profileStore.currentAvatar === "ammelia" ? (
                <Image
                  alt="Wosmongton profile"
                  src="/images/profile-ammelia.png"
                  height={32}
                  width={32}
                />
              ) : (
                <Image
                  alt="Wosmongton profile"
                  src="/images/profile-woz.png"
                  height={32}
                  width={32}
                />
              )}
            </div>

            <div className="flex w-full  flex-col truncate text-right leading-tight">
              <span
                className="body2 font-bold leading-4"
                title={icnsQuery?.primaryName}
              >
                {Boolean(icnsQuery?.primaryName)
                  ? formatICNSName(icnsQuery.primaryName)
                  : getShortAddress(account.bech32Address)}
              </span>
              <span className="caption font-medium tracking-wider text-osmoverse-200">
                {navBarStore.walletInfo.balance.toString()}
              </span>
            </div>
          </button>
        )}
        <ProfileModal
          isOpen={isProfileOpen}
          onRequestClose={onCloseProfile}
          icnsName={icnsQuery?.primaryName}
        />
      </div>
    );
  }
);
