import Image from "next/image";
import { Fragment, FunctionComponent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { WalletStatus } from "@keplr-wallet/stores";
import { Button } from "../buttons";
import { useStore } from "../../stores";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useLocalStorageState,
} from "../../hooks";
import { useTranslation } from "react-multi-lang";
import { MainLayoutMenu, CustomClasses } from "../types";
import { MainMenu } from "../main-menu";
import { EventName, Announcement } from "../../config";
import { ProfileModal } from "../../modals/profile";
import IconButton from "../buttons/icon-button";
import { Icon } from "../assets";
import { formatICNSName, getShortAddress } from "../../utils/string";
import { Popover } from "../popover";
import { SettingsModal } from "../../modals";
import { noop } from "../../utils/function";
import { useRouter } from "next/router";

export const NavBar: FunctionComponent<
  {
    title: string;
    backElementClassNames?: string;
    menus: MainLayoutMenu[];
  } & CustomClasses
> = observer(({ title, className, backElementClassNames, menus }) => {
  const {
    queriesExternalStore,
    navBarStore,
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();

  const {
    isOpen: isSettingsOpen,
    onClose: onCloseSettings,
    onOpen: onOpenSettings,
  } = useDisclosure();

  const {
    isOpen: isProfileOpen,
    onOpen: onOpenProfile,
    onClose: onCloseProfile,
  } = useDisclosure();

  const closeMobileMenuRef = useRef(noop);
  const router = useRouter();

  useEffect(() => {
    const handler = () => {
      closeMobileMenuRef.current();
    };

    router.events.on("routeChangeComplete", handler);
    return () => router.events.off("routeChangeComplete", handler);
  }, []);

  const account = accountStore.getAccount(chainId);
  const icnsQuery = queriesExternalStore.queryICNSNames.getQueryContract(
    account.bech32Address
  );

  // announcement banner
  const [_showBanner, setShowBanner] = useLocalStorageState(
    Announcement ? Announcement?.localStorageKey ?? "" : "",
    true
  );

  const showBanner =
    _showBanner &&
    Announcement &&
    (!Announcement.pageRoute || router.pathname === Announcement.pageRoute);

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
            {({ close: closeMobileMainMenu }) => {
              closeMobileMenuRef.current = closeMobileMainMenu;
              return (
                <>
                  <Popover.Button as={Fragment}>
                    <IconButton
                      mode="unstyled"
                      size="unstyled"
                      className="py-0"
                      aria-label="Open main menu dropdown"
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
                  <Popover.Panel className="top-navbar-mobile absolute top-[100%] flex w-52 flex-col gap-2 rounded-3xl bg-osmoverse-800 py-4 px-3">
                    <MainMenu
                      menus={menus.concat({
                        label: "Settings",
                        link: (e) => {
                          e.stopPropagation();
                          onOpenSettings();
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
                    <WalletInfo onOpenProfile={onOpenProfile} />
                  </Popover.Panel>
                </>
              );
            }}
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
          <WalletInfo
            className="md:hidden"
            icnsName={icnsQuery?.primaryName}
            onOpenProfile={onOpenProfile}
          />
        </div>
      </div>
      {/* Back-layer element to occupy space for the caller */}
      <div
        className={classNames(
          "bg-osmoverse-900",
          showBanner ? "h-[124px]" : "h-navbar md:h-navbar-mobile",
          backElementClassNames
        )}
      />
      {showBanner && (
        <AnnouncementBanner
          {...Announcement!}
          closeBanner={() => setShowBanner(false)}
        />
      )}
      <ProfileModal
        isOpen={isProfileOpen}
        onRequestClose={onCloseProfile}
        icnsName={icnsQuery?.primaryName}
      />
    </>
  );
});

const WalletInfo: FunctionComponent<
  CustomClasses & { onOpenProfile: () => void; icnsName?: string }
> = observer(({ className, onOpenProfile, icnsName }) => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    navBarStore,
    profileStore,
  } = useStore();

  const t = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  // wallet
  const account = accountStore.getAccount(chainId);
  const walletConnected = account.walletStatus === WalletStatus.Loaded;

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
            <span className="body2 font-bold leading-4" title={icnsName}>
              {Boolean(icnsName)
                ? formatICNSName(icnsName)
                : getShortAddress(account.bech32Address)}
            </span>
            <span className="caption font-medium tracking-wider text-osmoverse-200">
              {navBarStore.walletInfo.balance.toString()}
            </span>
          </div>
        </button>
      )}
    </div>
  );
});

const AnnouncementBanner: FunctionComponent<
  typeof Announcement & { closeBanner: () => void }
> = ({
  enTextOrLocalizationPath,
  link,
  isWarning,
  persistent,
  closeBanner,
  bg,
}) => {
  const t = useTranslation();

  return (
    <div
      className={classNames(
        "fixed top-[72px] z-[51] float-right my-auto ml-sidebar flex w-[calc(100vw_-_12.875rem)] items-center px-8 py-[14px] md:ml-0 md:w-full",
        {
          "bg-gradient-negative": isWarning,
          "bg-osmoverse-700": !isWarning,
        },
        bg
      )}
    >
      <div className="flex w-full place-content-center items-center gap-3 text-center text-subtitle1">
        {t(enTextOrLocalizationPath)}{" "}
        {Boolean(link) && (
          <div className="flex cursor-pointer items-center gap-2">
            <a
              className="underline"
              href={link?.url}
              rel="noreferrer"
              target="_blank"
            >
              {t(link?.enTextOrLocalizationKey ?? "Click here to learn more")}
            </a>
            <Icon id="arrow-right" height={24} width={24} />
          </div>
        )}
      </div>
      {!persistent && !isWarning && (
        <IconButton
          className="flex w-fit cursor-pointer items-center py-0 text-white-full"
          onClick={closeBanner}
          aria-label="Close"
          icon={<Icon id="close-small" height={24} width={24} />}
          size="unstyled"
          mode="unstyled"
        />
      )}
    </div>
  );
};
