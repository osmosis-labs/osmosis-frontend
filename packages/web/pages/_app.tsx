import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import { useEffect } from "react";
import type { AppProps } from "next/app";
import { enableStaticRendering } from "mobx-react-lite";
import { ToastContainer, Bounce } from "react-toastify";
import init from "@socialgouv/matomo-next";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";
import { TempBanner } from "../components/alert/temp-banner";
import { OgpMeta } from "../components/ogp-meta";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { GetKeplrProvider } from "../hooks";
import { IbcNotifier } from "../stores/ibc-notifier";
import { IS_FRONTIER } from "../config";
import {
  setDefaultLanguage,
  setLanguage,
  setTranslations,
  useTranslation,
} from "react-multi-lang";

import en from "../localizations/en.json";
import fr from "../localizations/fr.json";
import { Formatted } from "../components/localization";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
enableStaticRendering(typeof window === "undefined");

const SUPPORTED_LANGUAGES = ["en", "fr"];
const DEFAULT_LANGUAGE = "en";
setTranslations({ en, fr });
setDefaultLanguage(DEFAULT_LANGUAGE);

function MyApp({ Component, pageProps }: AppProps) {
  const t = useTranslation();
  const menus = [
    {
      label: t("menu.swap"),
      link: "/",
      icon: IS_FRONTIER ? "/icons/trade-white.svg" : "/icons/trade.svg",
      iconSelected: "/icons/trade-selected.svg",
      selectionTest: /\/$/,
    },
    {
      label: t("menu.pools"),
      link: "/pools",
      icon: IS_FRONTIER ? "/icons/pool-white.svg" : "/icons/pool.svg",
      iconSelected: "/icons/pool-selected.svg",
      selectionTest: /\/pools/,
    },
    {
      label: t("menu.assets"),
      link: "/assets",
      icon: IS_FRONTIER ? "/icons/asset-white.svg" : "/icons/asset.svg",
      iconSelected: "/icons/asset-selected.svg",
      selectionTest: /\/assets/,
    },
    {
      label: t("menu.stake"),
      link: "https://wallet.keplr.app/chains/osmosis",
      icon: IS_FRONTIER ? "/icons/ticket-white.svg" : "/icons/ticket.svg",
    },
    {
      label: t("menu.vote"),
      link: "https://wallet.keplr.app/chains/osmosis?tab=governance",
      icon: IS_FRONTIER ? "/icons/vote-white.svg" : "/icons/vote.svg",
    },
    {
      label: t("menu.info"),
      link: "https://info.osmosis.zone",
      icon: IS_FRONTIER ? "/icons/chart-white.svg" : "/icons/chart.svg",
    },
  ];

  // matomo analytics
  useEffect(() => {
    if (IS_FRONTIER) {
      // only testing matomo on frontier for now
      init({
        url: "https://analyze.osmosis.zone/",
        siteId: "4",
      });
    }
  }, []);

  // Localization
  useEffect(() => {
    // get user language from navigator
    let navigatorLanguage = window.navigator.language;
    // formats can get: 'en-US', 'fr-FR', 'en-FR', 'fr', 'en', ...
    let userLanguage = SUPPORTED_LANGUAGES.find((language) =>
      navigatorLanguage.includes(language)
    );
    // default language is en, change only if it's different
    if (userLanguage && userLanguage != DEFAULT_LANGUAGE) {
      setLanguage(userLanguage);
    }
  }, []);

  return (
    <GetKeplrProvider>
      <StoreProvider>
        <OgpMeta />
        <IbcNotifier />
        {IS_FRONTIER && (
          <TempBanner
            localStorageKey="show_frontier_banner"
            title={t("app.banner.title")}
            message={
              <>
                <Formatted
                  translationKey="app.banner.linkText"
                  components={{
                    "<text>": <p className="items-center" />,
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
        <MainLayout menus={menus}>
          <Component {...pageProps} />
          <ToastContainer
            toastStyle={{
              backgroundColor: IS_FRONTIER ? "#2E2C2F" : "#2d2755",
            }}
            transition={Bounce}
          />
        </MainLayout>
      </StoreProvider>
    </GetKeplrProvider>
  );
}

export default MyApp;
