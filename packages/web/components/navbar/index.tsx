import { Popover } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { Button, buttonCVA } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import ClientOnly from "~/components/client-only";
import { MainMenu } from "~/components/main-menu";
import SkeletonLoader from "~/components/skeleton-loader";
import { CustomClasses, MainLayoutMenu } from "~/components/types";
import { Announcement, EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useLocalStorageState,
} from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useWalletSelect } from "~/hooks/wallet-select";
import { NotifiModal, NotifiPopover } from "~/integrations/notifi";
import { useNotifiBreadcrumb } from "~/integrations/notifi/hooks";
import { ModalBase, ModalBaseProps, SettingsModal } from "~/modals";
import { ProfileModal } from "~/modals/profile";
import { UserUpgradesModal } from "~/modals/user-upgrades";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { theme } from "~/tailwind.config";
import { noop } from "~/utils/function";
import { formatICNSName, getShortAddress } from "~/utils/string";
import { removeQueryParam } from "~/utils/url";

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
    userSettings,
    userUpgrades,
  } = useStore();
  const t = useTranslation();

  const featureFlags = useFeatureFlags();

  const { query } = useRouter();

  const {
    isOpen: isSettingsOpen,
    onClose: onCloseSettings,
    onOpen: onOpenSettings,
  } = useDisclosure();

  const {
    isOpen: isFrontierMigrationOpen,
    onClose: onCloseFrontierMigration,
    onOpen: onOpenFrontierMigration,
  } = useDisclosure();

  const {
    isOpen: isNotifiOpen,
    onClose: onCloseNotifi,
    onOpen: onOpenNotifi,
  } = useDisclosure();

  const {
    isOpen: isProfileOpen,
    onOpen: onOpenProfile,
    onClose: onCloseProfile,
  } = useDisclosure();

  // upgrades modal
  const {
    isOpen: isUpgradesOpen_,
    onOpen: onOpenUpgrades,
    onClose: onCloseUpgrades_,
  } = useDisclosure();
  const [firstTimeShowUpgrades, setFirstTimeShowUpgrades] =
    useLocalStorageState("firstTimeShowUpgrades", true);
  const isUpgradesOpen =
    isUpgradesOpen_ ||
    (firstTimeShowUpgrades && userUpgrades.hasUpgradeAvailable);
  const [showUpgradesFyi, setShowUpgradesFyi] = useState(false);
  const onCloseUpgrades = useCallback(() => {
    onCloseUpgrades_();
    if (firstTimeShowUpgrades && userUpgrades.hasUpgradeAvailable) {
      setFirstTimeShowUpgrades(false);
      setShowUpgradesFyi(true);
    }
  }, [
    onCloseUpgrades_,
    firstTimeShowUpgrades,
    userUpgrades.hasUpgradeAvailable,
    setFirstTimeShowUpgrades,
  ]);

  const closeMobileMenuRef = useRef(noop);
  const router = useRouter();
  const { isLoading: isWalletLoading } = useWalletSelect();

  const { hasUnreadNotification } = useNotifiBreadcrumb();

  useEffect(() => {
    const handler = () => {
      closeMobileMenuRef.current();
    };

    router.events.on("routeChangeComplete", handler);
    return () => router.events.off("routeChangeComplete", handler);
  }, [router.events]);

  useEffect(() => {
    const UnverifiedAssetsQueryKey = "unverified_assets";
    if (query[UnverifiedAssetsQueryKey] === "true") {
      onOpenFrontierMigration();
      userSettings
        .getUserSettingById<UnverifiedAssetsState>("unverified-assets")
        ?.setState({ showUnverifiedAssets: true });
      removeQueryParam(UnverifiedAssetsQueryKey);
    }
  }, [onOpenFrontierMigration, onOpenSettings, query, userSettings]);

  const account = accountStore.getWallet(chainId);
  const icnsQuery = queriesExternalStore.queryICNSNames.getQueryContract(
    account?.address ?? ""
  );

  // announcement banner
  const [_showBanner, setShowBanner] = useLocalStorageState(
    Announcement ? Announcement?.localStorageKey ?? "" : "",
    true
  );

  const showBanner =
    _showBanner &&
    Announcement &&
    featureFlags.concentratedLiquidity &&
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
                      menus={menus.concat(
                        {
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
                        },
                        {
                          label: "Notifications",
                          link: (e) => {
                            e.stopPropagation();
                            if (!account) return;
                            onOpenNotifi();
                            closeMobileMainMenu();
                          },
                          icon: (
                            <Icon
                              id="bell"
                              className="text-white-full"
                              width={20}
                              height={20}
                            />
                          ),
                        }
                      )}
                    />
                    <ClientOnly>
                      <SkeletonLoader isLoaded={!isWalletLoading}>
                        <WalletInfo onOpenProfile={onOpenProfile} />
                      </SkeletonLoader>
                    </ClientOnly>
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
                size="sm"
                {...button}
              >
                <span className="subtitle1 mx-auto">{button.label}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 lg:gap-2 md:hidden">
          {userUpgrades.hasUpgradeAvailable && (
            <div className="relative">
              {showUpgradesFyi && (
                <>
                  <div
                    className={classNames(
                      "absolute top-12 right-0 z-20 flex w-80 shrink flex-col gap-5 rounded-3xl bg-osmoverse-700 p-6"
                    )}
                  >
                    <div className="flex w-full place-content-end items-center text-center">
                      <span className="subtitle1 mx-auto">
                        {t("upgrades.foundHere")}
                      </span>
                      <Icon
                        id="close"
                        color={theme.colors.osmoverse[400]}
                        width={24}
                        height={24}
                        onClick={() => {
                          setShowUpgradesFyi(false);
                        }}
                      />
                    </div>
                    <span className="body2 text-osmoverse-100">
                      {t("upgrades.availableHereCaption")}
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      setShowUpgradesFyi(false);
                    }}
                    className="fixed top-0 left-0 z-10 h-[100vh] w-[100vw] justify-center bg-osmoverse-800/60"
                  />
                </>
              )}
              <IconButton
                aria-label="Open upgrades"
                icon={
                  <Image
                    className="shrink-0"
                    alt="upgrade"
                    src="/icons/upgrade.svg"
                    width={24}
                    height={24}
                  />
                }
                className="relative z-20 w-[48px] px-3 outline-none"
                onClick={onOpenUpgrades}
              />
            </div>
          )}
          <NotifiPopover
            hasUnreadNotification={hasUnreadNotification}
            className="z-40 px-3 outline-none"
          />
          <IconButton
            aria-label="Open settings dropdown"
            icon={<Icon id="setting" width={24} height={24} />}
            className="px-3 outline-none"
            onClick={onOpenSettings}
          />
          <UserUpgradesModal
            isOpen={isUpgradesOpen}
            onRequestClose={onCloseUpgrades}
          />
          <SettingsModal
            isOpen={isSettingsOpen}
            onRequestClose={onCloseSettings}
          />
          <NotifiModal isOpen={isNotifiOpen} onRequestClose={onCloseNotifi} />
          <ClientOnly>
            <SkeletonLoader isLoaded={!isWalletLoading}>
              <WalletInfo
                className="md:hidden"
                icnsName={icnsQuery?.primaryName}
                onOpenProfile={onOpenProfile}
              />
            </SkeletonLoader>
          </ClientOnly>
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
      <FrontierMigrationModal
        isOpen={isFrontierMigrationOpen}
        onRequestClose={onCloseFrontierMigration}
        onOpenSettings={onOpenSettings}
      />
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
  const { onOpenWalletSelect } = useWalletSelect();

  const t = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  // wallet
  const wallet = accountStore.getWallet(chainId);
  const walletConnected = Boolean(wallet?.isWalletConnected);

  return (
    <div className={className}>
      {!walletConnected ? (
        <Button
          className="!h-10 w-40 lg:w-36 md:w-full"
          onClick={() => {
            logEvent([EventName.Topnav.connectWalletClicked]);
            onOpenWalletSelect(chainId);
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
                : getShortAddress(wallet?.address!)}
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
  const {
    isOpen: isLeavingOsmosisOpen,
    onClose: onCloseLeavingOsmosis,
    onOpen: onOpenLeavingOsmosis,
  } = useDisclosure();

  const linkText = t(
    link?.enTextOrLocalizationKey ?? "Click here to learn more"
  );

  return (
    <div
      className={classNames(
        "fixed top-[71px] z-[51] float-right my-auto ml-sidebar flex w-[calc(100vw_-_12.875rem)] items-center px-8 py-[14px] md:top-[57px] md:ml-0 md:w-full sm:gap-3 sm:px-2",
        {
          "bg-gradient-negative": isWarning,
          "bg-gradient-neutral": !isWarning,
        },
        bg
      )}
    >
      <div className="flex w-full place-content-center items-center gap-1.5 text-center text-subtitle1 lg:gap-1 lg:text-xs lg:tracking-normal md:text-left md:text-xxs sm:items-start">
        <span>{t(enTextOrLocalizationPath)}</span>
        {Boolean(link) && (
          <div className="flex cursor-pointer items-center gap-2">
            {link?.isExternal ? (
              <button className="underline" onClick={onOpenLeavingOsmosis}>
                {linkText}
              </button>
            ) : (
              <a
                className="underline"
                href={link?.url}
                rel="noreferrer"
                target="_blank"
              >
                {linkText}
              </a>
            )}
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
      {link?.isExternal && (
        <ExternalLinkModal
          url={link.url}
          onRequestClose={onCloseLeavingOsmosis}
          isOpen={isLeavingOsmosisOpen}
        />
      )}
    </div>
  );
};

const ExternalLinkModal: FunctionComponent<
  { url: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({ url, ...modalBaseProps }) => {
  const t = useTranslation();
  return (
    <ModalBase
      title={t("app.banner.externalLinkModalTitle")}
      className="!max-w-[400px]"
      {...modalBaseProps}
    >
      <div className="flex flex-col items-center pt-9">
        <p className="body2 rounded-2xl bg-osmoverse-900 p-5">
          {t("app.banner.externalLink")}{" "}
          <span className="text-wosmongton-300">{url}</span>
        </p>

        <p className="body2 border-gradient-neutral mt-2 rounded-[10px] border border-wosmongton-400 px-3 py-2 text-wosmongton-100">
          {t("app.banner.externalLinkDisclaimer")}
        </p>

        <div className="mt-4 flex w-full gap-3">
          <Button
            mode="secondary"
            className="whitespace-nowrap !px-3.5"
            onClick={modalBaseProps.onRequestClose}
          >
            {t("app.banner.backToOsmosis")}
          </Button>
          <a
            className={buttonCVA({
              mode: "primary",
            })}
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={modalBaseProps.onRequestClose}
          >
            {t("app.banner.goToSite")}
          </a>
        </div>
      </div>
    </ModalBase>
  );
};

const FrontierMigrationModal: FunctionComponent<
  ModalBaseProps & { onOpenSettings: () => void }
> = (props) => {
  const t = useTranslation();

  return (
    <ModalBase
      {...props}
      className="!max-w-lg bg-[#332133]"
      title={t("frontierMigration.introducingUnverifiedAssets")}
    >
      <span className="subtitle1 mx-auto mt-4 text-[#CBBDCB]">
        {t("frontierMigration.simplifiedExperience")}
      </span>

      <div className="mx-auto my-4 h-[235.55px] w-[200px]">
        <Image
          src="/images/osmosis-cowboy-woz.png"
          alt="Cowboy Woz"
          width={200}
          height={235.55}
        />
      </div>

      <div className="flex flex-col items-center">
        <div className="body2 flex flex-col gap-3">
          <p className="text-white-full">
            {t("frontierMigration.frontierHasNowMerged")}{" "}
            <span className="font-bold">app.osmosis.zone</span>.{" "}
            {t("frontierMigration.thisMeansManaging")}
          </p>
          <p className="text-white-full">
            {t("frontierMigration.commitmentToDecentralization")}
            <span className="font-bold">
              {" "}
              {t("frontierMigration.settingIsNowEnabled")}
            </span>{" "}
            {t("frontierMigration.youMayDisable")}
          </p>
        </div>

        <div className="mt-6 flex w-full items-center gap-3">
          <Button
            size="sm"
            mode="secondary"
            className="whitespace-nowrap border-[#DFA12A] !px-3.5 hover:border-[#EAC378]"
            onClick={() => {
              props.onOpenSettings();
              props.onRequestClose?.();
            }}
          >
            {t("frontierMigration.openSettings")}
          </Button>
          <Button
            size="sm"
            mode="primary"
            className="whitespace-nowrap border-[#DFA12A] bg-[#DFA12A] !px-3.5 text-black hover:border-[#EAC378] hover:bg-[#EAC378]"
            onClick={props.onRequestClose}
          >
            {t("frontierMigration.proceed")}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};
