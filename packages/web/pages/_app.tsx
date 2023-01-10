import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import Head from "next/head";
import type { AppProps } from "next/app";
import { useMemo } from "react";
import { enableStaticRendering } from "mobx-react-lite";
import { ToastContainer, Bounce } from "react-toastify";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";
import { TempBanner } from "../components/alert/temp-banner";
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
  IS_HALTED,
  PromotedLBPPoolIds,
} from "../config";
import { useAmplitudeAnalytics } from "../hooks/use-amplitude-analytics";
import {
  setDefaultLanguage,
  setTranslations,
  useTranslation,
} from "react-multi-lang";

import en from "../localizations/en.json";
import { Formatted } from "../components/localization";
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

          <meta name="application-name" content="Osmosis" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Osmosis" />
          <meta name="description" content="" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta
            name="msapplication-config"
            content="/icons/browserconfig.xml"
          />
          <meta name="msapplication-TileColor" content="#282750" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#282750" />

          <link rel="apple-touch-icon" href="/icons/ios/100.png" />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/icons/touch-icon-ipad.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/icons/ios/152.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="167x167"
            href="/icons/ios/167.png"
          />

          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/icons/ios/32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/icons/ios/16.png"
          />
          <link rel="manifest" href="/manifest.json" />
          <link
            rel="mask-icon"
            href="/icons/safari-pinned-tab.svg"
            color="#5bbad5"
          />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
          />

          <meta name="twitter:card" content="summary" />
          <meta name="twitter:url" content="https://app.osmosis.zone" />
          <meta name="twitter:title" content="Osmosis" />
          <meta name="twitter:description" content="Osmosis" />
          <meta
            name="twitter:image"
            content="https://yourdomain.com/icons/android-chrome-192x192.png"
          />
          <meta name="twitter:creator" content="@DavidWShadow" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="PWA App" />
          <meta property="og:description" content="Best PWA App in the world" />
          <meta property="og:site_name" content="PWA App" />
          <meta property="og:url" content="https://yourdomain.com" />
          <meta
            property="og:image"
            content="https://yourdomain.com/icons/apple-touch-icon.png"
          />

          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_2048.png"
            sizes="2048x2732"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_1668.png"
            sizes="1668x2224"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_1536.png"
            sizes="1536x2048"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_1125.png"
            sizes="1125x2436"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_1242.png"
            sizes="1242x2208"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_750.png"
            sizes="750x1334"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/apple_splash_640.png"
            sizes="640x1136"
          />
        </Head>
        <OgpMeta />
        <IbcNotifier />
        {IS_FRONTIER && !IS_HALTED && (
          <TempBanner
            localStorageKey="show_frontier_banner"
            title={t("app.banner.title")}
            message={
              <>
                <Formatted
                  translationKey="app.banner.linkText"
                  components={{
                    "<text>": <></>,
                    "<link>": (
                      <a
                        className="items-center underline"
                        href="https://app.osmosis.zone/"
                        target="_self"
                      />
                    ),
                  }}
                />
              </>
            }
          />
        )}
        {IS_HALTED && (
          <TempBanner
            localStorageKey="show_halted_banner"
            shouldPersist
            title="Chain is halted"
            message="Transactions are temporarily disabled"
          />
        )}
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
