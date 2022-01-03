import "../styles/globals.css";
import type { AppProps } from "next/app";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
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
      </MainLayout>
    </StoreProvider>
  );
}

export default MyApp;
