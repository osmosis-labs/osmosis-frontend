import "../styles/globals.css"; // eslint-disable-line no-restricted-imports
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css

import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import { withLDProvider } from "launchdarkly-react-client-sdk";
import { enableStaticRendering, observer } from "mobx-react-lite";
import type { AppProps } from "next/app";
import Image from "next/image";
import { useRouter } from "next/router";
import { ComponentType, useMemo } from "react";
import { FunctionComponent } from "react";
import { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";

import { Icon } from "~/components/assets";
import ErrorBoundary from "~/components/error/error-boundary";
import ErrorFallback from "~/components/error/error-fallback";
import { Pill } from "~/components/indicators/pill";
import { MainLayout } from "~/components/layouts";
import { MainLayoutMenu } from "~/components/types";
import { AmplitudeEvent, EventName } from "~/config";
import {
  MultiLanguageProvider,
  useLocalStorageState,
  useTranslation,
} from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useNewApps } from "~/hooks/use-new-apps";
import { WalletSelectProvider } from "~/hooks/wallet-select";
import { ExternalLinkModal } from "~/modals";
import DefaultSeo from "~/next-seo.config";

import dayjsLocaleEs from "../localizations/dayjs-locale-es.js";
import dayjsLocaleKo from "../localizations/dayjs-locale-ko.js";
import en from "../localizations/en.json";
import LevanaLogo from "../public/logos/levana-logo.png";
import MarsLogo from "../public/logos/mars-logo.png";
import { StoreProvider, useStore } from "../stores";
import { IbcNotifier } from "../stores/ibc-notifier";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(updateLocale);
dayjs.updateLocale("es", dayjsLocaleEs);
dayjs.updateLocale("ko", dayjsLocaleKo);
enableStaticRendering(typeof window === "undefined");

const DEFAULT_LANGUAGE = "en";

function MyApp({ Component, pageProps }: AppProps) {
  useAmplitudeAnalytics({ init: true });

  return (
    <MultiLanguageProvider
      defaultLanguage={DEFAULT_LANGUAGE}
      defaultTranslations={{ en }}
    >
      <StoreProvider>
        <WalletSelectProvider>
          <DefaultSeo />
          <IbcNotifier />
          <ToastContainer
            toastStyle={{
              backgroundColor: "#2d2755",
            }}
            transition={Bounce}
          />
          <MainLayoutWrapper>
            <ErrorBoundary fallback={ErrorFallback}>
              {Component && <Component {...pageProps} />}
            </ErrorBoundary>
          </MainLayoutWrapper>
        </WalletSelectProvider>
      </StoreProvider>
    </MultiLanguageProvider>
  );
}

const MainLayoutWrapper: FunctionComponent<{ children: ReactNode }> = observer(
  ({ children }) => {
    const { t } = useTranslation();
    const flags = useFeatureFlags();
    const [apiData, setApiData] = useState<{
      allowed: boolean;
      countryCode: string;
    } | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
      async function fetchData() {
        try {
          const response = await axios.get(
            "https://geoblocked.levana.finance/"
          );
          setApiData(response.data);
        } catch (error) {
          setError(true); // in case the levana endpoint fails, we just show the menu without the geoblocked items
          throw Error("Failed to fetch geoblocked data");
        }
      }

      fetchData();
    }, []);

    const { accountStore, chainStore } = useStore();
    const osmosisWallet = accountStore.getWallet(chainStore.osmosis.chainId);
    // TODO: Take these out of the _app and put them in the main.tsx or navbar parent. They will not work if put in the mobile navbar.
    const [showExternalMarsModal, setShowExternalMarsModal] = useState(false);
    const [showExternalLevanaModal, setShowExternalLevanaModal] =
      useState(false);

    const menus = useMemo(() => {
      let conditionalMenuItems: (MainLayoutMenu | null)[] = [];

      if (!apiData && !error) {
        return [];
      }

      if (apiData?.allowed) {
        conditionalMenuItems.push(
          {
            label: t("menu.margin"),
            link: (e) => {
              e.preventDefault();
              setShowExternalMarsModal(true);
            },
            icon: <Icon id="margin" className="h-5 w-5" />,
            amplitudeEvent: [EventName.Sidebar.marginClicked] as AmplitudeEvent,
            secondaryLogo: (
              <Image src={MarsLogo} width={20} height={20} alt="mars logo" />
            ),
            subtext: t("menu.marsSubtext"),
          },
          {
            label: t("menu.perpetuals"),
            link: (e) => {
              e.preventDefault();
              setShowExternalLevanaModal(true);
            },
            icon: <Icon id="perps" className="h-5 w-5" />,
            amplitudeEvent: [EventName.Sidebar.perpsClicked] as AmplitudeEvent,
            secondaryLogo: (
              <Image src={LevanaLogo} width={20} height={20} alt="mars logo" />
            ),
            subtext: t("menu.levanaSubtext"),
          }
        );
      }

      let menuItems: (MainLayoutMenu | null)[] = [
        {
          label: t("menu.swap"),
          link: "/",
          icon: <Icon id="trade" className="h-5 w-5" />,
          selectionTest: /\/$/,
        },
        {
          label: t("menu.assets"),
          link: "/assets",
          icon: <Icon id="assets-pie-chart" className="h-5 w-5" />,
          selectionTest: /\/assets/,
        },
        flags.staking
          ? {
              label: t("menu.stake"),
              link: "/stake",
              icon: <Icon id="ticket" className="h-5 w-5" />,
              selectionTest: /\/stake/,
              isNew: true,
              amplitudeEvent: [
                EventName.Sidebar.stakeClicked,
              ] as AmplitudeEvent,
            }
          : {
              label: t("menu.stake"),
              link:
                osmosisWallet?.walletInfo?.stakeUrl ??
                "https://wallet.keplr.app/chains/osmosis",
              icon: <Icon id="ticket" className="h-5 w-5" />,
              amplitudeEvent: [
                EventName.Sidebar.stakeClicked,
              ] as AmplitudeEvent,
            },
        ...conditionalMenuItems,
        {
          label: t("menu.pools"),
          link: "/pools",
          icon: <Icon id="pool" className="h-5 w-5" />,
          selectionTest: /\/pools/,
        },
        {
          label: t("menu.store"),
          link: "/apps",
          icon: <Icon id="apps" className="h-5 w-5" />,
          selectionTest: /\/apps/,
          badge: <AppsBadge appsLink="/apps" />,
        },
        {
          label: t("menu.more"),
          icon: <Icon id="dots-three-vertical" className="h-5 w-5" />,
          link: "/",
          showMore: true,
        },
      ];

      return menuItems.filter(Boolean) as MainLayoutMenu[];
    }, [apiData, error, t, flags.staking, osmosisWallet?.walletInfo?.stakeUrl]);

    const secondaryMenuItems: MainLayoutMenu[] = [
      {
        label: t("menu.help"),
        link: "https://support.osmosis.zone/",
        icon: <Icon id="help-circle" className="h-5 w-5" />,
        amplitudeEvent: [EventName.Sidebar.supportClicked] as AmplitudeEvent,
      },
      {
        label: t("menu.vote"),
        link:
          osmosisWallet?.walletInfo?.governanceUrl ??
          "https://wallet.keplr.app/chains/osmosis?tab=governance",
        icon: <Icon id="vote" className="h-5 w-5" />,
        amplitudeEvent: [EventName.Sidebar.voteClicked] as AmplitudeEvent,
      },
      {
        label: t("menu.info"),
        link: "https://info.osmosis.zone",
        icon: <Icon id="chart" className="h-5 w-5" />,
        amplitudeEvent: [EventName.Sidebar.infoClicked] as AmplitudeEvent,
      },
      {
        label: t("menu.featureRequests"),
        link: "https://forum.osmosis.zone/c/site-feedback/2",
        icon: <Icon id="gift" className="h-5 w-5" />,
      },
    ];

    return (
      <MainLayout menus={menus} secondaryMenuItems={secondaryMenuItems}>
        {children}
        <ExternalLinkModal
          url="https://osmosis.marsprotocol.io/"
          isOpen={showExternalMarsModal}
          onRequestClose={() => {
            setShowExternalMarsModal(false);
          }}
        />
        <ExternalLinkModal
          url="https://trade.levana.finance/osmosis/trade/ATOM_USD"
          isOpen={showExternalLevanaModal}
          onRequestClose={() => {
            setShowExternalLevanaModal(false);
          }}
        />
      </MainLayout>
    );
  }
);

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

export default withLDProvider({
  clientSideID: process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID || "",
  user: {
    anonymous: true,
  },
  options: {
    bootstrap: "localStorage",
  },
  context: ldAnonymousContext,
})(MyApp as ComponentType<{}>);
