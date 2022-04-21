import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import type { AppProps } from "next/app";
import { ToastContainer, Bounce } from "react-toastify";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { GetKeplrProvider } from "../hooks";
import { IbcNotifier } from "../stores/ibc-notifier";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GetKeplrProvider>
      <StoreProvider>
        <IbcNotifier />
        <MainLayout
          menus={[
            {
              label: "Trade",
              link: "/",
              icon: "/icons/trade.svg",
              iconSelected: "/icons/trade-selected.svg",
              selectionTest: /\/$/,
            },
            {
              label: "Pools",
              link: "/pools",
              icon: "/icons/pool.svg",
              iconSelected: "/icons/pool-selected.svg",
              selectionTest: /\/pools/,
            },
            {
              label: "Assets",
              link: "/assets",
              icon: "/icons/asset.svg",
              iconSelected: "/icons/asset-selected.svg",
              selectionTest: /\/assets/,
            },
            {
              label: "Stake",
              link: "https://wallet.keplr.app/#/osmosis/stake",
              icon: "/icons/ticket.svg",
            },
            {
              label: "Vote",
              link: "https://wallet.keplr.app/#/osmosis/governance",
              icon: "/icons/vote.svg",
            },
            {
              label: "Stats",
              link: "https://info.osmosis.zone",
              icon: "/icons/chart.svg",
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
