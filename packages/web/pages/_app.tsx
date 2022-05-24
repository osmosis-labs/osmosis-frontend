import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import { enableStaticRendering } from "mobx-react-lite";
import type { AppProps } from "next/app";
import { ToastContainer, Bounce } from "react-toastify";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";
import { Terms } from "../components/terms";
import { FrontierBanner } from "../components/alert/frontier-banner";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { GetKeplrProvider } from "../hooks";
import { IbcNotifier } from "../stores/ibc-notifier";
import { IS_FRONTIER } from "../config";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
enableStaticRendering(typeof window === "undefined");

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GetKeplrProvider>
      <StoreProvider>
        <IbcNotifier />
        <Terms />
        <FrontierBanner />
        <MainLayout
          menus={[
            {
              label: "Trade",
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
              link: "https://wallet.keplr.app/#/osmosis/stake",
              icon: IS_FRONTIER
                ? "/icons/ticket-white.svg"
                : "/icons/ticket.svg",
            },
            {
              label: "Vote",
              link: "https://wallet.keplr.app/#/osmosis/governance",
              icon: IS_FRONTIER ? "/icons/vote-white.svg" : "/icons/vote.svg",
            },
            {
              label: "Info",
              link: "https://info.osmosis.zone",
              icon: IS_FRONTIER ? "/icons/chart-white.svg" : "/icons/chart.svg",
            },
          ]}
        >
          <Component {...pageProps} />
          <ToastContainer transition={Bounce} />
        </MainLayout>
      </StoreProvider>
    </GetKeplrProvider>
  );
}

export default MyApp;
