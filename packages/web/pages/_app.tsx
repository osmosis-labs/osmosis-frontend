import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import { withLDProvider } from "launchdarkly-react-client-sdk";
import { enableStaticRendering } from "mobx-react-lite";
import type { AppProps } from "next/app";
import { ComponentType, useMemo } from "react";
import {
  setDefaultLanguage,
  setTranslations,
  useTranslation,
} from "react-multi-lang";
import { Bounce, ToastContainer } from "react-toastify";

import { Icon } from "~/components/assets";
import ErrorBoundary from "~/components/error/error-boundary";
import ErrorFallback from "~/components/error/error-fallback";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { WalletSelectProvider } from "~/hooks/wallet-select";
import DefaultSeo from "~/next-seo.config";

import { MainLayout } from "../components/layouts";
import { MainLayoutMenu } from "../components/types";
import {
  AmplitudeEvent,
  EventName,
  IS_FRONTIER,
  PromotedLBPPoolIds,
} from "../config";
import { useAmplitudeAnalytics } from "../hooks/use-amplitude-analytics";
import dayjsLocaleEs from "../localizations/dayjs-locale-es.js";
import dayjsLocaleKo from "../localizations/dayjs-locale-ko.js";
import en from "../localizations/en.json";
import { StoreProvider } from "../stores";
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
  const t = useTranslation();
  const flags = useFeatureFlags();
  const menus = useMemo(() => {
    let menuItems: MainLayoutMenu[] = [
      {
        label: t("menu.swap"),
        link: "/",
        icon: "/icons/trade-white.svg",
        iconSelected: "/icons/trade-white.svg",
        selectionTest: /\/$/,
      },
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
      {
        label: t("menu.stake"),
        link: "https://wallet.keplr.app/chains/osmosis",
        icon: "/icons/ticket-white.svg",
        amplitudeEvent: [EventName.Sidebar.stakeClicked] as AmplitudeEvent,
      },
      {
        label: t("menu.vote"),
        link: "https://wallet.keplr.app/chains/osmosis?tab=governance",
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
      }
    );

    if (flags.staking) {
      menuItems = menuItems.map((item) => {
        if (item.link === "https://wallet.keplr.app/chains/osmosis") {
          return {
            label: t("menu.stake"),
            link: "/stake",
            icon: "/icons/ticket-white.svg",
            iconSelected: "/icons/ticket-white.svg",
            selectionTest: /\/stake/,
            isNew: true,
          };
        } else {
          return item;
        }
      });
    }

    return menuItems;
  }, [t, flags]);

  useAmplitudeAnalytics({ init: true });

  return (
    <StoreProvider>
      <WalletSelectProvider>
        <DefaultSeo />
        <IbcNotifier />
        <ToastContainer
          toastStyle={{
            backgroundColor: IS_FRONTIER ? "#2E2C2F" : "#2d2755",
          }}
          transition={Bounce}
        />
        <MainLayout menus={menus}>
          <ErrorBoundary fallback={<ErrorFallback />}>
            {Component && <Component {...pageProps} />}
          </ErrorBoundary>
        </MainLayout>
      </WalletSelectProvider>
    </StoreProvider>
  );
}

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
