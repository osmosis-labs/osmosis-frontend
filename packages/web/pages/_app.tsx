import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import Head from "next/head";
import type { AppProps } from "next/app";
import { useMemo } from "react";
import { enableStaticRendering } from "mobx-react-lite";
import { ToastContainer, Bounce } from "react-toastify";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";
import { OgpMeta } from "../components/ogp-meta";
import { MainLayoutMenu } from "../components/types";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import updateLocale from "dayjs/plugin/updateLocale";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { GetKeplrProvider } from "../hooks";
import { IbcNotifier } from "../stores/ibc-notifier";
import {
  AmplitudeEvent,
  EventName,
  IS_FRONTIER,
  PromotedLBPPoolIds,
} from "../config";
import { useAmplitudeAnalytics } from "../hooks/use-amplitude-analytics";
import {
  setDefaultLanguage,
  setTranslations,
  useTranslation,
} from "react-multi-lang";
import spriteSVGURL from "../public/icons/sprite.svg";

import en from "../localizations/en.json";
import dayjsLocaleEs from "../localizations/dayjs-locale-es.js";
import dayjsLocaleKo from "../localizations/dayjs-locale-ko.js";

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
  const menus = useMemo(() => {
    let m: MainLayoutMenu[] = [
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
    ];

    if (PromotedLBPPoolIds.length > 0) {
      m.push({
        label: "Bootstrap",
        link: "/bootstrap",
        icon: "/icons/pool-white.svg",
        selectionTest: /\/bootstrap/,
      });
    }

    m.push(
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
      }
    );

    return m;
  }, [t]);

  useAmplitudeAnalytics({ init: true });
  return (
    <GetKeplrProvider>
      <StoreProvider>
        <Head>
          {/* metamask Osmosis app icon */}
          <link
            rel="shortcut icon"
            href={`${
              typeof window !== "undefined" ? window.origin : ""
            }/osmosis-logo-wc.png`}
          />
          <link rel="preload" as="image/svg+xml" href={spriteSVGURL} />
        </Head>
        <OgpMeta />
        <IbcNotifier />
        <ToastContainer
          toastStyle={{
            backgroundColor: IS_FRONTIER ? "#2E2C2F" : "#2d2755",
          }}
          transition={Bounce}
        />
        <MainLayout menus={menus}>
          <Component {...pageProps} />
        </MainLayout>
      </StoreProvider>
    </GetKeplrProvider>
  );
}

export default MyApp;
