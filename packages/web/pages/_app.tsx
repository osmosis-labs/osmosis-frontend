import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import Head from "next/head";
import type { AppProps } from "next/app";
import { enableStaticRendering } from "mobx-react-lite";
import { ToastContainer, Bounce } from "react-toastify";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";
import { TempBanner } from "../components/alert/temp-banner";
import { OgpMeta } from "../components/ogp-meta";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { GetKeplrProvider, useMatomoAnalytics } from "../hooks";
import { IbcNotifier } from "../stores/ibc-notifier";
import { IS_FRONTIER, NavBarEvents } from "../config";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
enableStaticRendering(typeof window === "undefined");

function MyApp({ Component, pageProps }: AppProps) {
  const menus = [
    {
      label: "Swap",
      link: "/",
      icon: IS_FRONTIER ? "/icons/trade-white.svg" : "/icons/trade.svg",
      iconSelected: "/icons/trade-selected.svg",
      selectionTest: /\/$/,
    },
    {
      label: "Pools",
      link: "/pools",
      icon: IS_FRONTIER ? "/icons/pool-white.svg" : "/icons/pool.svg",
      iconSelected: "/icons/pool-selected.svg",
      selectionTest: /\/pools/,
    },
    {
      label: "Assets",
      link: "/assets",
      icon: IS_FRONTIER ? "/icons/asset-white.svg" : "/icons/asset.svg",
      iconSelected: "/icons/asset-selected.svg",
      selectionTest: /\/assets/,
    },
    {
      label: "Stake",
      link: "https://wallet.keplr.app/chains/osmosis",
      icon: IS_FRONTIER ? "/icons/ticket-white.svg" : "/icons/ticket.svg",
      userAnalyticsEvent: NavBarEvents.stakeLink,
    },
    {
      label: "Vote",
      link: "https://wallet.keplr.app/chains/osmosis?tab=governance",
      icon: IS_FRONTIER ? "/icons/vote-white.svg" : "/icons/vote.svg",
      userAnalyticsEvent: NavBarEvents.voteLink,
    },
    {
      label: "Info",
      link: "https://info.osmosis.zone",
      icon: IS_FRONTIER ? "/icons/chart-white.svg" : "/icons/chart.svg",
      userAnalyticsEvent: NavBarEvents.infoLink,
    },
  ];

  useMatomoAnalytics({ init: true });

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
        {IS_FRONTIER && (
          <TempBanner
            localStorageKey="show_frontier_banner"
            title="You're viewing all permissionless assets"
            message={
              <>
                You{"'"}re viewing all permissionless assets.{" "}
                <a
                  className="items-center underline"
                  href="https://app.osmosis.zone/"
                  target="_self"
                >
                  Click here to return to the main app
                </a>
                .
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
