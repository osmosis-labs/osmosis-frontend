import "../styles/globals.css"; // eslint-disable-line no-restricted-imports
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import { withLDProvider } from "launchdarkly-react-client-sdk";
import { enableStaticRendering, observer } from "mobx-react-lite";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ComponentType, useMemo } from "react";
import { FunctionComponent } from "react";
import { ReactNode } from "react";
import { useEffect } from "react";
import {
  setDefaultLanguage,
  setTranslations,
  useTranslation,
} from "react-multi-lang";
import { Bounce, ToastContainer } from "react-toastify";

import { Icon } from "~/components/assets";
import ErrorBoundary from "~/components/error/error-boundary";
import ErrorFallback from "~/components/error/error-fallback";
import { Pill } from "~/components/indicators/pill";
import { MainLayout } from "~/components/layouts";
import { MainLayoutMenu } from "~/components/types";
import { AmplitudeEvent, EventName, PromotedLBPPoolIds } from "~/config";
import { useLocalStorageState } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useNewApps } from "~/hooks/use-new-apps";
import { WalletSelectProvider } from "~/hooks/wallet-select";
import DefaultSeo from "~/next-seo.config";

import dayjsLocaleEs from "../localizations/dayjs-locale-es.js";
import dayjsLocaleKo from "../localizations/dayjs-locale-ko.js";
import en from "../localizations/en.json";
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
setTranslations({ en });
setDefaultLanguage(DEFAULT_LANGUAGE);

function MyApp({ Component, pageProps }: AppProps) {
  useAmplitudeAnalytics({ init: true });

  return (
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
  );
}

const MainLayoutWrapper: FunctionComponent<{ children: ReactNode }> = observer(
  ({ children }) => {
    const t = useTranslation();
    const flags = useFeatureFlags();

    const { accountStore, chainStore } = useStore();
    const osmosisWallet = accountStore.getWallet(chainStore.osmosis.chainId);

    const menus = useMemo(() => {
      let menuItems: (MainLayoutMenu | null)[] = [
        {
          label: t("menu.swap"),
          link: "/",
          icon: "/icons/trade-white.svg",
          iconSelected: "/icons/trade-white.svg",
          selectionTest: /\/$/,
        },
        flags.staking
          ? {
              label: t("menu.stake"),
              link: "/stake",
              icon: "/icons/ticket-white.svg",
              iconSelected: "/icons/ticket-white.svg",
              selectionTest: /\/stake/,
              isNew: true,
              amplitudeEvent: [
                EventName.Sidebar.stakeClicked,
              ] as AmplitudeEvent,
            }
          : null,
        {
          label: t("menu.pools"),
          link: "/pools",
          icon: "/icons/pool-white.svg",
          iconSelected: "/icons/pool-white.svg",
          selectionTest: /\/pools/,
        },
        {
          label: t("menu.assets"),
          link: "/assets",
          icon: "/icons/asset-white.svg",
          iconSelected: "/icons/asset-white.svg",
          selectionTest: /\/assets/,
        },
        {
          label: t("menu.store"),
          link: "/apps",
          icon: "/icons/app-icon.svg",
          iconSelected: "/icons/app-icon.svg",
          selectionTest: /\/apps/,
          badge: <AppsBadge appsLink="/apps" />,
        },
      ];

      if (PromotedLBPPoolIds.length > 0) {
        menuItems.push({
          label: "Bootstrap",
          link: "/bootstrap",
          icon: "/icons/pool-white.svg",
          selectionTest: /\/bootstrap/,
        });
      }

      menuItems.push(
        flags.staking
          ? null
          : {
              label: t("menu.stake"),
              link:
                osmosisWallet?.walletInfo?.stakeUrl ??
                "https://wallet.keplr.app/chains/osmosis",
              icon: "/icons/ticket-white.svg",
              amplitudeEvent: [
                EventName.Sidebar.stakeClicked,
              ] as AmplitudeEvent,
            },
        {
          label: t("menu.vote"),
          link:
            osmosisWallet?.walletInfo?.governanceUrl ??
            "https://wallet.keplr.app/chains/osmosis?tab=governance",
          icon: "/icons/vote-white.svg",
          amplitudeEvent: [EventName.Sidebar.voteClicked] as AmplitudeEvent,
        },
        {
          label: t("menu.info"),
          link: "https://info.osmosis.zone",
          icon: "/icons/chart-white.svg",
          amplitudeEvent: [EventName.Sidebar.infoClicked] as AmplitudeEvent,
        },
        {
          label: t("menu.help"),
          link: "https://support.osmosis.zone/",
          icon: <Icon id="help-circle" className="h-5 w-5" />,
          amplitudeEvent: [EventName.Sidebar.supportClicked] as AmplitudeEvent,
        },
        {
          label: t("menu.featureRequests"),
          link: "https://osmosis.canny.io/",
          icon: <Icon id="gift" className="h-5 w-5" />,
        }
      );

      return menuItems.filter(Boolean) as MainLayoutMenu[];
    }, [
      t,
      osmosisWallet?.walletInfo?.stakeUrl,
      osmosisWallet?.walletInfo?.governanceUrl,
      flags.staking,
    ]);

    return <MainLayout menus={menus}>{children}</MainLayout>;
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
