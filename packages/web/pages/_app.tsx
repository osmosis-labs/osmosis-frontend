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
  // AmplitudeEvent,
  // EventName,
  IS_FRONTIER,
  IS_HALTED,
  // PromotedLBPPoolIds,
} from "../config";
// import { useAmplitudeAnalytics } from "../hooks/use-amplitude-analytics";
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
      // {
      //   label: t("menu.pools"),
      //   link: "/pools",
      //   icon: "/icons/pool-white.svg",
      //   iconSelected: "/icons/pool-white.svg",
      //   selectionTest: /\/pools/,
      // },
      // {
      //   label: t("menu.assets"),
      //   link: "/assets",
      //   icon: "/icons/asset-white.svg",
      //   iconSelected: "/icons/asset-white.svg",
      //   selectionTest: /\/assets/,
      // },
    ];

    m.push({
      label: t("Discord"),
      link: "https://discord.gg/XBdKqyTa",
      icon: "/icons/discord.svg",
    });

    // m.push(
    //   {
    //     label: t("menu.stake"),
    //     link: "https://wallet.keplr.app/chains/osmosis",
    //     icon: "/icons/ticket-white.svg",
    //     amplitudeEvent: [EventName.Sidebar.stakeClicked] as AmplitudeEvent,
    //   },

    // m.push(
    //   {
    //     label: t("menu.stake"),
    //     link: "https://wallet.keplr.app/chains/osmosis",
    //     icon: "/icons/ticket-white.svg",
    //     amplitudeEvent: [EventName.Sidebar.stakeClicked] as AmplitudeEvent,
    //   },
    //   {
    //     label: t("menu.vote"),
    //     link: "https://wallet.keplr.app/chains/osmosis?tab=governance",
    //     icon: "/icons/vote-white.svg",
    //     amplitudeEvent: [EventName.Sidebar.voteClicked] as AmplitudeEvent,
    //   },
    //   {
    //     label: t("menu.info"),
    //     link: "https://info.osmosis.zone",
    //     icon: "/icons/chart-white.svg",
    //     amplitudeEvent: [EventName.Sidebar.infoClicked] as AmplitudeEvent,
    //   }
    // );

    return m;
  }, [t]);

  // useAmplitudeAnalytics({ init: true });
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
