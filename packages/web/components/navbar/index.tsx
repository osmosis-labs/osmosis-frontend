import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { queryOsmosisCMS } from "@osmosis-labs/server";
import {
  formatICNSName,
  getDeepValue,
  noop,
  shorten,
} from "@osmosis-labs/utils";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Fragment,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocalStorage } from "react-use";

import { Icon } from "~/components/assets";
import { IconButton } from "~/components/buttons/icon-button";
import { ClientOnly } from "~/components/client-only";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { MainLayoutMenu, MainMenu } from "~/components/main-menu";
import { useOneClickProfileTooltip } from "~/components/one-click-trading/one-click-trading-toast";
import { PrivateText } from "~/components/privacy";
import { Tooltip } from "~/components/tooltip";
import { CustomClasses } from "~/components/types";
import { Button } from "~/components/ui/button";
import { useDisclosure, useTranslation } from "~/hooks";
import { useOneClickTradingSession } from "~/hooks/one-click-trading/use-one-click-trading-session";
import { useICNSName } from "~/hooks/queries/osmosis/use-icns-name";
import { useAssetAlerts } from "~/hooks/use-asset-alerts";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { usePreviousConnectedCosmosAccount } from "~/hooks/use-previous-connected-cosmos-account";
import { useWalletSelect } from "~/hooks/use-wallet-select";
import { SettingsModal, useGlobalIs1CTIntroModalScreen } from "~/modals";
import {
  ExternalLinkModal,
  handleExternalLink,
} from "~/modals/external-links-modal";
import { ProfileModal } from "~/modals/profile";
import { useStore } from "~/stores";
import { useNavBarStore } from "~/stores/nav-bar-store";
import { useProfileStore } from "~/stores/profile-store";
import { useUserSettingsStore } from "~/stores/user-settings-store";
import { theme } from "~/tailwind.config";
import {
  CMSBannerFields,
  getMatchedSymbolsText,
  interpolateBannerText,
} from "~/utils/asset-alerts";
import { api } from "~/utils/trpc";
import { removeQueryParam } from "~/utils/url";

export const NavBar: FunctionComponent<
  {
    title?: string;
    backElementClassNames?: string;
    menus: MainLayoutMenu[];
    secondaryMenuItems: MainLayoutMenu[];
  } & CustomClasses
> = observer(
  ({
    title: titleProp,
    className,
    backElementClassNames,
    menus,
    secondaryMenuItems,
  }) => {
    const {
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
    } = useStore();
    const {
      title: navBarTitle,
      callToActionButtons,
      visibleBannerHeight,
      setVisibleBannerHeight,
    } = useNavBarStore();
    const { t } = useTranslation();

    const featureFlags = useFeatureFlags();

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
    const bannerStackRef = useRef<HTMLDivElement>(null);
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
        useUserSettingsStore.getState().setShowUnverifiedAssets(true);
        removeQueryParam(UnverifiedAssetsQueryKey);
      }
    }, [router.query]);

    const wallet = accountStore.getWallet(chainId);

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

    // Denom-gated asset alerts (fe-content cms/asset-alerts.json), shown only
    // to wallets holding an affected denom. Dismissal is persisted per alert
    // under its localStorageKey, matching the announcement banner convention.
    // Keep the global announcement surface bounded. Surplus alerts wait until
    // an earlier alert is dismissed or expires.
    const { visibleAlerts, dismissAlert } = useAssetAlerts();
    const visibleAssetAlerts = visibleAlerts.slice(
      0,
      MAX_STACKED_BANNERS - (showBanner ? 1 : 0)
    );

    // Banners can wrap as copy, locale, and viewport width change. Measure the
    // rendered stack so both in-flow and fixed page content use its real height.
    useEffect(() => {
      const bannerStack = bannerStackRef.current;
      if (!bannerStack) return;

      const updateBannerHeight = () => {
        setVisibleBannerHeight(
          Math.ceil(bannerStack.getBoundingClientRect().height)
        );
      };

      updateBannerHeight();
      window.addEventListener("resize", updateBannerHeight);

      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(updateBannerHeight);
      resizeObserver?.observe(bannerStack);

      return () => {
        resizeObserver?.disconnect();
        window.removeEventListener("resize", updateBannerHeight);
        setVisibleBannerHeight(0);
      };
    }, [setVisibleBannerHeight]);

    const handleTradeClicked = () => {
      // logEvent(EventName.Topnav.tradeClicked);
    };

    const title = navBarTitle || titleProp;

    return (
      <>
        <div
          className={classNames(
            "fixed z-[60] flex h-navbar w-[calc(100vw_-_14.58rem)] place-content-between items-center bg-osmoverse-1000 px-8 shadow-md lg:gap-5 md:h-navbar-mobile md:w-full md:place-content-start md:px-4",
            className
          )}
        >
          <div className="relative hidden shrink-0 items-center md:flex">
            <Popover>
              {({ close: closeMobileMainMenu }) => {
                closeMobileMenuRef.current = closeMobileMainMenu;

                let mobileMenus = menus.concat({
                  label: t("menu.settings"),
                  link: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenSettings();
                    closeMobileMainMenu();
                  },
                  icon: <Icon id="setting" className="h-6 w-6" />,
                });

                return (
                  <>
                    <PopoverButton as={Fragment}>
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
                    </PopoverButton>
                    <PopoverPanel className="absolute top-full mt-4 flex w-52 flex-col gap-2 rounded-3xl bg-osmoverse-800 py-3 px-2">
                      <MainMenu
                        menus={mobileMenus}
                        secondaryMenuItems={secondaryMenuItems}
                      />
                      <ClientOnly>
                        <SkeletonLoader isLoaded={!isWalletLoading}>
                          <WalletInfo onOpenProfile={onOpenProfile} />
                        </SkeletonLoader>
                      </ClientOnly>
                    </PopoverPanel>
                  </>
                );
              }}
            </Popover>
          </div>
          <div className="flex shrink-0 grow items-center gap-9 lg:gap-2 md:place-content-between md:gap-1">
            {title && <h4 className="md:text-h6 md:font-h6">{title}</h4>}
            <div className="flex items-center gap-3 lg:gap-1">
              {callToActionButtons.map(({ className, ...rest }, index) => (
                <Button
                  size="md"
                  {...rest}
                  className={classNames("w-48 1.5lg:w-fit", className)}
                  variant={index > 0 ? "outline" : "default"}
                  key={index}
                >
                  <span className="subtitle1 mx-auto">{rest.label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 lg:gap-2 md:hidden">
            {featureFlags.tfmProTradingNavbarButton && (
              <div className="group">
                <a href="https://pro.osmosis.zone">
                  <Button
                    className="subtitle2 group mr-0 flex !h-10 !w-40 transform items-center justify-center bg-osmoverse-700 px-12 font-semibold tracking-wide text-osmoverse-200 transition-all duration-300 ease-in-out hover:px-6"
                    style={{ maxWidth: "180px" }}
                    onClick={handleTradeClicked}
                    variant="ghost"
                  >
                    {t("menu.trade")}
                  </Button>
                </a>
              </div>
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
        <div className={classNames("bg-osmoverse-1000", backElementClassNames)}>
          <div className="h-navbar md:h-navbar-mobile" />
          <div style={{ height: visibleBannerHeight }} />
        </div>
        <div
          ref={bannerStackRef}
          className="fixed top-[71px] z-[51] ml-sidebar flex w-[calc(100vw_-_14.58rem)] flex-col md:top-[57px] md:ml-0 md:w-full"
        >
          {showBanner && (
            <AnnouncementBanner
              closeBanner={() => setShowBanner(false)}
              bannerResponse={topAnnouncementBannerData}
            />
          )}
          {visibleAssetAlerts.map((alert) => (
            <AnnouncementBanner
              key={alert.banner.localStorageKey}
              closeBanner={() => dismissAlert(alert.banner.localStorageKey)}
              bannerResponse={{
                isChainHalted: false,
                banner: alert.banner,
                localization: alert.localization,
              }}
              dismissible={!alert.banner.persistent}
              textInterpolations={{ symbols: getMatchedSymbolsText(alert) }}
            />
          ))}
        </div>
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
  const { accountStore } = useStore();
  const currentAvatar = useProfileStore((state) => state.currentAvatar);
  const { onOpenWalletSelect } = useWalletSelect();
  const { isOneClickTradingEnabled } = useOneClickTradingSession();
  const flags = useFeatureFlags();

  const [isOneClickIntroModalOpen] = useGlobalIs1CTIntroModalScreen();
  const [isOneClickProfileTooltipOpen, setIsOneClickProfileTooltipOpen] =
    useOneClickProfileTooltip();
  const { setPreviousConnectedCosmosAccount } =
    usePreviousConnectedCosmosAccount();

  const { t } = useTranslation();

  // wallet
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const walletConnected = Boolean(wallet?.isWalletConnected);

  const { data: userOsmoAsset, isLoading: isLoadingUserOsmoAsset } =
    api.edge.assets.getUserAsset.useQuery(
      {
        findMinDenomOrSymbol: "OSMO",
        userOsmoAddress: wallet?.address as string,
      },
      {
        enabled:
          Boolean(wallet?.address) && typeof wallet?.address === "string",
      }
    );

  useEffect(() => {
    if (walletConnected && wallet?.address) {
      setPreviousConnectedCosmosAccount(wallet.address);
    }
  }, [setPreviousConnectedCosmosAccount, wallet?.address, walletConnected]);

  return (
    <div className={className}>
      {!walletConnected ? (
        <Button
          size="md"
          onClick={() => {
            // logEvent([EventName.Topnav.connectWalletClicked]);
            onOpenWalletSelect({
              walletOptions: [
                { walletType: "cosmos", chainId: accountStore.osmosisChainId },
              ],
            });
          }}
        >
          <span className="button mx-auto">{t("connectWallet")}</span>
        </Button>
      ) : (
        <SkeletonLoader isLoaded={!isLoadingUserOsmoAsset}>
          <Tooltip
            visible={isOneClickProfileTooltipOpen && !isOneClickIntroModalOpen}
            interactive
            skipTrigger
            content={
              <div className="relative flex max-w-[240px] items-center gap-2">
                <IconButton
                  mode="unstyled"
                  size="unstyled"
                  aria-label="Close"
                  className={classNames(
                    "absolute -right-1 -top-1 z-50 w-fit cursor-pointer !py-0 text-osmoverse-400 hover:text-osmoverse-100",
                    className
                  )}
                  icon={<Icon id="close" width={18} height={18} />}
                  onClick={() => {
                    setIsOneClickProfileTooltipOpen(false);
                  }}
                />
                <Image
                  src="/images/1ct-small-icon.svg"
                  alt="1-Click Trading icon"
                  width={24}
                  height={24}
                />
                <div className="flex flex-col gap-1">
                  <h1 className="caption">
                    {t("oneClickTrading.profile.tooltipHeader")}
                  </h1>
                  <p className="caption text-osmoverse-300">
                    {t("oneClickTrading.profile.resetSession")}
                  </p>
                </div>
              </div>
            }
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOneClickProfileTooltipOpen(false);
                onOpenProfile();
              }}
              className="group flex place-content-between items-center gap-[13px] rounded-xl border border-osmoverse-700 px-1.5 py-1 hover:border-[1.3px] hover:border-wosmongton-300 hover:bg-osmoverse-800 md:w-full"
            >
              <div className="relative">
                {isOneClickTradingEnabled && flags.oneClickTrading && (
                  <>
                    <OneClickTradingRadialProgress />
                    <div className="absolute -bottom-0.5 -right-1">
                      <Image
                        src="/images/1ct-small-icon.svg"
                        alt="1-Click Trading Small Icon"
                        width={16}
                        height={16}
                      />
                    </div>
                  </>
                )}

                <div
                  className={classNames(
                    " h-8 w-8 shrink-0 overflow-hidden  bg-osmoverse-700 group-hover:bg-gradient-positive",
                    isOneClickTradingEnabled ? "rounded-full" : "rounded-md"
                  )}
                >
                  {currentAvatar === "ammelia" ? (
                    <Image
                      alt="Wosmongton profile"
                      src="/images/profile-ammelia.svg"
                      height={32}
                      width={32}
                    />
                  ) : (
                    <Image
                      alt="Wosmongton profile"
                      src="/images/profile-woz.svg"
                      height={32}
                      width={32}
                    />
                  )}
                </div>
              </div>

              <div className="flex w-full  flex-col truncate text-right leading-tight">
                <span className="body2 font-bold leading-4" title={icnsName}>
                  {Boolean(icnsName)
                    ? formatICNSName(icnsName)
                    : shorten(wallet?.address!)}
                </span>
                <span
                  data-testid="wallet-balance"
                  className="caption font-medium tracking-wider text-osmoverse-200"
                >
                  <PrivateText
                    text={
                      userOsmoAsset?.amount
                        ?.trim(true)
                        .maxDecimals(2)
                        .shrink(true)
                        .upperCase(true)
                        .toString() ?? ""
                    }
                  />
                </span>
              </div>
            </button>
          </Tooltip>
        </SkeletonLoader>
      )}
    </div>
  );
});

const OneClickTradingRadialProgress = observer(() => {
  const { oneClickTradingInfo, getTimeRemaining, getTotalSessionTime } =
    useOneClickTradingSession();
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    if (!oneClickTradingInfo) return;
    const updatePercentage = () => {
      const totalSessionTime = getTotalSessionTime();
      const timeRemaining = getTimeRemaining();

      const percentage = Math.max((timeRemaining / totalSessionTime) * 100, 0);

      setPercentage(percentage);
    };

    updatePercentage();

    // Update every 5 seconds
    const intervalId = setInterval(() => {
      updatePercentage();
    }, 5_000);

    return () => {
      clearInterval(intervalId);
    };
  }, [getTimeRemaining, getTotalSessionTime, oneClickTradingInfo]);

  return (
    <>
      <div className="absolute h-full w-full scale-[1.35] transform">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle
            className="origin-[50%_50%] rotate-45 transform transition-[stroke-dashoffset] duration-[0.35s]"
            strokeWidth="5"
            strokeLinecap="round"
            stroke="url(#grad1)"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            /**
             * Should be the circumference times the percentage
             * circumference × ((100 - progress)/100)
             */
            strokeDashoffset={`calc(251.2 * ((100 - ${percentage})/100))`}
            /**
             * Should be the circumference of the circle
             * circumference = 2πr = 2 * 3.14 * 40 = 251.2
             */
            strokeDasharray="251.2"
          ></circle>

          <defs>
            <linearGradient id="grad1" gradientTransform="rotate(90)">
              <stop offset="0.04%" stopColor={theme.colors.superfluid} />
              <stop offset="99.5%" stopColor={theme.colors.ammelia["600"]} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
});

interface TopAnnouncementBannerResponse {
  isChainHalted: boolean;
  banner:
    | (CMSBannerFields & {
        /** Only show the banner on this page route. */
        pageRoute?: string;
      })
    | null;
  localization?: Record<string, Record<string, any>>;
}

/** Most banners renderable at once, including the announcement banner. */
const MAX_STACKED_BANNERS = 3;

const AnnouncementBanner: FunctionComponent<{
  closeBanner: () => void;
  bannerResponse: TopAnnouncementBannerResponse;
  /** Overrides the default `!persistent && !isWarning` close-button rule. */
  dismissible?: boolean;
  /** Values for `{key}` placeholders in the banner text, e.g. `{symbols}`. */
  textInterpolations?: Record<string, string>;
}> = ({ closeBanner, bannerResponse, dismissible, textInterpolations }) => {
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
        "flex min-h-[53px] w-full items-center px-8 py-[14px] sm:gap-3 sm:px-2",
        {
          "bg-gradient-negative": isWarning,
          "bg-gradient-neutral": !isWarning,
        },
        bg
      )}
    >
      <div className="flex min-w-0 w-full flex-wrap place-content-center items-center gap-1.5 text-center text-subtitle1 lg:gap-1 lg:text-xs lg:tracking-normal md:text-left md:text-xxs sm:items-start">
        <span className="min-w-0 [overflow-wrap:anywhere]">
          {isChainHalted
            ? banner?.enTextOrLocalizationPath ?? ""
            : interpolateBannerText(
                getDeepValue<string>(
                  currentLanguageTranslations,
                  banner?.enTextOrLocalizationPath
                ) ??
                  banner?.enTextOrLocalizationPath ??
                  "",
                textInterpolations ?? {}
              )}
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
      {(dismissible ?? (!persistent && !isWarning)) && (
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
