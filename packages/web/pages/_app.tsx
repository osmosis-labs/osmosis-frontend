import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import "../styles/globals.css"; // eslint-disable-line no-restricted-imports

import { apiClient } from "@osmosis-labs/utils";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import { ProviderConfig, withLDProvider } from "launchdarkly-react-client-sdk";
import { enableStaticRendering, observer } from "mobx-react-lite";
import type { AppProps } from "next/app";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  ComponentType,
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Bounce, ToastContainer } from "react-toastify";
import { WagmiProvider } from "wagmi";

import { CypherCardToast } from "~/components/alert/cypher-card-toast";
import { Icon } from "~/components/assets";
import { ErrorFallback } from "~/components/error/error-fallback";
import { Pill } from "~/components/indicators/pill";
import { MainLayout } from "~/components/layouts";
import { MainLayoutMenu } from "~/components/main-menu";
import { AmplitudeEvent, EventName } from "~/config";
import { wagmiConfig } from "~/config/wagmi";
import {
  MultiLanguageProvider,
  useDisclosure,
  useLocalStorageState,
  useTranslation,
} from "~/hooks";
import { ImmersiveBridge } from "~/hooks/bridge";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useNewApps } from "~/hooks/use-new-apps";
import { WalletSelectProvider } from "~/hooks/use-wallet-select";
import { ExternalLinkModal, handleExternalLink } from "~/modals";
import { SEO } from "~/next-seo.config";
import { api, queryClientTRPC } from "~/utils/trpc";

// Note: for some reason, the above two icons were displaying black backgrounds when using sprite SVG.
import dayjsLocaleEs from "../localizations/dayjs-locale-es.js";
import dayjsLocaleKo from "../localizations/dayjs-locale-ko.js";
import en from "../localizations/en.json";
import { StoreProvider, useStore } from "../stores";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(updateLocale);
dayjs.extend(isBetween);
dayjs.extend(localizedFormat);
dayjs.updateLocale("es", dayjsLocaleEs);
dayjs.updateLocale("ko", dayjsLocaleKo);
enableStaticRendering(typeof window === "undefined");

const DEFAULT_LANGUAGE = "en";

function MyApp({ Component, pageProps }: AppProps) {
  useAmplitudeAnalytics({ init: true });

  return (
    <>
      <ReactQueryDevtools client={queryClientTRPC} />
      <WagmiProvider config={wagmiConfig}>
        <MultiLanguageProvider
          defaultLanguage={DEFAULT_LANGUAGE}
          defaultTranslations={{ en }}
        >
          <StoreProvider>
            <WalletSelectProvider>
              <ErrorBoundary fallback={<ErrorFallback />}>
                <SEO />
                <SpeedInsights />
                <ToastContainer
                  toastStyle={{
                    backgroundColor: "#2d2755",
                  }}
                  transition={Bounce}
                  newestOnTop
                />
                <MainLayoutWrapper>
                  {Component && <Component {...pageProps} />}
                </MainLayoutWrapper>
                <ImmersiveBridge />
              </ErrorBoundary>
            </WalletSelectProvider>
          </StoreProvider>
        </MultiLanguageProvider>
      </WagmiProvider>
    </>
  );
}

export interface LevanaGeoBlockedResponse {
  allowed: boolean;
  countryCode: string;
}

const MainLayoutWrapper: FunctionComponent<{
  children: ReactNode;
}> = observer(({ children }) => {
  const { t } = useTranslation();
  const flags = useFeatureFlags();
  const { data: levanaGeoblock, error } = useQuery(
    ["levana-geoblocked"],
    () =>
      apiClient<LevanaGeoBlockedResponse>("https://geoblocked.levana.finance/"),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      retry: false,
    }
  );

  const { accountStore, chainStore } = useStore();
  const osmosisWallet = accountStore.getWallet(chainStore.osmosis.chainId);
  // TODO: Take these out of the _app and put them in the main.tsx or navbar parent. They will not work if put in the mobile navbar.
  const {
    isOpen: isLeavingOsmosisToMarsOpen,
    onOpen: onOpenLeavingOsmosisToMars,
    onClose: onCloseLeavingOsmosisToMars,
  } = useDisclosure();
  const {
    isOpen: isLeavingOsmosisToLevanaOpen,
    onOpen: onOpenLeavingOsmosisToLevana,
    onClose: onCloseLeavingOsmosisToLevana,
  } = useDisclosure();

  const menus = useMemo(() => {
    let conditionalMenuItems: (MainLayoutMenu | null)[] = [];

    if (!flags._isInitialized) {
      return [];
    }

    if (!levanaGeoblock && !error) {
      return [];
    }

    if (levanaGeoblock?.allowed) {
      conditionalMenuItems.push(
        {
          label: t("menu.margin"),
          link: (e) => {
            e.preventDefault();
            handleExternalLink({
              url: "https://osmosis.marsprotocol.io/",
              openModal: onOpenLeavingOsmosisToMars,
            });
          },
          icon: <Icon id="margin" className="h-6 w-6" />,
          amplitudeEvent: [EventName.Sidebar.marginClicked] as AmplitudeEvent,
          secondaryLogo: (
            <Image
              src="/logos/mars-logo.png"
              width={24}
              height={24}
              alt="mars logo"
            />
          ),
          subtext: t("menu.marsSubtext"),
        },
        {
          label: t("menu.perpetuals"),
          link: (e) => {
            e.preventDefault();
            handleExternalLink({
              url: "https://trade.levana.finance/osmosis/trade/ATOM_USD?utm_source=Osmosis&utm_medium=SideBar&utm_campaign=Perpetuals",
              openModal: onOpenLeavingOsmosisToLevana,
            });
          },
          icon: <Icon id="perps" className="h-6 w-6" />,
          amplitudeEvent: [EventName.Sidebar.perpsClicked] as AmplitudeEvent,
          secondaryLogo: (
            <Image
              src="/logos/levana-logo.png"
              width={24}
              height={24}
              alt="mars logo"
            />
          ),
          subtext: t("menu.levanaSubtext"),
        }
      );
    }

    let menuItems: (MainLayoutMenu | null)[] = [
      {
        label: t("limitOrders.trade"),
        link: "/",
        icon: <Icon id="trade" className="h-6 w-6" />,
        selectionTest: /\/$/,
      },
      ...(flags.portfolioPageAndNewAssetsPage || flags.newAssetsPage
        ? [
            {
              label: t("menu.portfolio"),
              link: "/portfolio",
              icon: <Icon id="portfolio" className="h-6 w-6" />,
              selectionTest: /\/portfolio/,
            },
            {
              label: t("menu.assets"),
              link: "/assets",
              icon: <Icon id="assets" className="h-6 w-6" />,
              selectionTest: /\/assets/,
            },
          ]
        : [
            {
              label: t("menu.assets"),
              link: "/assets",
              icon: <Icon id="assets" className="h-6 w-6" />,
              selectionTest: /\/assets/,
            },
          ]),
      flags.earnPage
        ? {
            label: t("earnPage.title"),
            link: "/earn",
            icon: <Icon id="earn" className="h-6 w-6" />,
            selectionTest: /\/earn/,
          }
        : null,
      flags.staking
        ? {
            label: t("menu.stake"),
            link: "/stake",
            icon: <Icon id="ticket" className="h-6 w-6" />,
            selectionTest: /\/stake/,
            amplitudeEvent: [EventName.Sidebar.stakeClicked] as AmplitudeEvent,
          }
        : {
            label: t("menu.stake"),
            link:
              osmosisWallet?.walletInfo?.stakeUrl ??
              "https://wallet.keplr.app/chains/osmosis",
            icon: <Icon id="ticket" className="h-6 w-6" />,
            amplitudeEvent: [EventName.Sidebar.stakeClicked] as AmplitudeEvent,
          },
      ...conditionalMenuItems,
      {
        label: t("menu.pools"),
        link: "/pools",
        icon: <Icon id="pool" className="h-6 w-6" />,
        selectionTest: /\/pools/,
      },
      {
        label: t("menu.store"),
        link: "/apps",
        icon: <Icon id="apps" className="h-6 w-6" />,
        selectionTest: /\/apps/,
        badge: <AppsBadge appsLink="/apps" />,
      },
      {
        label: t("menu.more"),
        icon: <Icon id="dots-three-vertical" className="h-6 w-6" />,
        link: "/",
        showMore: true,
      },
    ];

    return menuItems.filter(Boolean) as MainLayoutMenu[];
  }, [
    levanaGeoblock,
    error,
    flags.earnPage,
    flags.staking,
    flags.portfolioPageAndNewAssetsPage,
    flags.newAssetsPage,
    flags._isInitialized,
    osmosisWallet?.walletInfo?.stakeUrl,
    t,
    onOpenLeavingOsmosisToLevana,
    onOpenLeavingOsmosisToMars,
  ]);

  const secondaryMenuItems = useMemo<MainLayoutMenu[]>(
    () => [
      {
        label: t("menu.help"),
        link: "https://support.osmosis.zone/",
        icon: <Icon id="help-circle" className="h-6 w-6" />,
        amplitudeEvent: [EventName.Sidebar.supportClicked] as AmplitudeEvent,
      },
      {
        label: t("menu.vote"),
        link:
          osmosisWallet?.walletInfo?.governanceUrl ??
          "https://wallet.keplr.app/chains/osmosis?tab=governance",
        icon: <Icon id="vote" className="h-6 w-6" />,
        amplitudeEvent: [EventName.Sidebar.voteClicked] as AmplitudeEvent,
      },
      {
        label: t("menu.info"),
        link: "https://www.datalenses.zone/chain/osmosis/overview",
        icon: <Icon id="chart" className="h-6 w-6" />,
        amplitudeEvent: [EventName.Sidebar.infoClicked] as AmplitudeEvent,
      },
      {
        label: t("menu.featureRequests"),
        link: "https://forum.osmosis.zone/c/site-feedback/2",
        icon: <Icon id="gift" className="h-6 w-6" />,
      },
    ],
    [t, osmosisWallet?.walletInfo?.governanceUrl]
  );

  return (
    <MainLayout menus={menus} secondaryMenuItems={secondaryMenuItems}>
      {children}
      <ExternalLinkModal
        url="https://osmosis.marsprotocol.io/"
        isOpen={isLeavingOsmosisToMarsOpen}
        onRequestClose={() => {
          onCloseLeavingOsmosisToMars();
        }}
      />
      <ExternalLinkModal
        url="https://trade.levana.finance/osmosis/trade/ATOM_USD?utm_source=Osmosis&utm_medium=SideBar&utm_campaign=Perpetuals"
        isOpen={isLeavingOsmosisToLevanaOpen}
        onRequestClose={() => {
          onCloseLeavingOsmosisToLevana();
        }}
      />
      {flags.cypherCard && <CypherCardToast />}
    </MainLayout>
  );
});

export const AppsBadge: FunctionComponent<{ appsLink: string }> = observer(
  ({ appsLink }) => {
    const { newApps, allApps } = useNewApps();
    const router = useRouter();
    const [viewedAppTitles, setViewedAppTitles] = useLocalStorageState<
      string[]
    >("viewed-apps", []);

    /**
     * Update the viewed app titles when the user navigates to the apps page.
     *
     * This is managed here instead of in `pages/apps/index.tsx` for the following reasons:
     *   1. It ensures immediate update of viewed app titles as the user navigates to the apps page.
     *      This avoids reliance on context, event emitters, or mobx to get the updated state within `AppsBadge`.
     *   2. It simplifies the code by avoiding state management in two files.
     *   3. It enhances the performance of the apps page by preventing unnecessary re-renders whenever
     *      the viewed app titles change.
     */
    useEffect(() => {
      if (router.pathname === appsLink && allApps.length > 0) {
        setViewedAppTitles(allApps.map((app) => app.title));
      }
    }, [router.pathname, newApps, setViewedAppTitles, allApps, appsLink]);

    if (
      newApps.length === 0 ||
      newApps.filter(
        ({ title }) =>
          !viewedAppTitles.some((viewedAppTitle) => viewedAppTitle === title)
      ).length === 0
    ) {
      return null;
    }

    return (
      <Pill className="!w-auto !px-0" animate>
        <span className="button px-3 py-[2px]">{newApps.length}</span>
      </Pill>
    );
  }
);

const ldAnonymousContext = {
  key: "SHARED-CONTEXT-KEY",
  anonymous: true,
};

const myID = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;

const isClientIdValid = Boolean(myID);

const ldConfig: ProviderConfig = {
  clientSideID: process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID || "",
  user: {
    anonymous: true,
  },
  options: {
    bootstrap: "localStorage",
  },
  context: ldAnonymousContext,
};

const LDWrappedApp = isClientIdValid
  ? withLDProvider(ldConfig)(MyApp as ComponentType<{}>)
  : MyApp;

export default api.withTRPC(LDWrappedApp);
