import { logEvent } from "@amplitude/analytics-browser";
import { Popover } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, FunctionComponent, useEffect, useRef } from "react";
import { useLocalStorage } from "react-use";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import ClientOnly from "~/components/client-only";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { MainMenu } from "~/components/main-menu";
import { CustomClasses, MainLayoutMenu } from "~/components/types";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics, useDisclosure } from "~/hooks";
import { useICNSName } from "~/hooks/queries/osmosis/use-icns-name";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useWalletSelect } from "~/hooks/wallet-select";
import {
  NotifiContextProvider,
  NotifiModal,
  NotifiPopover,
} from "~/integrations/notifi";
import { ModalBase, ModalBaseProps, SettingsModal } from "~/modals";
import {
  ExternalLinkModal,
  handleExternalLink,
} from "~/modals/external-links-modal";
import { ProfileModal } from "~/modals/profile";
import { queryOsmosisCMS } from "~/server/queries/osmosis/cms/query-osmosis-cms";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { noop } from "~/utils/function";
import { getDeepValue } from "~/utils/object";
import { formatICNSName, getShortAddress } from "~/utils/string";
import { api } from "~/utils/trpc";
import { removeQueryParam } from "~/utils/url";

export const NavBar: FunctionComponent<
  {
    title: string;
    backElementClassNames?: string;
    menus: MainLayoutMenu[];
    secondaryMenuItems: MainLayoutMenu[];
  } & CustomClasses
> = observer(
  ({ title, className, backElementClassNames, menus, secondaryMenuItems }) => {
    const {
      navBarStore,
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
      userSettings,
    } = useStore();
    const { t } = useTranslation();

    const featureFlags = useFeatureFlags();

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

    const closeMobileMenuRef = useRef(noop);
    const router = useRouter();
    const { isLoading: isWalletLoading } = useWalletSelect();

    /**
     * Fetches the top announcement banner from the osmosis-labs/fe-content repo
     * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/top-announcement-banner.json
     */
    const { data: topAnnouncementBannerData } = useQuery({
      queryKey: ["osmosis-top-announcement-banner"],
      queryFn: async () =>
        queryOsmosisCMS<TopAnnouncementBannerResponse>({
          filePath: "cms/top-announcement-banner.json",
        }),
      staleTime: 1000 * 60 * 3, // 3 minutes
      cacheTime: 1000 * 60 * 3, // 3 minutes
    });

    useEffect(() => {
      const handler = () => {
        closeMobileMenuRef.current();
      };

      router.events.on("routeChangeComplete", handler);
      return () => router.events.off("routeChangeComplete", handler);
    }, [router.events]);

    useEffect(() => {
      const UnverifiedAssetsQueryKey = "unverified_assets";
      if (router.query[UnverifiedAssetsQueryKey] === "true") {
        onOpenFrontierMigration();
        userSettings
          .getUserSettingById<UnverifiedAssetsState>("unverified-assets")
          ?.setState({ showUnverifiedAssets: true });
        removeQueryParam(UnverifiedAssetsQueryKey);
      }
    }, [onOpenFrontierMigration, onOpenSettings, router.query, userSettings]);

    const wallet = accountStore.getWallet(chainId);
    const walletSupportsNotifications =
      wallet?.walletInfo?.features?.includes("notifications");

    const { data: icnsQuery, isLoading: isLoadingICNSQuery } = useICNSName({
      address: wallet?.address ?? "",
    });

    // announcement banner
    const defaultBannerLocalStorageKey = "banner";
    const [_showBanner, setShowBanner] = useLocalStorage(
      topAnnouncementBannerData?.banner?.localStorageKey ??
        defaultBannerLocalStorageKey,
      true
    );

    const isBannerWithinDateRange =
      topAnnouncementBannerData?.banner &&
      (topAnnouncementBannerData.banner.startDate ||
        topAnnouncementBannerData.banner.endDate)
        ? dayjs().isBetween(
            topAnnouncementBannerData.banner.startDate,
            topAnnouncementBannerData.banner.endDate
          )
        : true; // if no start and end date, show banner always

    const showBanner =
      featureFlags.topAnnouncementBanner &&
      _showBanner &&
      !!topAnnouncementBannerData &&
      Boolean(topAnnouncementBannerData?.banner) &&
      isBannerWithinDateRange;

    const handleTradeClicked = () => {
      logEvent(EventName.Topnav.tradeClicked);
    };

    return (
      <>
        <div
          className={classNames(
            "fixed z-[60] flex h-navbar w-[calc(100vw_-_14.58rem)] place-content-between items-center bg-osmoverse-900 px-8 shadow-md lg:gap-5 md:h-navbar-mobile md:w-full md:place-content-start md:px-4",
            className
          )}
        >
          <div className="relative hidden shrink-0 items-center md:flex">
            <Popover>
              {({ close: closeMobileMainMenu }) => {
                closeMobileMenuRef.current = closeMobileMainMenu;

                let mobileMenus = menus.concat({
                  label: "Settings",
                  link: (e) => {
                    e.preventDefault();
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
                });

                if (featureFlags.notifications && walletSupportsNotifications) {
                  mobileMenus = mobileMenus.concat({
                    label: "Notifications",
                    link: (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!wallet) return;
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
                  });
                }

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
                        menus={mobileMenus}
                        secondaryMenuItems={secondaryMenuItems}
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
              {navBarStore.callToActionButtons.map(
                ({ className, ...rest }, index) => (
                  <Button
                    className={`h-fit w-[180px] lg:w-fit lg:px-2 ${
                      className ?? ""
                    }`}
                    mode={index > 0 ? "secondary" : undefined}
                    key={index}
                    size="sm"
                    {...rest}
                  >
                    <span className="subtitle1 mx-auto">{rest.label}</span>
                  </Button>
                )
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 lg:gap-2 md:hidden">
            {featureFlags.tfmProTradingNavbarButton && (
              <div className="group">
                <a href="https://pro.osmosis.zone">
                  <Button
                    className="subtitle2 group mr-0 flex !w-40 transform items-center justify-center whitespace-nowrap bg-osmoverse-700 px-12 font-semibold tracking-wide text-osmoverse-200 transition-all duration-300 ease-in-out hover:px-6"
                    mode="icon-primary"
                    size="unstyled"
                    style={{ maxWidth: "180px" }}
                    onClick={handleTradeClicked}
                  >
                    <Image
                      className="mr-1 inline-block w-0 opacity-0 transition-all duration-300 group-hover:w-6 group-hover:opacity-100"
                      height={24}
                      src="/images/tfm-logo.png"
                      width={24}
                      alt="TFM Logo"
                    />
                    {t("menu.trade")}
                  </Button>
                </a>
              </div>
            )}

            {featureFlags.notifications && walletSupportsNotifications && (
              <NotifiContextProvider>
                <NotifiPopover className="z-40 px-3 outline-none" />
                <NotifiModal
                  isOpen={isNotifiOpen}
                  onRequestClose={onCloseNotifi}
                  onOpenNotifi={onOpenNotifi}
                />
              </NotifiContextProvider>
            )}
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
            <ClientOnly>
              <SkeletonLoader
                isLoaded={
                  wallet?.isWalletConnected
                    ? !isWalletLoading && !isLoadingICNSQuery
                    : !isWalletLoading
                }
              >
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
            closeBanner={() => setShowBanner(false)}
            bannerResponse={topAnnouncementBannerData}
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
  }
);

const WalletInfo: FunctionComponent<
  CustomClasses & { onOpenProfile: () => void; icnsName?: string }
> = observer(({ className, onOpenProfile, icnsName }) => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    profileStore,
  } = useStore();
  const { onOpenWalletSelect } = useWalletSelect();

  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  // wallet
  const wallet = accountStore.getWallet(chainId);
  const walletConnected = Boolean(wallet?.isWalletConnected);

  const { data: userOsmoAsset, isLoading: isLoadingUserOsmoAsset } =
    api.edge.assets.getAsset.useQuery(
      {
        findMinDenomOrSymbol: "OSMO",
        userOsmoAddress: wallet?.address as string,
      },
      {
        enabled:
          Boolean(wallet?.address) && typeof wallet?.address === "string",
      }
    );

  return (
    <div className={className}>
      {!walletConnected ? (
        <Button
          className="!h-[42px] w-40 lg:w-36 md:w-full"
          onClick={() => {
            logEvent([EventName.Topnav.connectWalletClicked]);
            onOpenWalletSelect(chainId);
          }}
        >
          <span className="button mx-auto">{t("connectWallet")}</span>
        </Button>
      ) : (
        <SkeletonLoader isLoaded={!isLoadingUserOsmoAsset}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile();
            }}
            className="group flex place-content-between items-center gap-[13px] rounded-xl border border-osmoverse-700 px-1.5 py-1 hover:border-[1.3px] hover:border-wosmongton-300 hover:bg-osmoverse-800 md:w-full"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-osmoverse-700 group-hover:bg-gradient-positive">
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
                {userOsmoAsset?.amount
                  ?.trim(true)
                  .maxDecimals(2)
                  .shrink(true)
                  .upperCase(true)
                  .toString()}
              </span>
            </div>
          </button>
        </SkeletonLoader>
      )}
    </div>
  );
});

interface TopAnnouncementBannerResponse {
  isChainHalted: boolean;
  banner: {
    enTextOrLocalizationPath: string;
    localStorageKey?: string;
    pageRoute?: string;
    link?: {
      enTextOrLocalizationKey: string;
      url: string;
      isExternal: boolean;
    };
    isWarning?: boolean;
    persistent?: boolean;
    bg?: string;
    startDate?: string;
    endDate?: string;
  } | null;
  localization?: Record<string, Record<string, any>>;
}

const AnnouncementBanner: FunctionComponent<{
  closeBanner: () => void;
  bannerResponse: TopAnnouncementBannerResponse;
}> = ({ closeBanner, bannerResponse }) => {
  const { t, language } = useTranslation();
  const {
    isOpen: isLeavingOsmosisOpen,
    onClose: onCloseLeavingOsmosis,
    onOpen: onOpenLeavingOsmosis,
  } = useDisclosure();
  const router = useRouter();

  const isChainHalted = bannerResponse?.isChainHalted;
  const banner: TopAnnouncementBannerResponse["banner"] | null | undefined =
    isChainHalted
      ? {
          enTextOrLocalizationPath: t("app.banner.chainHalted"),
          isWarning: true,
        }
      : bannerResponse?.banner;

  if (!banner) return null;
  // If the banner has a pageRoute, only show it on that page
  if (
    banner.pageRoute &&
    router.pathname !== banner.pageRoute &&
    router.asPath !== banner.pageRoute
  )
    return null;

  const { isWarning, bg, link, persistent } = banner;

  const currentLanguageTranslations = bannerResponse?.localization?.[language];

  const linkText =
    getDeepValue<string>(
      currentLanguageTranslations,
      link?.enTextOrLocalizationKey
    ) ??
    link?.enTextOrLocalizationKey ??
    "Click here to learn more";

  const handleLeaveClick = () =>
    handleExternalLink({
      url: link?.url ?? "",
      openModal: onOpenLeavingOsmosis,
    });

  return (
    <div
      className={classNames(
        "fixed top-[71px] z-[51] float-right my-auto ml-sidebar flex w-[calc(100vw_-_14.58rem)] items-center px-8 py-[14px] md:top-[57px] md:ml-0 md:w-full sm:gap-3 sm:px-2",
        {
          "bg-gradient-negative": isWarning,
          "bg-gradient-neutral": !isWarning,
        },
        bg
      )}
    >
      <div className="flex w-full place-content-center items-center gap-1.5 text-center text-subtitle1 lg:gap-1 lg:text-xs lg:tracking-normal md:text-left md:text-xxs sm:items-start">
        <span>
          {isChainHalted
            ? banner?.enTextOrLocalizationPath ?? ""
            : getDeepValue<string>(
                currentLanguageTranslations,
                banner?.enTextOrLocalizationPath
              ) ?? banner?.enTextOrLocalizationPath}
        </span>
        {Boolean(link) && (
          <div className="flex cursor-pointer items-center gap-2">
            {link?.isExternal ? (
              <button className="underline" onClick={handleLeaveClick}>
                {linkText}
              </button>
            ) : (
              <a
                className="underline"
                href={link?.url}
                rel="noreferrer"
                // target="_blank"
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

const FrontierMigrationModal: FunctionComponent<
  ModalBaseProps & { onOpenSettings: () => void }
> = (props) => {
  const { t } = useTranslation();

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
